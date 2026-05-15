const request = require("supertest");
const { app, server } = require("../server");

describe("Тестування API ендпоінтів", () => {
  afterAll(async () => {
    await server.close();
  });

  it("GET /health/alive має повертати 200 OK", async () => {
    const res = await request(app).get("/health/alive");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe("OK");
  });

  it("GET / має повертати HTML з назвою лаби", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("My Web App (Lab 3)");
  });

  it("GET /items має повертати статус 200 або 500 (залежно від БД)", async () => {
    const res = await request(app).get("/items");
    expect([200, 500]).toContain(res.statusCode);
  });
});
