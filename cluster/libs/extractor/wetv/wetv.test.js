import { expect, test } from "bun:test"

import { wetvExtract, DEFN_LIST } from "."

const testUrl =
  "https://wetv.vip/vi/play/66yzzub795ru4pt-Xin%20H%C3%A3y%20Y%C3%AAu%20%C4%90%C6%B0%C6%A1ng%20V%E1%BB%9Bi%20K%E1%BA%BB%20H%C3%A0i%20H%C6%B0%E1%BB%9Bc%20Nh%C6%B0%20T%C3%B4i/p4100aohyll-EP21%3A%20Xin%20H%C3%A3y%20Y%C3%AAu%20%C4%90%C6%B0%C6%A1ng%20V%E1%BB%9Bi%20K%E1%BA%BB%20H%C3%A0i%20H%C6%B0%E1%BB%9Bc%20Nh%C6%B0%20T%C3%B4i"

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
