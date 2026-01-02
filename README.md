# PawKeeper Backend API

A comprehensive backend server for PawKeeper, a pet-sitting platform that connects pet owners with pet sitters. This project was developed as part of the Ironhack Bootcamp (Module 3 Main Project) by a 3-person team. The RESTful API provides user authentication, real-time messaging, review system, and user management features.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Secure password hashing with bcrypt
  - User registration and login
  - Protected routes with authentication middleware

- **Real-time Communication**
  - WebSocket support via Socket.io
  - Real-time messaging between users
  - Chat room management
  - Typing indicators
  - Message persistence in MongoDB

- **User Management**
  - User profiles with location (GeoJSON)
  - Profile picture support
  - User roles (pet owner/sitter)
  - User rating system
  - User search and retrieval

- **Review System**
  - Create and manage reviews
  - Rating system for sitters
  - Review history tracking

- **Database**
  - MongoDB with Mongoose ODM
  - User, Message, Review, and Room models
  - Relationship management between entities

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for password hashing
- **Middleware**:
  - CORS for cross-origin requests
  - Morgan for HTTP request logging
  - Cookie-parser for cookie handling
- **Environment**: dotenv for configuration
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- MongoDB database (local or cloud instance like MongoDB Atlas)
- Git

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd PawKeeper-LHK-BE
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:

   ```env
   PORT=5005
   MONGODB_URI=your_mongodb_connection_string
   TOKEN_KEY=your_jwt_secret_key
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Or for production:

   ```bash
   npm start
   ```

The server will start on `http://localhost:5005` (or the port specified in your `.env` file).

## 📁 Project Structure

```text
PawKeeper-LHK-BE/
├── app.js                 # Express app configuration
├── server.js              # Server entry point with Socket.io setup
├── package.json           # Project dependencies
├── vercel.json           # Vercel deployment configuration
│
├── config/
│   └── index.js          # Express middleware configuration
│
├── db/
│   └── index.js          # MongoDB connection setup
│
├── models/
│   ├── User.model.js     # User schema and model
│   ├── Message.model.js  # Message schema and model
│   ├── Review.model.js   # Review schema and model
│   └── Room.model.js     # Chat room schema and model
│
├── routes/
│   ├── index.routes.js   # Main API routes
│   ├── user.routes.js    # User-related endpoints
│   └── review.routes.js  # Review-related endpoints
│
├── middlewares/
│   └── auth.middleware.js # JWT authentication middleware
│
├── socket-handlers/
│   ├── index.js          # Socket.io handler registration
│   ├── messageHandlers.js # Message event handlers
│   ├── roomHandlers.js   # Room event handlers
│   └── typingHandlers.js # Typing indicator handlers
│
└── error-handling/
    └── index.js          # Global error handling
```

## 🔌 API Endpoints

### Base URL

```text
http://localhost:5005
```

### Authentication Routes (`/users`)

Method | Endpoint | Description | Auth Required
------- | ---------- | ------------- | ---------------
POST | `/users/signup` | Register a new user | No
POST | `/users/login` | Login user and get JWT token | No
GET | `/users/verify` | Verify JWT token | Yes
GET | `/users` | Get all users | No
GET | `/users/user/:userId` | Get user by ID | Yes
PATCH | `/users/update-user/:userId` | Update user profile | Yes
DELETE | `/users/delete-user/:userId` | Delete user account | Yes

### Review Routes (`/reviews`)

Method | Endpoint | Description | Auth Required
------- | ---------- | ------------- | ---------------
GET | `/reviews/reviews/:userId` | Get all reviews for a user | No
POST | `/reviews/:userId` | Create a new review | Yes
PATCH | `/reviews/reviews/:userId/:reviewId` | Update a review | Yes

### General Routes (`/api`)

Method | Endpoint | Description
------- | ---------- | ------------
GET | `/api` | Health check endpoint

## 🔌 Socket.io Events

### Client → Server Events

- `send_message` - Send a message to a chat room

  ```javascript
  {
    roomId: "room_id",
    content: "message content"
  }
  ```

### Server → Client Events

- `receive_message` - Receive a new message

  ```javascript
  {
    id: "message_id",
    content: "message content",
    sender: { /* user object */ },
    timeStamp: "2024-01-01T00:00:00.000Z"
  }
  ```

- `error` - Error notification

### Authentication

Socket.io connections require authentication via token in the handshake:

```javascript
socket.connect({
  auth: {
    token: "your_jwt_token"
  }
});
```

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5005

# Database
MONGODB_URI=mongodb://localhost:27017/pawkeeper
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pawkeeper

# JWT Secret
TOKEN_KEY=your_super_secret_jwt_key_here

# CORS Origin (optional, defaults to production URL)
ORIGIN=https://pawkeeper.netlify.app
```

## 🚀 Deployment

### Vercel Deployment

This project is configured for deployment on Vercel:

1. **Install Vercel CLI** (optional)

   ```bash
   npm i -g vercel
   ```

2. **Deploy**

   ```bash
   vercel
   ```

3. **Set environment variables** in Vercel dashboard:
   - `MONGODB_URI`
   - `TOKEN_KEY`
   - `PORT` (optional)

The `vercel.json` file is already configured to handle both HTTP routes and Socket.io connections.

## 🔒 Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT token-based authentication
- Protected routes with authentication middleware
- CORS configuration for allowed origins
- Input validation and error handling
- Secure cookie handling

## 🧪 Development

### Running in Development Mode

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server on file changes.

### Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with auto-reload

## 📦 Dependencies

### Production Dependencies

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `socket.io` - Real-time communication
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `morgan` - HTTP request logger
- `cookie-parser` - Cookie parsing middleware

### Development Dependencies

- `nodemon` - Development server with auto-reload

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Authors

This project was developed as a collaborative effort by a 3-person team during the Ironhack Bootcamp - Module 3 Main Project.

**Team Members:**

- Luke Farrel
- Kateryna Salata
- Hernâni Silva

## 🔗 Related Links

- Frontend Repository: [PawKeeper Frontend](https://github.com/rephlax/PawKeeper-LHK-FE)
- Live Frontend: [PawKeeper Live](https://pawkeeper.netlify.app)

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

**Note**: Make sure to keep your `.env` file secure and never commit it to version control. Add `.env` to your `.gitignore` file.
