const express = require("express");
const { scrapeLogic } = require("./scrapeLogic");
const app = express();

const PORT = process.env.PORT || 4000;

// 🔧 THIS LINE IS CRITICAL
app.use(express.json());

app.post("/scrape", (req, res) => {
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
