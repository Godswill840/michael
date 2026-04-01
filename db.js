const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

let pool;

if (process.env.DATABASE_URL) {
  // For hosted environments like Render
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Render PostgreSQL
  });
} else {
  // For local development
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
}

// Initialize database schema
const initializeDatabase = async () => {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    await pool.query(schema);
    console.log("Database schema initialized successfully");
  } catch (err) {
    console.error("Error initializing database schema:", err);
  }
};

// Run initialization
initializeDatabase();

module.exports = pool;
