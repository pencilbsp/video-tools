import puppeteer from "puppeteer-core"

/**
 *
 * @param {(import "puppeteer-core").PuppeteerLaunchOptions | undefined} options
 * @returns {Promise<(import "puppeteer-core").Browser>}
 */

export default async function getBrowser(options = {}) {
  const browser =
    globalThis.browser ??
    (await puppeteer.launch({
      executablePath: process.env.CHROME_PATH,
      ...options,
    }))
  if (process.env.NODE_ENV !== "production") globalThis.browser = browser

  return browser
}

/**
 *
 * @param {string} url
 * @param {(import "puppeteer-core").GoToOptions | undefined} options
 * @return {Promise<(import "puppeteer-core").Protocol.Network.Cookie[]>}
 */

export async function getPageCookies(url, options = {}) {
  const browser = await getBrowser({ headless: false })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: "load", timeout: 60 * 1000, ...options })
  const cookies = await page.cookies()
  await page.close()
  return cookies
}
