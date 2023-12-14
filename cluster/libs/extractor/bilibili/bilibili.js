import slug from "slug"
import { join } from "path"
import { unlink } from "fs/promises"

import FFmpeg from "../../../libs/ffmpeg.js"
import Cookie from "../../../libs/cookie.js"
import prisma from "../../../libs/prisma.js"
import { downloadFile } from "../../../libs/download.js"
import { TMP_DIR, USER_AGENT } from "../../../configs.js"
import { QN_MAP, API_URL, BILI_LANG_CODE } from "./helper.js"

const platform = "web"
const s_locale = "vi_VN"
const spm_id = "bstar-web.pgc-video-detail.0.0"
const from_spm_id = "bstar-web.pgc-video-detail.episode.all"

export default async function biliExtract(_video, progressCallback) {
  // const url = _video.nativeUrl
  const options = _video.options

  const cookie = new Cookie()
  const url = new URL(_video.nativeUrl)
  const headers = new Headers({ "User-Agent": USER_AGENT, Origin: url.origin, Referer: `${url.origin}/` })

  if (_video.cookieId) {
    const _cookie = await prisma.cookie.findUnique({ where: { id: _video.cookieId } })
    if (_cookie && _cookie.values) {
      cookie.set(_cookie.values)
      // console.log(cookie.toString())
      headers.set("Cookie", cookie.toString())
    }
  }

  const quality = QN_MAP[options.downloadVideoQuality] ?? 64
  const subtitleLang = BILI_LANG_CODE[options.targetSubtitleLanguage] ?? "vi"

  const videoQuery = new URLSearchParams({
    s_locale,
    platform,
    ep_id: _video.vid,
    qn: quality,
    type: 0,
    device: "wap",
    tf: 0,
    spm_id,
    from_spm_id,
  })

  let response = await fetch(`${API_URL}/playurl?${videoQuery.toString()}`, { headers })
  let data = await response.json()
  const video = data.data.playurl.video.find((video) => video["video_resource"].quality === quality)
  const audio = data.data.playurl["audio_resource"].find((audio) => audio.quality === video["audio_quality"])
  if (!video || !audio) throw new Error("Không tìm thấy dữ liệu video hoặc âm thanh")

  const subtitleQuery = new URLSearchParams({ s_locale, platform, episode_id: _video.vid, spm_id, from_spm_id })
  response = await fetch(`${API_URL}/v2/subtitle?${subtitleQuery.toString()}`, { headers })
  data = await response.json()

  let subtitle = data.data["video_subtitle"].find((subtitle) => (subtitle["lang_key"] = subtitleLang))

  const videoDir = join(TMP_DIR, _video.id)
  const videoName = slug(_video.name, { replacement: "." })
  let subType = ["srt", "ass"].includes(options.subtitleType) ? options.subtitleType : "srt"

  if (subtitle) {
    if (!subtitle[subType]) subType = Object.keys(subtitle).find((key) => subtitle[key]?.url)
    subtitle = subtitle[subType]
    const subtitleName = `${videoName}.${subtitleLang}.${subType}`
    const subtitlePath = join(videoDir, subtitleName)
    await downloadFile(subtitle.url, subtitlePath)
    subtitle.path = subtitlePath.replace(TMP_DIR, "")
  }

  const qualityName = getFileName(QN_MAP, quality)
  const videoPath = join(videoDir, `${videoName}.mp4`)
  const audioPath = join(videoDir, `${videoName}.aac`)
  const videoMuxedPath = join(videoDir, `${videoName}.${qualityName}.mp4`)

  const headersObject = Object.fromEntries(Array.from(headers.entries()))

  let count = 0
  let realPercent = 0
  const handleProgress = ({ percent }) => {
    percent = count + percent / 2
    if (percent > realPercent + 1 && progressCallback) {
      realPercent = percent
      progressCallback({ percent: realPercent })
    }
  }

  await downloadFile(audio.url, audioPath, headersObject, null, {}, handleProgress)
  count += 50

  await downloadFile(video["video_resource"].url, videoPath, headersObject, null, {}, handleProgress)

  const ffmpeg = new FFmpeg(_video.id, videoPath, [], ["-c copy"])
  ffmpeg.addInput(audioPath)
  await ffmpeg.start(videoMuxedPath)

  await unlink(audioPath)

  if (progressCallback) progressCallback({ percent: 100 })

  return { video: { ...video, path: videoMuxedPath }, subtitle }
}

function getFileName(objName, key) {
  return Object.keys(objName)[Object.values(objName).indexOf(key)]
}
