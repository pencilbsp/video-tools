import { USER_AGENT } from "../configs"
import { getNextScript } from "../html"
import { timeToSeconds } from "../format"

export default async function iqVideoParse(url, options) {
  const response = await fetch(url, { headers: { "user-agent": USER_AGENT } })
  const body = await response.text()

  const pageProps = getNextScript(body)
  const initialState = pageProps.props.initialState

  const title = initialState.play.albumInfo.name
  const albumId = initialState.play.curVideoInfo.albumId
  const videoType = initialState.play.curVideoInfo.videoType

  if (albumId === 0 && videoType === "singleVideo") {
    const video = initialState.play.curVideoInfo
    const requireVip = video.vipInfo.isVip === 1 || video.payMark === "lock"

    return [
      [
        {
          requireVip,
          nativeUrl: url,
          isTrailer: false,
          name: video.name,
          vid: video.qipuIdStr,
          duration: timeToSeconds(video.len),
        },
      ],
      title,
    ]
  }

  const videoList = initialState.play.cachePlayList["1"]
  if (!Array.isArray(videoList)) throw new Error("Không tìm thấy danh sách video")

  return [
    videoList
      .filter((video) => {
        let pass = false
        const { extraOrderRseat: orderRseat, payMark } = video
        if (!orderRseat || (orderRseat && orderRseat.match(/\d+-\d+/))) pass = true
        if (pass && ["", "vip_mark", "lock", "preview"].includes((payMark || "").toLowerCase())) return video
      })
      .map((video) => {
        const isTrailer = video.episodeType === 1
        const name = video.subTitle || video.name
        const nativeUrl = "https://www.iq.com/play/" + video.qipuIdStr
        const requireVip = video.vipInfo.isVip === 1 || video.payMark === "lock"

        return { vid: video.qipuIdStr, name, nativeUrl, requireVip, isTrailer, duration: null }
      }),
    title,
  ]
}
