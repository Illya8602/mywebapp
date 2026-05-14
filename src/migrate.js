const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "app",
  password: process.env.DB_PASSWORD || "12345678",
  database: process.env.DB_NAME || "mywebapp",
  port: 5432,
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

async function runMigration() {
  try {
    await pool.query(createTableQuery);
    console.log("Таблиця 'inventory' успішно перевірена/створена.");
    process.exit(0);
  } catch (err) {
    console.error("Помилка міграції:", err);
    process.exit(1);
  }
}

runMigration();
