# Team Task Manager Backend

This is the Node.js/Express REST API backend for the Team Task Manager application.

## Tech Stack
- Node.js & Express
- MongoDB & Mongoose
- JSON Web Tokens (JWT) for authentication
- bcryptjs for password hashing

## Features
- Complete Role-Based Access Control (Admin/Member)
- JWT Authentication Flow
- Invites System
- Modular routing for Auth, Projects, Tasks, and Users
- Dynamic Task Progress and Overdue analytics
- Railway Deployment Ready

## Environment Setup
Create a `.env` file in the root of the backend folder:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

## Available Scripts
- `npm run dev` - Run the backend locally with nodemon
- `npm run build` - Compile TypeScript to JavaScript in `/dist` folder
- `npm start` - Run the compiled production build
- `npm run data:import` - Seed the database with sample users, projects, and tasks
- `npm run data:destroy` - Clear the database

## Railway Deployment
1. Connect your GitHub repository to Railway
2. Create a MongoDB database in Railway and copy the connection URL
3. In your Railway project variables, set up `MONGO_URI`, `JWT_SECRET`, and `FRONTEND_URL`
4. Railway will automatically detect the `railway.json` config and use the `npm run start` script.
