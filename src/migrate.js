const { Pool } = require("pg");

const pool = new Pool({
  host: "127.0.0.1",
  user: "app",
  password: "12345678",
  database: "mywebapp",
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
