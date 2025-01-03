import { join } from "path"
import { parse } from "date-fns"
import { readFile, writeFile } from "fs/promises"

function toTimestamp(timeString) {
  const dateObject = parse(timeString, "dd/MM/yyyy, HH:mm:ss", new Date())
  const timestamp = dateObject.getTime()
  return timestamp / 1000
}

export async function safariCookie() {
  const cookieNames = ["name", "value", "domain", "path", "expirationDate", "size", "secure", "httpOnly", "sameSite"]
  const cookieContent = await readFile(join(import.meta.dir, "cookies.txt"), "utf-8")
  const cookieRows = cookieContent.split("\n")
  const cookies = cookieRows
    .reduce((cookies, cookieRow) => {
      const data = cookieRow.split("\t")
      const cookie = {}
      data.forEach((value, index) => (cookie[cookieNames[index]] = value))

      cookies.push(cookie)
      return cookies
    }, [])
    .map((cookie) => ({
      ...cookie,
      secure: cookie.secure === "✓",
      httpOnly: cookie.httpOnly === "✓",
      expirationDate: toTimestamp(cookie.expirationDate),
    }))

  await writeFile(join(import.meta.dir, "cookies.json"), JSON.stringify(cookies))
}

export const QN_MAP = {
  "240P": 6,
  "360P": 16,
  "480P": 32,
  "720P": 64,
  "1080P": 112,
  "4K": 120,
}

export const BILI_LANG_CODE = {
  zh: "zh-Hans", // Simplified Chinese
  en: "en", // English
  th: "th", // Thai
  vi: "vi", // Vietnamese
  id: "id", // Bahasa Indonesia
}

export const API_URL = "https://api.bilibili.tv/intl/gateway/web/"
