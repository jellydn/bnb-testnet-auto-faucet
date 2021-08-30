import { daily, config, puppeteer } from "./deps.ts";

let indexer = 0;

const WEB_URL = "https://testnet.binance.org/faucet-smart";

const {
  CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ACCOUNT = "0x096cd10D7BEF8D5923b18b18E9f79CA230ee2285",
} = config();

const addresses = [ACCOUNT];

async function fundAccount() {
  const addr = addresses[indexer];
  try {
    console.log("Funding for ", addr);

    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
    });
    const page = await browser.newPage();
    await page.goto(WEB_URL);

    // type the addr
    await page.type("#url", addr);

    // fund 1 BNB
    await page.click(
      "body > div > div > div:nth-child(2) > div > div.input-group > span:nth-child(2) > button"
    );

    const allOptionsSelector = "span.input-group-btn.open";
    await page.waitForSelector(allOptionsSelector);

    await page.click(
      "body > div > div > div:nth-child(2) > div > div.input-group > span.input-group-btn.open > ul > li > a"
    );

    const resultSelector = ".noty_text";
    await page.waitForSelector(resultSelector);

    await page.close();
    // reset to the 1st item
    indexer += 1;

    if (indexer > addresses.length) {
      indexer = 0;
    }
  } catch (error) {
    console.error(error);
  }
}

daily(async () => {
  console.time("run cron job in every hour");
  await fundAccount();
  console.timeEnd("run cron job");
});

await fundAccount();
