const express = require("express");
const { scrapeLogic } = require("./scrapeLogic");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 4000;

// 🔧 THIS LINE IS CRITICAL
app.use(express.json());

const API_KEY = process.env.SCRAPER_API_KEY;



app.post("/scrape", (req, res) => {
  const userKey = req.headers["x-api-key"];
  if (userKey !== API_KEY) {
    return res.status(403).send("Forbidden: invalid API key.");
  }
  const { url } = req.body;
  if (!url) return res.status(400).send("Missing 'url' in body.");
  scrapeLogic(res, url);
});

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
