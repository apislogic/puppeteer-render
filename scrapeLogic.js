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

    const data = await page.evaluate(() => {
      const greetingEl = document.querySelector('h2.text-blue-900');
      const distanceEl = document.querySelector('span.eyebrow.text-blue-800');

      // Get system size
      const rows = Array.from(document.querySelectorAll('.system-info table tbody tr'));
      let systemSize = '';
      for (const row of rows) {
        const label = row.querySelector('th')?.innerText?.trim();
        if (label?.toLowerCase() === 'system size') {
          systemSize = row.querySelector('td')?.innerText?.trim() || '';
          break;
        }
      }

      // Solar-only section data
      const solarSection =
        document.querySelector('#collapse-section-v-0-31') ||
        document.querySelector('#collapse-section-v-0-21');
      let solar_25yr_savings = '';
      let solar_gross_price = '';
      let solar_federal_itc = '';
      let solar_initial_monthly = '';

      if (solarSection) {
        const tables = solarSection.querySelectorAll('table');

        tables.forEach((table) => {
          const rows = table.querySelectorAll('tbody tr');

          rows.forEach((row) => {
            const label = row.querySelector('th')?.innerText.trim().toLowerCase();
            const cells = row.querySelectorAll('td');

            if (!label || cells.length < 2) return;

            if (label.includes('initial monthly payment')) {
              solar_initial_monthly = cells[1]?.innerText.trim();
            }

            if (label.includes('gross system price')) {
              solar_gross_price = cells[0]?.innerText.trim();
            }

            if (label.includes('less: federal itc')) {
              solar_federal_itc = cells[0]?.innerText.trim();
            }

            if (label.includes('savings on electric bills')) {
              solar_25yr_savings = cells[0]?.innerText.trim();
            }
          });
        });
      }
      // With-battery section data
      const batterySection = document.querySelector('#collapse-section-v-0-54');
      let battery_cost = '';
      let battery_itc = '';
      let battery_savings = '';
      let battery_monthly = '';

      if (batterySection) {
        const tables = batterySection.querySelectorAll('table');

        tables.forEach((table) => {
          const rows = table.querySelectorAll('tbody tr');

          rows.forEach((row) => {
            const label = row.querySelector('th')?.innerText.trim().toLowerCase();
            const cells = row.querySelectorAll('td');

            if (!label || cells.length < 1) return;

            if (label.includes('gross system cost with battery')) {
              battery_cost = cells[0]?.innerText.trim();
            }

            if (label.includes('amount of federal itc')) {
              battery_itc = cells[0]?.innerText.trim();
            }

            if (label.includes('25-year savings')) {
              battery_savings = cells[0]?.innerText.trim();
            }

            if (label.includes('initial monthly payment')) {
              battery_monthly = cells[0]?.innerText.trim();
            }
          });
        });
      }


      return {
        Intro_Greeting: greetingEl?.innerText.trim() || '',
        distance_from_location: distanceEl?.innerText.trim() || '',
        system_size: systemSize,
        solar_only_25Year_savings: solar_25yr_savings,
        solar_only_gross_system_price: solar_gross_price,
        solar_only_federal_ITC: solar_federal_itc,
        solar_only_initial_monthly_payment: solar_initial_monthly,
        with_battery_gross_system_cost: battery_cost,
        with_battery_25Year_savings: battery_savings,
        with_battery_federal_ITC: battery_itc,
        with_battery_initial_monthly_payment: battery_monthly
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
