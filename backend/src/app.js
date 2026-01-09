const express = require("express");
const healthRoutes = require("./routes/healthRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const publicPaymentRoutes = require("./routes/paymentPublicRoutes");
const testRoutes = require("./routes/testRoutes");
const orderPublicRoutes = require("./routes/orderPublicRoutes");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001", 
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Api-Key", "X-Api-Secret"],
  })
);

app.use(express.json());
app.use(orderRoutes);
app.use(paymentRoutes);
app.use(publicPaymentRoutes);
app.use(orderPublicRoutes);
app.use(testRoutes);

app.use(healthRoutes);

module.exports = app;
