import slug from "slug"
import { join } from "path"
import { existsSync } from "fs"
import { mkdir } from "fs/promises"

import cmd5x from "./cmd5x.m.js"
import Cookie from "../../../libs/cookie.js"
import prisma from "../../../libs/prisma.js"
import { getNextScript } from "../../../libs/dom.js"
import { M3U8_DIR, VIDEO_DIR, USER_AGENT } from "../../../configs.js"
import {
  getFT,
  getUid,
  BID_TAGS,
  getUtList,
  fetchM3U8,
  IQ_LANG_CODE,
  createM3U8File,
  getVideoQuality,
  checkRequireVip,
} from "./init.js"
import IqDRM from "./drm.js"
import FFmpeg from "../../../libs/ffmpeg.js"
import { downloadFile } from "../../../libs/download.js"

/**
 *
 * @param {(import "@prisma/client").Video} video
 * @return {Promise<any>}
 */

export default async function iqExtract(_video, progressCallback) {
  const url = _video.nativeUrl
  const options = _video.options

  const subCode = options.targetSubtitleLanguage
  const bid = BID_TAGS[options.downloadVideoQuality] || 0

  const cookie = new Cookie()
  const headers = new Headers({ "User-Agent": USER_AGENT })

  if (_video.cookieId) {
    const _cookie = await prisma.cookie.findUnique({ where: { id: _video.cookieId } })
    if (_cookie && _cookie.values) cookie.set(_cookie.values)
  } else {
    // const cookiePath = join(import.meta.dir, "cookie.json")
    // const cookies = await getDefaultCookies(url, cookiePath)
    // cookie.set(cookies)
  }

  if (bid > 0) cookie.setValue("QiyiPlayerBID", bid.toString())
  headers.set("Cookie", cookie.toString())

  const response = await fetch(url, { headers })
  const body = await response.text()
  const nextScript = getNextScript(body)

  const pageProps = nextScript.props?.initialProps.pageProps || {}
  const data = pageProps.prePlayerData.dash.data || {}
  if (data["boss_ts"].msg) throw new Error(data["boss_ts"].msg)

  const { tvid, program, dstl } = data

  const tm = Date.now()
  const uid = getUid(cookie)
  const utList = await getUtList(cookie)

  const authKey = cmd5x(cmd5x("") + tm + "" + tvid)

  const kUid = Array.apply(null, Array(32))
    .map(function () {
      return Math.floor(Math.random() * 15).toString(16)
    })
    .join("")

  const mod = cookie.getValue("mod", "intl")
  const lang = cookie.getValue("lang", "en_us")
  const dfp = cookie.getValue("__dfp").split("@")?.[0]
  const src = pageProps.ptid || "04022001010011000000"
  const subType = ["srt", "webvtt", "xml"].includes(options.subtitleType) ? options.subtitleType : "srt"

  const subtitles = program.stl.map((sub) => {
    const index = Object.values(IQ_LANG_CODE).indexOf(sub.lid)
    const code = Object.keys(IQ_LANG_CODE)[index]
    return { id: sub.uuid, name: sub._name, url: sub[subType], code, type: subType }
  })

  let { video, bid: selectedBid } = getVideoQuality(program.video, bid, "max")
  const subtitle = subtitles.find((stl) => stl.code === subCode)

  // Tạo dash path cho video
  // Supported by YT-DLP
  // https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/extractor/iqiyi.py
  const query = new URLSearchParams({
    tvid: tvid,
    bid: video.bid,
    ds: 0,
    vid: video.vid,
    src: src,
    vt: 0,
    rs: 1,
    uid: uid,
    ori: "pcw",
    ps: 1,
    k_uid: kUid,
    pt: 0,
    d: 0,
    s: "",
    lid: "",
    slid: 3,
    cf: "",
    ct: "",
    authKey: authKey,
    k_tag: 1,
    ost: 0,
    ppt: 0,
    dfp: dfp,
    prio: JSON.stringify({
      ff: "f4v",
      code: 2,
    }),
    k_err_retries: 0,
    up: "",
    su: 2,
    applang: lang,
    sver: 2,
    "X-USER-MODE": mod,
    qd_v: 2,
    tm: tm,
    qdy: "a",
    qds: 0,
    k_ft1: "141287244169348",
    k_ft4: getFT(4).toString(),
    k_ft7: getFT(7).toString(),
    k_ft5: getFT(5).toString(),
    bop: JSON.stringify({
      version: "10.0",
      dfp: dfp,
      b_ft1: getFT("b_ft1"),
    }),
    ut: utList[0],
  })

  const dashPath = "/dash?" + query.toString()
  video.dashPath = dashPath + "&vf=" + cmd5x(dashPath)

  // Báo lỗi nếu video yêu cầu tài khoản VIP
  if (checkRequireVip(video, utList[0])) throw new Error("Video này yêu cầu tài khoản VIP")

  // Fetch m3u8 nếu chưa có sẵn
  if (!video.m3u8) video = await fetchM3U8(video, headers)

  // Tạo thư mục lưu trữ video
  const videoDir = join(VIDEO_DIR, _video.id)
  if (!existsSync(videoDir)) await mkdir(videoDir)

  const fileName = slug(_video.name ?? _video.id, { replacement: "." })

  // Tải xuống phụ đề cho video nếu có
  if (subtitle) {
    const subtitleExt = subtitle.type === "webvtt" ? "vtt" : subtitle.type
    const subtitleName = `${fileName}.${subtitle.code}.${subtitleExt}`
    const subtitlePath = join(videoDir, subtitleName)
    await downloadFile(dstl + subtitle.url, subtitlePath)
    Object.assign(subtitle, { path: subtitlePath.replace(VIDEO_DIR, "") })
  }

  // Đặt tên cho video
  const qualityName = Object.keys(BID_TAGS)[Object.values(BID_TAGS).indexOf(selectedBid)]
  const videoName = `${fileName}.${qualityName}.mp4`

  const videoPath = join(videoDir, videoName)

  // Tải xuống video DRM
  if (!video.m3u8.startsWith("#EXTM3U") && video.drm) {
    const drm = new IqDRM(video.m3u8, video.vid, video.drm, video.duration)
    drm.on("progress", (progress) => {
      console.log(progress.message, progress.percent)
      if (progressCallback) progressCallback(progress)
    })

    await drm.parseDRM()
    await drm.download(videoPath)
  } else {
    await prisma.video.update({ where: { id: _video.id }, data: { supportActions: true } })
    // Tải xuống video HLS
    const m3u8Path = join(M3U8_DIR, _video.id + ".m3u8")
    await createM3U8File(m3u8Path, video.m3u8)

    const ffmpeg = new FFmpeg(_video.id, m3u8Path, ["-protocol_whitelist file,http,https,tcp,tls,crypto"], ["-c copy"])
    ffmpeg.setDuration(video.duration)

    ffmpeg.setStatus("downloading")
    ffmpeg.on("progress", (progress) => {
      // console.log("Đang tải xuống...", progress.percent)
      if (progressCallback) progressCallback(progress)
    })

    await ffmpeg.start(videoPath)
    await prisma.video.update({ where: { id: _video.id }, data: { supportActions: false } })
  }

  Object.assign(video, { path: videoPath.replace(VIDEO_DIR, "") })

  return { video, subtitle }
}
