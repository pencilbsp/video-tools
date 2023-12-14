import { expect, test } from "bun:test"

import { wetvExtract, DEFN_LIST } from "."

const testUrl =
  "https://wetv.vip/vi/play/d9pbivw9xxu19w6-R%E1%BA%A5t%20Nh%E1%BB%9B%2C%20R%E1%BA%A5t%20Nh%E1%BB%9B%20Anh/r0047xnq05t-EP9%3A%20R%E1%BA%A5t%20Nh%E1%BB%9B%2C%20R%E1%BA%A5t%20Nh%E1%BB%9B%20Anh"

const testVideo = {
  id: "6571be67231006bce9714b3c",
  vid: "29q0bk9lkgc",
  status: "downloaded",
  percent: 0,
  name: "Lạc Du Nguyên Tập 40",
  options: {
    downloadVideoQuality: "1080P",
    targetSubtitleLanguage: "vi",
    subtitleType: "srt",
  },
  nativeUrl: testUrl,
  cookieId: "656c21f2030a554f8cf02ed7",
  userId: "65631af7562ba00fa726d8f6",
  updatedAt: "2023-12-07T12:55:12.768Z",
  createdAt: "2023-12-07T12:45:27.443Z",
}

test("IQ EXTRACT", async () => {
  const result = await wetvExtract(testVideo)

  expect(result.subtitle.code).toBe("vi")
  expect(result.video.name).toBe(DEFN_LIST["1080P"])
}, { timeout: 30 * 60 * 1000 })
