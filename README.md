# Microservices using RabbitMQ


## Prerequisites

- Node.js (v16 or higher)
- npm or yarn or pnpm
- Docker


## Running RabbitMQ

- Run the comaand from the root of the project:
```bash
# Run Docker Conatiner
docker-compose up --build
```
## Running the Application
- Navigate to each services and run each applications:
```bash
# Navigate and run
cd user-service
npm run dev

cd order-service
npm run dev

```

The application will be available at:
- User service app: http://localhost:3001
- Order service app: http://localhost:3002


```

- Try 
POST => http://localhost:3001/register
{"name":"Steve Rogers"}

GET => http://localhost:3002/orders




