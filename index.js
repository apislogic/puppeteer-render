const express = require("express");
const { scrapeLogic: esScraper } = require("./scrapeLogic");
const { scrapeLogic: otherScraper } = require("./otherScraper");
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
  const { scraper } = req.query;
  const { url } = req.body;

  if (!scraper) return res.status(400).send("Missing scraper type in query");
  if (!url) return res.status(400).send("Missing 'url' in body");
  if (scraper === "esquote") {
    return esScraper(res, url);
  }

  if (scraper === "othersite") {
    return otherScraper(res, url);
  }

  return res.status(400).send(`Unknown scraper: ${scraper}`);
});

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
