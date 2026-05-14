const express = require("express");
const { Pool } = require("pg");
const fs = require("fs");

const app = express();
app.use(express.json());

// 1. Налаштування: пріоритет змінним оточення (Docker), потім файлу, потім дефолту
let dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "app",
  password: process.env.DB_PASSWORD || "12345678",
  database: process.env.DB_NAME || "mywebapp",
  port: parseInt(process.env.DB_PORT) || 5432,
};

const port = process.env.PORT || 8000;

// Спроба зчитати файл конфігу, якщо він існує (для зворотної сумісності з Лабою 1)
try {
  if (fs.existsSync("/etc/mywebapp/config.json")) {
    const rawConfig = fs.readFileSync("/etc/mywebapp/config.json");
    const fileConfig = JSON.parse(rawConfig);
    dbConfig = { ...dbConfig, ...fileConfig.db };
  }
} catch (e) {
  console.log("Файл конфігу не зчитано, використовуємо змінні оточення");
}

const pool = new Pool(dbConfig);

// Допоміжна функція для форматування таблиці (залишаємо без змін)
const formatHtmlTable = (data) => {
  if (data.length === 0) return "<p>No data</p>";
  let html =
    "<table border='1'><tr>" +
    Object.keys(data[0])
      .map((k) => `<th>${k}</th>`)
      .join("") +
    "</tr>";
  data.forEach((row) => {
    html +=
      "<tr>" +
      Object.values(row)
        .map((v) => `<td>${v}</td>`)
        .join("") +
      "</tr>";
  });
  return html + "</table>";
};

// Ендпоінти
app.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, quantity FROM inventory");
    if (req.headers.accept?.includes("text/html")) {
      res.send(formatHtmlTable(result.rows));
    } else {
      res.json(result.rows);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/items", async (req, res) => {
  try {
    const { name, quantity } = req.body;
    await pool.query("INSERT INTO inventory (name, quantity) VALUES ($1, $2)", [
      name,
      quantity,
    ]);
    res.status(201).send("Created");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/items/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM inventory WHERE id = $1", [
      req.params.id,
    ]);
    const item = result.rows[0];
    if (req.headers.accept?.includes("text/html")) {
      res.send(item ? formatHtmlTable([item]) : "Not Found");
    } else {
      res.json(item || { error: "Not Found" });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Healthchecks (дуже важливо для Docker)
app.get("/health/alive", (req, res) => res.status(200).send("OK"));

app.get("/health/ready", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).send("OK");
  } catch (e) {
    res.status(500).send("DB not ready");
  }
});

app.get("/", (req, res) => {
  res.send(`
        <h1>My Web App (Lab 2)</h1>
        <ul>
            <li><a href="/items">Подивитись інвентар (GET /items)</a></li>
        </ul>
    `);
});

// Запуск сервера на порту 8000
app.listen(port, () => {
  console.log(`Застосунок підключено до БД: ${dbConfig.host}`);
  console.log(`Сервер запущено на порту ${port}`);
});
