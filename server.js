const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/order");

const app = express();

app.use(
  cors({
    origin: "*", // Temporarily allow all for testing - change to your Netlify URL later
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (req, res) => res.send("Backend is live!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use("/api/auth", authRoutes);
app.use("/api/order", orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});
