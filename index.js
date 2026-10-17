require("dotenv").config();

const express = require("express");
const rootRouter = require("./routes/index");
const { connectDB } = require("./db");

const app = express();

// Turns the JSON text in a request into req.body. Must come before the routes.
app.use(express.json());

// A quick check that the server is alive
app.get("/", (req, res) => {
  res.json({ status: "KaasuPay backend is running" });
});

// Every API route starts with /api/v1
app.use("/api/v1", rootRouter);

// Error handler: must be after all routes, and must have 4 parameters
app.use((err, req, res, next) => {
  console.error(err); // full details, only in YOUR terminal
  res.status(500).json({ error: "Something went wrong on our side" });
});

async function start() {
  await connectDB(); // 1. database first
  app.listen(3000, () => { // 2. then open the door
    console.log("Server running on http://localhost:3000");
  });
}

start();