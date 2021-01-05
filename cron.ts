import { hourly, config, puppeteer, cron } from "./deps.ts";

let indexer = 0;

// Predefined a list of address
const addresses = [
  "0xf57B0adC78461888BF32d5FB92784CF3FC8f9956",
  "0xda482E8AFbDE4eE45197A1402a0E1Fd1DD175710",
  "0x28F4D53563aC6adBC670Ef5Ad00f47375f87841C",
  "0xBA9e2F4653657DdC9F3d5721bf6B785Cdb6B52bc",
  "0xB40Fa157cd1BC446bF8EC834354eC7db5bEd9603",
  "0x8Ca0BdC5a17e1BdE78A000125Df93f3BDa651B30",
  "0xb89351ee542A7A50BF8e275d3294B781a772Cd75",
  "0x8483AA508b4523E64139E11cC4B972c52e180593",
  "0x018C89c8C23998D94E8f13420fAbc0f32A572cbf",
  "0x89d20cFc2dbA67DD0306491BE26f4C858C7f974a",
];

const WEB_URL = "https://testnet.binance.org/faucet-smart";

const {
  CHROME_PATH = "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
} = config();

async function fundAccount() {
  const addr = addresses[indexer];
  try {
    console.log("Funding for ", addr);

    const browser = await puppeteer.launch({ executablePath: CHROME_PATH });
    const page = await browser.newPage();
    await page.goto(WEB_URL);

    // type the addr
    await page.type("#url", addr);

    // fund 6.25BNB
    await page.click(
      "body > div > div > div:nth-child(2) > div > div.input-group > span:nth-child(2) > button"
    );

    const allOptionsSelector = "span.input-group-btn.open";
    await page.waitForSelector(allOptionsSelector);

    await page.click(
      "body > div > div > div:nth-child(2) > div > div.input-group > span.input-group-btn.open > ul > li:nth-child(3) > a"
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

hourly(async () => {
  console.time("run cron job in every hour");
  await fundAccount();
  console.timeEnd("run cron job");
});

// Run Job in every 30 minutes
cron("1 */30 * * * *", async () => {
  console.time("run cron job in every 30 minutes");
  await fundAccount();
  console.timeEnd("run cron job");
});
