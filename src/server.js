const express = require("express");
const { Pool } = require("pg");
const fs = require("fs");

const app = express();
app.use(express.json());

let config = {
  port: 8000,
  db: { host: "127.0.0.1", user: "app", database: "mywebapp" },
};
try {
  const rawConfig = fs.readFileSync("/etc/mywebapp/config.json");
  config = JSON.parse(rawConfig);
} catch (e) {
  console.log("Конфіг не знайдено, використовуємо дефолтні значення");
}

const pool = new Pool(config.db);

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

app.get("/items", async (req, res) => {
  const result = await pool.query("SELECT id, name FROM inventory");
  if (req.headers.accept?.includes("text/html")) {
    res.send(formatHtmlTable(result.rows));
  } else {
    res.json(result.rows);
  }
});

app.post("/items", async (req, res) => {
  const { name, quantity } = req.body;
  await pool.query("INSERT INTO inventory (name, quantity) VALUES ($1, $2)", [
    name,
    quantity,
  ]);
  res.status(201).send("Created");
});

app.get("/items/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM inventory WHERE id = $1", [
    req.params.id,
  ]);
  const item = result.rows[0];
  if (req.headers.accept?.includes("text/html")) {
    res.send(item ? formatHtmlTable([item]) : "Not Found");
  } else {
    res.json(item || { error: "Not Found" });
  }
});

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
        <h1>Endpoints</h1>
        <ul>
            <li><a href="/items">GET /items</a></li>
            <li>POST /items</li>
            <li>GET /items/:id</li>
        </ul>
    `);
});

const server = app.listen(
  process.env.LISTEN_FDS > 0 ? { fd: 3 } : config.port,
  () => {
    console.log(`Server running on port ${config.port}`);
  },
);
