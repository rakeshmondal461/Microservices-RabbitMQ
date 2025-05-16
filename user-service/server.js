const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

// Connect to local MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/user_db')
  .then(() => console.log('User Service: MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// User schema
const User = mongoose.model('User', new mongoose.Schema({
  id: Number,
  name: String
}));

// Publish to RabbitMQ
async function publishToQueue(message) {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const exchange = 'user_events';
  await channel.assertExchange(exchange, 'fanout', { durable: false });
  channel.publish(exchange, '', Buffer.from(JSON.stringify(message)));
  console.log('Sent:', message);
  setTimeout(() => connection.close(), 500);
}

// Register user
app.post('/register', async (req, res) => {
  const user = { id: Date.now(), name: req.body.name };
  await User.create(user);
  await publishToQueue({ event: 'UserRegistered', data: user });
  res.json(user);
});

app.listen(3001, () => console.log('User Service on port 3001'));