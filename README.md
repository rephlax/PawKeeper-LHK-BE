# PawKeeper API

[![Node.js](https://img.shields.io/badge/Node.js-v18-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.21-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v8.9-green)](https://www.mongodb.com/)

The PawKeeper API manages the data flow for the PawKeeper Application, providing endpoints for user management, pet information, and reviews.

## Features

- User authentication and management
- Pet information management
- Review system
- Real-time features using Socket.IO
- Comprehensive API documentation using Swagger

## Technology Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB (mongoose)
- **Authentication**: JWT, bcrypt
- **Real-time**: Socket.IO
- **Documentation**: Swagger UI
- **Security**: Helmet, rate limiting

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install

Create a .env file with required environment variables
Configuration
Required environment variables:

MONGODB_URI: MongoDB connection string
JWT_SECRET: Secret key for JWT authentication
PORT: Server port (default: 5005)
Running the Application
Development mode:
npm run dev
Production mode:
npm start
API Documentation
The API documentation is available at:

Local: <http://localhost:5005/pawkeeper/api-docs>
Production: <https://pawkeeper-lhk-be.onrender.com/api-docs>
Deployment
The API is deployed on Render and can be accessed at:
<https://pawkeeper-lhk-be.onrender.com/>

Contributors
Hernâni Silva
Kateryna Salata
Luke Farrel
