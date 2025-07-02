const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.get("/live-rates", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://slnbullion.in/", { waitUntil: "networkidle2" });

    const data = await page.evaluate(() => {
      const goldBuy = document.querySelector("#lblGoldBuyRate")?.innerText;
      const goldSell = document.querySelector("#lblGoldSellRate")?.innerText;
      const silverBuy = document.querySelector("#lblSilverBuyRate")?.innerText;
      const silverSell = document.querySelector("#lblSilverSellRate")?.innerText;

      return {
        goldBuyPerGram: goldBuy || null,
        goldSellPerGram: goldSell || null,
        silverBuyPerGram: silverBuy || null,
        silverSellPerGram: silverSell || null,
      };
    });

    await browser.close();
    res.json(data);
  } catch (error) {
    console.error("Scraping failed:", error);
    res.status(500).json({ error: "Failed to fetch live rates" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000");
});
