const { Pool } = require("pg");
const pool = new Pool({ host: "127.0.0.1", user: "app", database: "mywebapp" });

const migrate = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS inventory (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            quantity INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
  console.log("Migration finished");
  process.exit(0);
};

migrate();
