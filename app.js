const TOKEN = "8261439816:AAFsL40F-a8wzpJyV97LKpGtHw7I5xkl1zY";

const TelegramBot = require("node-telegram-bot-api");
const puppeteer = require("puppeteer");

const bot = new TelegramBot(TOKEN, { polling: true });
const BBCLINK = "https://www.bbc.com/news";

async function fetchBBC(limit = 3) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // (optional) helps some sites deliver full markup
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36"
  );

  await page.goto(BBCLINK, { waitUntil: "networkidle2" });

  await page.waitForSelector("[data-testid=card-headline]");

  const articles = await page.evaluate((limit, BBCLINK) => {
  const results = [];
  const articlesOnPage = Array.from(document.querySelectorAll("article"))
    .filter(a => a.querySelector('[data-testid="card-headline"]'));

  for (const article of articlesOnPage.slice(0, limit)) {
    const titleEl = article.querySelector('[data-testid="card-headline"]');
    const title = `BBC writes: ${titleEl ? titleEl.innerText.trim() : ""}`;

    const linkEl = article.querySelector("a[href]");
    let href = linkEl ? linkEl.getAttribute("href") : null;
    const link = href
      ? (href.startsWith("http") ? href : new URL(href, BBCLINK).href)
      : null;

    const summaryEl = article.querySelector('[data-testid="card-description"]');
    const summary = summaryEl ? summaryEl.innerText.trim() : "";

    // --- strictly scoped image ---
    let img = null;
    const imgEl = article.querySelector("img");
    if (imgEl) {
      const srcset = imgEl.getAttribute("srcset") || imgEl.getAttribute("data-srcset");
      const src = imgEl.getAttribute("src") || imgEl.getAttribute("data-src");

      if (srcset) {
        const urls = srcset.split(",").map(s => s.trim().split(" ")[0]);
        img = urls[urls.length - 1] || null; // largest one
      } else if (src) {
        img = src;
      }

      if (img && img.includes(".jpg.webp")) {
        img = img.replace(".jpg.webp", ".jpg");
      }
    }

    results.push({ title, link, summary, img });
  }

  return results;
}, limit, BBCLINK);


  await browser.close();
  return articles;
}

bot.onText(/\/news/, async (msg) => {
  const chatId = msg.chat.id;
  const articles = await fetchBBC(3);

  if (!articles.length) {
    return bot.sendMessage(chatId, "❌ Couldn't fetch BBC news right now.");
  }

  // Simple HTML escaper for captions
  const esc = (s = "") =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  for (const news of articles) {
    const caption =
      `📰 <b>${esc(news.title)}</b>\n\n` +
      `${esc(news.summary)}\n\n` +
      (news.link ? `<a href="${news.link}">Read more</a>` : "");

    if (news.img) {
      await bot.sendPhoto(chatId, news.img, { caption, parse_mode: "HTML" });
    } else {
      await bot.sendMessage(chatId, caption, { parse_mode: "HTML", disable_web_page_preview: false });
    }
  }
});
