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

## Deployment (Free)

### Overview
- Host the backend (Node/Express + Socket.io) on **Render** (free Web Service).
- Host the frontend (React/Vite) on **Netlify** (free static hosting).
- Use **MongoDB Atlas** for a free database.
- Configure environment variables and CORS so sockets work across domains.

### 1) Prepare MongoDB Atlas
- Create an Atlas free cluster.
- Create a database user and keep the connection string.
- Allow access from 0.0.0.0/0 or your Render region.

### 2) Deploy Backend to Render
- Connect your repository in Render.
- Create a new Web Service pointing at `server/`.
- Set:
  - Root Directory: `server`
  - Build command: `npm install`
  - Start command: `npm start`
- Environment variables:
  - `PORT` (Render sets this automatically)
  - `MONGO_URI` (Atlas connection string)
  - `JWT_SECRET` (choose a strong secret)
  - `CLIENT_ORIGIN` (your Netlify site URL after deploy)
- Save and deploy. Copy your backend URL (e.g. `https://your-app.onrender.com`).
- If you see `npm ERR! enoent Could not read package.json`, Render is building the repository root. Fix by setting Root Directory to `server`, or add the included `render.yaml` blueprint and deploy from it.

### 3) Deploy Frontend to Netlify
- In Netlify, create a new site from `client/` directory.
- Set:
  - Build command: `npm run build`
  - Publish directory: `dist`
- Environment variables:
  - `VITE_API_URL` = your Render backend URL
  - `VITE_SOCKET_URL` = same Render backend URL
- Deploy and copy your Netlify site URL.

### 4) Update Backend CORS
- In Render service settings, set `CLIENT_ORIGIN` to your Netlify URL and redeploy.

### 5) Verify
- Open your Netlify site, login/register, post comments.
- Open the site in a second tab and confirm real-time updates via Socket.io.

### Notes
- Netlify hosts the static frontend; WebSockets are handled by the backend on Render.
- Ensure `VITE_API_URL` and `VITE_SOCKET_URL` point to the backend base URL.
