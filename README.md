# Expense Tracker - MERN Stack

A full-stack expense tracking application built with MongoDB, Express.js, React, and Node.js.

## Features

- 🔐 User Authentication (JWT)
- 💰 Income & Expense Management
- 📊 Dashboard with Charts
- 📈 Recent Transactions View
- 📥 Excel Export Functionality
- 🏢 Warehouse Management

## Tech Stack

**Frontend:**

- React 19
- React Router DOM
- TailwindCSS
- Vite
- Recharts
- Axios

**Backend:**

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

4. Configure your `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

5. Start the backend server:

```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):

```bash
cp .env .env
```

4. Configure your `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the frontend development server:

```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

## Deployment

### Backend (Railway/Render)

1. Create account on [Railway.app](https://railway.app) or [Render.com](https://render.com)
2. Create new project from GitHub repository
3. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT`
   - `FRONTEND_URL` (your Vercel frontend URL)

### Frontend (Vercel)

1. Create account on [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variable:
   - `VITE_API_URL` = Your backend URL (e.g., `https://your-app.railway.app/api`)

## Project Structure

```
expense-tracker/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware (auth, etc.)
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── .env.example    # Environment variables example
│   ├── server.js       # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/        # API configuration
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   └── App.jsx     # Main app component
│   ├── .env.example    # Environment variables example
│   └── package.json
└── README.md
```

## Environment Variables

### Backend (.env)

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env)

- `VITE_API_URL` - Backend API base URL

## License

MIT
