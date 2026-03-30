const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const pool = require("../db");

router.post("/buy", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, email: userEmail } = decoded;
    const { productName } = req.body;

    if (!productName)
      return res.status(400).json({ message: "Product required" });

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email to STORE
    await transporter.sendMail({
      from: `"StunnerLux Store" <${process.env.SMTP_USER}>`,
      to: process.env.STORE_EMAIL, // 👈 this is YOU
      subject: `New Purchase: ${productName}`,
      html: `<p>User <strong>${userEmail}</strong> purchased <strong>${productName}</strong>.</p>`,
    });

    // Optional: Email to USER as confirmation
    await transporter.sendMail({
      from: `"StunnerLux Store" <${process.env.SMTP_USER}>`,
      to: userEmail, // 👈 this is the customer's email
      subject: `Your Purchase Confirmation: ${productName}`,
      html: `<p>Hi ${userEmail},</p><p>Thank you for your purchase of <strong>${productName}</strong>!</p>`,
    });

    // Save order to database
    await pool.query(
      "INSERT INTO orders (user_id, product_name) VALUES ($1, $2)",
      [id, productName],
    );

    res.json({ message: `Purchase successful, email sent to store and user.` });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token or error sending email" });
  }
});

router.get("/history", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = decoded;

    const result = await pool.query(
      "SELECT product_name, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [id],
    );

    res.json({ orders: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
