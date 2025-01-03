import biliExtract from "./bilibili"
import { safariCookie } from "./helper"

const video = {
  id: "65794fc826216cdca722e11b",
  vid: "12999902",
  status: "pending",
  name: "E20 - Right and Wrong Part 3",
  options: {
    downloadVideoQuality: "720P",
    targetSubtitleLanguage: "vi",
    subtitleType: "vtt",
  },
  cookieId: "657937fd26216cdca722e118",
  nativeUrl: "https://www.bilibili.tv/vi/play/2084055/12999902?bstar_from=bstar-web.pgc-video-detail.episode.all",
}

try {
  // await safariCookie()
  await biliExtract(video)
} catch (error) {
  console.log(error)
}
