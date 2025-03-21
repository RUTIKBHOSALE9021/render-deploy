require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// PostgreSQL connection with SSL always enabled for production
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // In production, this disables certificate validation
  }
});

// Check DB Connection
(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Database connected successfully at:", res.rows[0].now);
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1); // Stop the server if the DB connection fails
  }
})();

// Create users table if it doesn't exist
pool.query(
  "CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT NOT NULL)",
  (err) => {
    if (err) console.error("Error creating table:", err);
  }
);

app.post("/users", async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query("INSERT INTO users (name) VALUES ($1) RETURNING *", [name]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
