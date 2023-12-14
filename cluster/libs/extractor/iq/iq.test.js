import { expect, test } from "bun:test"

import { iqExtract, cmd5x, BID_TAGS } from "."

const testUrl = "https://www.iq.com/play/romance-on-the-farm-episode-1-1vex8kzace4?lang=en_us"
const testString = "/dash?tvid=7980447207912000&bid=500&ds=0&vid=35528f090543f860c2c42df5ca095549&src=01010031010021000000&vt=0&rs=1&uid=0&ori=pcw&ps=1&k_uid=ac895c382d771fde2c9efe36ba145d4c&pt=0&d=0&s=&lid=&slid=3&cf=&ct=&authKey=9827f14da8ed32233c39bc08e9fa6a87&k_tag=1&ost=0&ppt=0&dfp=a0fa2d00aef2865f7c90a37333e7a7783ded30b518776941ae23363af43f132e44&prio=%7B%22ff%22%3A%22f4v%22%2C%22code%22%3A2%7D&k_err_retries=0&up=&su=2&applang=en_us&sver=2&X-USER-MODE=vn&qd_v=2&tm=1702196599834&qdy=i&qds=0&k_ft1=141287244169348&k_ft4=34359738372&k_ft7=0&k_ft5=1&bop=%7B%22version%22%3A%2210.0%22%2C%22dfp%22%3A%22a0fa2d00aef2865f7c90a37333e7a7783ded30b518776941ae23363af43f132e44%22%2C%22b_ft1%22%3A0%7D&ut=0"

const testVideo = {
  vid: "29q0bk9lkgc",
  nativeUrl: testUrl,
  id: "6571be67231006bce9714b3c",
  cookieId: "656f3f9c852b8e399e40580d",
  userId: "65631af7562ba00fa726d8f6",
  updatedAt: "2023-12-07T12:55:12.768Z",
  createdAt: "2023-12-07T12:45:27.443Z",
  name: "Mysterious Lotus Casebook Episode 1",
  options: { downloadVideoQuality: "720P", targetSubtitleLanguage: "vi", subtitleType: "srt" },
}

test("CMD5X", () => {
  const hash = cmd5x(testString)
  expect(hash).toBe("0b337e252c9c778b958bc9afd208e260")
})

test("IQ EXTRACT", async () => {
  const result = await iqExtract(testVideo)

  expect(result.subtitle.code).toBe("vi")
  expect(result.video.bid).toBe(BID_TAGS["720P"])
}, { timeout: 30 * 60 * 1000 })
