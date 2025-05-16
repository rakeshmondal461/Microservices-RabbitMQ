# Microservices using RabbitMQ


## Prerequisites

- Node.js (v16 or higher)
- npm or yarn or pnpm
- Docker


## Running the Application using Docker

```bash
# Start Firebase emulators
docker-compose up --build
```
The application will be available at:
- User service app: http://localhost:3001
- Order service app: http://localhost:3002


```

- Try 
POST => http://localhost:3001/register
{"name":"Steve Rogers"}

GET => http://localhost:3002/orders




