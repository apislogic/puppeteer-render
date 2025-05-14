const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res, url) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // Attempt to detect which solar-only section exists
    const solarSelector =
      (await page.$("#collapse-section-v-0-31")) ||
      (await page.$("#collapse-section-v-0-21"));

    const data = await page.evaluate((solarSelectorId) => {
      const getTextFromTable = (sectionSelector, labelMatch, col = 0) => {
        const section = document.querySelector(sectionSelector);
        if (!section) return null;

        const rows = section.querySelectorAll("table tbody tr");
        for (const row of rows) {
          const th = row.querySelector("th");
          const tds = row.querySelectorAll("td");
          if (!th || tds.length === 0) continue;

          const label = th.innerText.trim().toLowerCase();
          if (label.includes(labelMatch.toLowerCase())) {
            return tds[col]?.innerText.trim();
          }
        }
        return null;
      };

      const solarSection = document.querySelector("#collapse-section-v-0-31") ||
                           document.querySelector("#collapse-section-v-0-21");
      const batterySection = document.querySelector("#collapse-section-v-0-54");

      return {
        solar_only_gross_system_price: getTextFromTable("#collapse-section-v-0-31", "gross system price", 0),
        solar_only_initial_monthly_payment: getTextFromTable("#collapse-section-v-0-31", "initial monthly payment", 1),
        solar_only_federal_ITC: getTextFromTable("#collapse-section-v-0-31", "federal itc", 0),
        solar_only_25Year_savings: getTextFromTable("#collapse-section-v-0-31", "savings on electric bills", 0),

        with_battery_gross_system_cost: getTextFromTable("#collapse-section-v-0-54", "gross system cost with battery", 0),
        with_battery_initial_monthly_payment: getTextFromTable("#collapse-section-v-0-54", "initial monthly payment", 0),
        with_battery_federal_ITC: getTextFromTable("#collapse-section-v-0-54", "federal itc", 0),
        with_battery_25Year_savings: getTextFromTable("#collapse-section-v-0-54", "25-year savings", 0),
      };
    });

    console.log(data);
    res.json(data);
  } catch (err) {
    console.error("Scraping error:", err);
    res.status(500).send(`Scraping error: ${err.message}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
