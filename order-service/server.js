const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");

const app = express();
app.use(express.json());

// Connect to local MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/order_db")
  .then(() => console.log("Order Service: MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Order schema
const Order = mongoose.model(
  "Order",
  new mongoose.Schema({
    userId: Number,
    orderBy:String
  })
);

// Consume from RabbitMQ
async function consumeQueue() {
  try {
    console.log("Connecting to RabbitMQ...");
    const connection = await amqp.connect("amqp://localhost");
    console.log("RabbitMQ connected");
    const channel = await connection.createChannel();
    const exchange = "user_events";
    const queue = "order_queue";

    // Assert exchange
    await channel.assertExchange(exchange, "fanout", { durable: false });
    console.log("Exchange asserted:", exchange);

    // Assert queue
    const q = await channel.assertQueue(queue, { durable: false });
    console.log("Queue asserted:", q.queue);

    // Bind queue to exchange
    await channel.bindQueue(q.queue, exchange, "");
    console.log("Queue bound to exchange");

    // Consume messages
    console.log("Waiting for messages in", q.queue);
    await channel.consume(
      q.queue,
      async (msg) => {
        try {
          console.log("Received message:", msg.content.toString());
          const event = JSON.parse(msg.content.toString());
          if (event.event === "UserRegistered") {
            await Order.create({
              userId: event.data.id,
              orderBy: event.data.name,
            });
            console.log("Order created for user:", event.data.id);
          }
          channel.ack(msg);
        } catch (error) {
          console.error("Error processing message:", error);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("RabbitMQ consumer error:", error);
    // Retry after 5 seconds
    setTimeout(consumeQueue, 5000);
  }
}

// Start consumer
consumeQueue();

// Get orders
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.listen(3002, () => console.log("Order Service on port 3002"));
