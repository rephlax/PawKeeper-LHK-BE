# PawKeeper API

[![Node.js](https://img.shields.io/badge/Node.js-v18-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.21-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v8.9-green)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.8-blue)](https://socket.io/)

The PawKeeper API manages the data flow for the PawKeeper Application, a pet-sitting platform that connects pet owners with pet sitters. This RESTful API provides user authentication, real-time messaging, review system, pet management, and location-based services.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Socket.IO Events](#socketio-events)
- [Database Models](#database-models)
- [Security Features](#security-features)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Development Workflow](#development-workflow)
- [Contributors](#contributors)
- [Related Links](#related-links)

## Features

- **User Authentication & Management**
  - JWT-based authentication
  - Secure password hashing with bcrypt
  - User registration and login
  - User profile management
  - Protected routes with authentication middleware

- **Pet Management**
  - Create, read, update, and delete pet profiles
  - Pet information tracking (name, age, species, pictures)
  - Pet-owner relationship management

- **Review System**
  - Create and manage reviews
  - Rating system for sitters
  - Review history tracking

- **Real-time Communication**
  - WebSocket support via Socket.IO
  - Real-time messaging between users
  - Chat room management (private and group)
  - Typing indicators
  - Online user tracking
  - Message persistence in MongoDB

- **Location Services**
  - Location pin management
  - GeoJSON-based location storage
  - Service radius configuration
  - Service type categorization
  - Availability management

- **API Documentation**
  - Comprehensive Swagger/OpenAPI documentation
  - Interactive API testing interface

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO
- **Authentication**: JWT (jsonwebtoken)
- **Security**:
  - bcryptjs for password hashing
  - Helmet for security headers
  - express-rate-limit for rate limiting
- **Documentation**: Swagger UI (swagger-ui-express)
- **Middleware**:
  - CORS for cross-origin requests
  - Morgan for HTTP request logging
  - Cookie-parser for cookie handling
- **Environment**: dotenv for configuration
- **Deployment**: Render

## Project Structure

```text
PawKeeper-LHK-BE/
├── app.js                      # Express app configuration and middleware
├── server.js                   # Server entry point with Socket.IO setup
├── package.json                # Project dependencies and scripts
├── vercel.json                 # Vercel deployment configuration (if applicable)
│
├── config/
│   └── index.js               # Express middleware configuration
│
├── db/
│   └── index.js               # MongoDB connection setup
│
├── models/
│   ├── User.model.js          # User schema and model
│   ├── Pet.model.js           # Pet schema and model
│   ├── Message.model.js       # Message schema and model
│   ├── Review.model.js        # Review schema and model
│   ├── Room.model.js          # Chat room schema and model
│   └── LocationPin.model.js   # Location pin schema and model
│
├── routes/
│   ├── index.routes.js        # Main API routes
│   ├── user.routes.js         # User-related endpoints
│   ├── pet.routes.js          # Pet-related endpoints
│   ├── review.routes.js       # Review-related endpoints
│   ├── message.routes.js      # Message-related endpoints
│   ├── room.routes.js         # Room-related endpoints
│   └── location-pin.routes.js # Location pin endpoints
│
├── middlewares/
│   └── auth.middleware.js     # JWT authentication middleware
│
├── socket-handlers/
│   ├── index.js               # Socket.IO handler registration
│   ├── messageHandlers.js     # Message event handlers
│   ├── roomHandlers.js        # Room event handlers
│   ├── typingHandlers.js      # Typing indicator handlers
│   └── locationHandlers.js    # Location-related socket handlers
│
├── docs/
│   ├── index.js               # Swagger documentation entry point
│   ├── basicInfo.js           # API basic information
│   ├── servers.js             # API server configurations
│   ├── components.js          # Reusable API components
│   ├── tags.js                # API tags
│   └── paths/
│       ├── index.js           # API paths index
│       ├── User/              # User endpoint documentation
│       └── Pet/               # Pet endpoint documentation
│
├── services/
│   └── translationService.js  # Translation service (if applicable)
│
├── error-handling/
│   └── index.js               # Global error handling
│
└── coordinates.json           # Coordinate data (if applicable)
```

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd PawKeeper-LHK-BE
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   TOKEN_KEY=your_jwt_secret_key
   PORT=5005
   NODE_ENV=development
   ```

## Configuration

### Required Environment Variables

- `MONGODB_URI`: MongoDB connection string
  - Local: `mongodb://localhost:27017/pawkeeper`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/pawkeeper`
- `TOKEN_KEY`: Secret key for JWT authentication (use a strong, random string)
- `PORT`: Server port (default: 5005)
- `NODE_ENV`: Environment mode (`development` or `production`)

### CORS Configuration

The API is configured to accept requests from:

- `https://pawkeeper.netlify.app` (production frontend)
- `http://localhost:5173` (local development)
- `http://localhost:3000` (alternative local development)

## Running the Application

### Development Mode

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server on file changes.

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5005` (or the port specified in your `.env` file).

## API Endpoints

### Base URL

- **Local**: `http://localhost:5005`
- **Production**: `https://pawkeeper-lhk-be.onrender.com`

### Authentication Routes (`/users`)

Method | Endpoint | Description | Auth Required
------- | ---------- | ------------- | ---------------
GET | `/users` | Get all users | No
POST | `/users/signup` | Register a new user | No
POST | `/users/login` | Login user and get JWT token | No
GET | `/users/verify` | Verify JWT token | Yes
GET | `/users/user/:userId` | Get user by ID | Yes
PATCH | `/users/update-user/:userId` | Update user profile | Yes
DELETE | `/users/delete-user/:userId` | Delete user account | Yes

### Pet Routes (`/pets`)

Method | Endpoint | Description | Auth Required
------- | ---------- | ------------- | ---------------
GET | `/pets` | Get all pets | No
GET | `/pets/:userId` | Get all pets by user ID | No
GET | `/pets/:userId/:petId` | Get one pet of one user | No
POST | `/pets/:userId` | Create a new pet | Yes
PATCH | `/pets/:userId/:petId` | Update a pet | Yes
DELETE | `/pets/:userId/:petId` | Delete a pet | Yes

### Review Routes (`/reviews`)

Method | Endpoint | Description | Auth Required
------- | ---------- | ------------- | ---------------
GET | `/reviews/reviews/:userId` | Get all reviews for a user | No
POST | `/reviews/:userId` | Create a new review | Yes
PATCH | `/reviews/reviews/:userId/:reviewId` | Update a review | Yes

### Message Routes (`/messages`)

Method | Endpoint | Description | Auth Required
------- | ---------- | ------------- | ---------------
GET | `/messages` | Get all messages | Yes
GET | `/messages/:roomId` | Get messages for a room | Yes
POST | `/messages` | Create a new message | Yes

### Room Routes (`/rooms`)

Method | Endpoint | Description | Auth Required
------- | ---------- | ------------- | ---------------
GET | `/rooms` | Get all rooms | Yes
GET | `/rooms/:roomId` | Get room by ID | Yes
POST | `/rooms` | Create a new room | Yes
PATCH | `/rooms/:roomId` | Update a room | Yes
DELETE | `/rooms/:roomId` | Delete a room | Yes

### Location Pin Routes (`/api/location-pins`)

Method | Endpoint | Description | Auth Required
------- | ---------- | ------------- | ---------------
GET | `/api/location-pins` | Get all location pins | No
GET | `/api/location-pins/:pinId` | Get location pin by ID | No
POST | `/api/location-pins` | Create a new location pin | Yes
PATCH | `/api/location-pins/:pinId` | Update a location pin | Yes
DELETE | `/api/location-pins/:pinId` | Delete a location pin | Yes

### General Routes

Method | Endpoint | Description
------- | ---------- | ------------
GET | `/` | API health check
GET | `/health` | Health check endpoint for Render
GET | `/api` | API status endpoint
GET | `/debug-env` | Debug environment variables

## Socket.IO Events

### Authentication

Socket.IO connections require authentication via token in the handshake:

```javascript
socket.connect({
  auth: {
    token: "your_jwt_token"
  }
});
```

### Client → Server Events

Event | Description | Payload
------ | ----------- | -------
`start_private_chat` | Start a private chat with another user | `{ targetUserId: string }`
`create_room` | Create a new chat room | `{ name: string, type: string, participants: string[] }`
`join_room` | Join an existing chat room | `roomId: string`
`send_message` | Send a message to a room | `{ roomId: string, content: string }`
`get_rooms` | Get all rooms for the user | -
`get_online_users` | Get list of online users | -

### Server → Client Events

Event | Description | Payload
------ | ----------- | -------
`user_connected` | User connected to the server | `userId: string`
`user_disconnected` | User disconnected from the server | `userId: string`
`users_online` | List of online user IDs | `string[]`
`chat_invitation` | Invitation to a private chat | `{ roomId: string, invitedBy: string, invitedById: string }`
`room_invitation` | Invitation to a room | `{ roomId: string, roomName: string, invitedBy: string, invitedById: string }`
`room_created` | Room created successfully | `Room object`
`room_joined` | Successfully joined a room | `Room object`
`user_joined_room` | User joined a room | `{ roomId: string, user: User object }`
`receive_message` | Receive a new message | `{ id: string, content: string, sender: User object, timestamp: Date, roomId: string }`
`rooms_list` | List of user's rooms | `Room[]`
`error` | Error notification | `{ message: string, details?: string }`

## Database Models

### User Model

- `email`: String (required, unique)
- `password`: String (required, hashed)
- `username`: String (unique)
- `profilePicture`: String
- `ownedPets`: ObjectId (reference to Pet)
- `rate`: Number
- `location`: GeoJSON Point
- `rating`: Number
- `reviewsReceived`: ObjectId[] (reference to Review)
- `reviewsGiven`: ObjectId[] (reference to Review)
- `sitter`: Boolean (default: false)

### Pet Model

- `petName`: String (required)
- `petAge`: Number (required)
- `petSpecies`: String (required)
- `petPicture`: String
- `owner`: ObjectId (reference to User)

### Review Model

- `title`: String
- `description`: String
- `rating`: Number
- `creator`: ObjectId (reference to User)
- `reviewedUser`: ObjectId (reference to User)

### Message Model

- `chatRoom`: ObjectId (reference to Room)
- `sender`: ObjectId (reference to User)
- `content`: String (required)
- `timeStamp`: Date
- `read`: Boolean (default: false)

### Room Model

- `participants`: ObjectId[] (reference to User)
- `name`: String
- `type`: String (enum: "private", "group")
- `creator`: ObjectId (reference to User)
- `lastMessage`: ObjectId (reference to Message)
- `updatedAt`: Date
- `isActive`: Boolean
- `lastActive`: Date
- `readBy`: Array of `{ user: ObjectId, lastRead: Date }`

### LocationPin Model

- `user`: ObjectId (reference to User, required)
- `title`: String (required)
- `description`: String (required)
- `location`: GeoJSON Point (required)
- `serviceRadius`: Number (default: 10, min: 1, max: 50)
- `services`: String[] (enum: "Dog Walking", "Cat Sitting", "Pet Boarding", "Pet Grooming", "Reptile Care", "Bird Sitting")
- `availability`: String (enum: "Full Time", "Part Time", "Weekends Only")
- `hourlyRate`: Number (min: 0)
- `timestamps`: true (createdAt, updatedAt)

## Security Features

- **Password Security**
  - bcrypt hashing with 12 salt rounds
  - Passwords never stored in plain text

- **Authentication**
  - JWT token-based authentication
  - Token expiration (10 days)
  - Protected routes with middleware

- **HTTP Security**
  - Helmet.js for security headers
  - CORS configuration for allowed origins
  - Rate limiting (100 requests per 15 minutes globally, 50 for location endpoints)

- **Input Validation**
  - Mongoose schema validation
  - Error handling middleware
  - Request logging

- **Environment Security**
  - Environment variables for sensitive data
  - `.env` file excluded from version control

## API Documentation

The API documentation is available via Swagger UI:

- **Local**: <http://localhost:5005/pawkeeper>
- **Production**: <https://pawkeeper-lhk-be.onrender.com/pawkeeper>

The Swagger documentation includes:

- Complete API endpoint descriptions
- Request/response schemas
- Authentication requirements
- Example requests and responses
- Interactive API testing

## Deployment

The API is deployed on Render and can be accessed at:

**Base URL**: <https://pawkeeper-lhk-be.onrender.com/>

### Deployment Configuration

1. Set environment variables in Render dashboard:
   - `MONGODB_URI`
   - `TOKEN_KEY`
   - `PORT` (optional)
   - `NODE_ENV=production`

2. The application automatically:
   - Connects to MongoDB
   - Starts the HTTP server
   - Initializes Socket.IO
   - Serves Swagger documentation

### Health Check

The `/health` endpoint is available for monitoring:

```bash
curl https://pawkeeper-lhk-be.onrender.com/health
```

## Development Workflow

### Project Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with auto-reload (nodemon)

### Code Structure Guidelines

1. **Routes**: Define endpoints in `routes/` directory
2. **Models**: Define Mongoose schemas in `models/` directory
3. **Middleware**: Place custom middleware in `middlewares/` directory
4. **Socket Handlers**: Organize Socket.IO handlers in `socket-handlers/` directory
5. **Error Handling**: Use centralized error handling in `error-handling/`

### Adding New Features

1. Create model in `models/` if needed
2. Create routes in `routes/`
3. Add Swagger documentation in `docs/paths/`
4. Update Socket.IO handlers if real-time features needed
5. Test endpoints using Swagger UI or Postman

## Contributors

This project was developed as a collaborative effort by a 3-person team during the Ironhack Bootcamp - Module 3 Main Project.

- **Hernâni Silva**
- **Kateryna Salata**
- **Luke Farrel**

## Related Links

- **Frontend Repository**: [PawKeeper Frontend](https://github.com/rephlax/PawKeeper-LHK-FE)
- **Live Frontend**: [PawKeeper Live](https://pawkeeper.netlify.app)
- **API Base URL**: <https://pawkeeper-lhk-be.onrender.com/>
- **API Documentation**: <https://pawkeeper-lhk-be.onrender.com/pawkeeper>

---

**Note**: Make sure to keep your `.env` file secure and never commit it to version control. Add `.env` to your `.gitignore` file.
