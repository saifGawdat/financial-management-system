# 💰 Expense Tracker - Enterprise Management System

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A robust, enterprise-grade financial management solution built with the MERN stack. Designed to streamline business operations, this platform offers comprehensive tracking for incomes, expenses, customers, and employees, all presented through a dynamic and intuitive dashboard.

---

## 🚀 Key Features

### 📊 Powerful Financial Dashboard

- **Real-time Analytics**: Instant visibility into net profit, total income, and expenditures.
- **Interactive Visualizations**: High-quality charts powered by **Recharts** for trend analysis.
- **Recent Transactions**: Quick view of latest financial activities.

### 👥 Customer Relationship Management (CRM)

- **Payment Tracking**: Specialized module to track monthly customer payments and brand history.
- **Status Indicators**: Visual cues (Paid/Unpaid) to manage accounts receivable efficiently.
- **Data Export**: Seamlessly export customer databases to **Excel (.xlsx)** for offline reporting.

### 👔 Human Resources (HR) & Payroll

- **Staff Records**: Centralized management for employee profiles and documentation.
- **Salary Tracking**: Dedicated system for tracking monthly salaries and transaction history.
- **Financial History**: Detailed log of all employee-related payouts.

### 📥 Enterprise Data Portability

- **Excel Export**: Integrated utility using `xlsx` to generate professional financial reports with a single click.

### 🔐 Security & Architecture

- **JWT Authentication**: Secure user sessions with JSON Web Tokens.
- **RESTful API**: Clean, documented backend routes for modular scalability.
- **Responsive Design**: Tailored for both desktop and mobile productivity using Tailwind CSS.

---

## 🛠 Tech Stack

### Frontend

- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Data Export:** XLSX Library
- **Authentication:** JWT-Decode, Axios

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Security:** Bcrypt (Hashing), JWT (Sessions)

---

## 📦 Project Structure

```text
expense-tracker/
├── backend/
│   ├── config/         # Database & environment configuration
│   ├── controllers/    # Business logic for all API routes
│   ├── middleware/     # Auth and error-handling middleware
│   ├── models/         # Mongoose schemas for MongoDB
│   ├── routes/         # Express API route definitions
│   └── server.js       # Backend entry point
├── frontend/
│   ├── src/
│   │   ├── api/        # Axios service configurations
│   │   ├── components/ # Reusable UI & Dashboard components
│   │   ├── pages/      # View components (Dashboard, HR, CRM)
│   │   ├── context/    # Global state management
│   │   └── utils/      # Helper functions (Formatting, Exports)
```

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### 🔧 Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Update your `.env` with your credentials:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### 🎨 Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```bash
   # Note: For Vite, use VITE_ prefix for environment variables
   echo "VITE_API_URL=http://localhost:5000/api" > .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🛣 Roadmap & Future Features

- [ ] **Multi-currency Support**: Handle various international currencies with real-time exchange rates.
- [ ] **AI Financial Insights**: Predictive analysis for expense forecasting.
- [ ] **PWA Integration**: Transform into a Progressive Web App for offline mobile usage.
- [ ] **Advanced Invoicing**: Generate and email PDFs directly to customers.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed by [Saif Gawdat](https://github.com/saifGawdat)** - _Passionate about building scalable full-stack solutions._
