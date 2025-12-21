require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/income", require("./routes/income"));
app.use("/api/expense", require("./routes/expense"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/employee", require("./routes/employee"));
app.use("/api/expense-category", require("./routes/expenseCategory"));
app.use("/api/monthly-summary", require("./routes/monthlySummary"));
app.use("/api/customer", require("./routes/customer"));

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
