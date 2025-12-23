# MERN Comment System

This is a full-stack MERN application implementing a comment system with authentication, CRUD operations, likes/dislikes, sorting, pagination, and real-time updates using Socket.io.

## Features

- **Authentication**: JWT-based authentication (Login/Register).
- **Comments**: View, Add, Edit, Delete comments.
- **Interactions**: Like and Dislike comments (one vote per user).
- **Sorting**: Sort by Newest, Most Liked, Most Disliked.
- **Pagination**: Navigate through pages of comments.
- **Real-time**: Updates across clients using WebSockets (Socket.io).
- **Security**: Password hashing, JWT verification, authorized actions.

## Prerequisites

- Node.js installed
- MongoDB installed and running locally (or use Atlas URI)

## Installation and Setup

### 1. Backend Setup

Navigate to the `server` directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `server` directory with the following content:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/comment_system
JWT_SECRET=your_super_secret_key
```

Start the backend server:

```bash
npm run dev
```

The server will run on `http://localhost:5000`.

### 2. Frontend Setup

Navigate to the `client` directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

## Usage

1. Open the application in your browser.
2. Register a new account.
3. Login with your credentials.
4. Post comments, like/dislike, edit or delete your own comments.
5. Open the app in another tab/browser to see real-time updates.

## Technologies Used

- **MongoDB**: Database
- **Express.js**: Backend framework
- **React.js**: Frontend library (Vite)
- **Node.js**: Runtime environment
- **Socket.io**: Real-time communication
- **JWT**: Authentication
- **Bcryptjs**: Password hashing
