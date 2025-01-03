import { USER_AGENT } from "../configs"
import { getNextScript } from "../html"
import { timeToSeconds } from "../format"

async function getEpisodeListSource(albumId, start, end) {
  const query = new URLSearchParams({
    platformId: 3,
    modeCode: "vn",
    langCode: "en_us",
    deviceId: "",
    endOrder: end,
    startOrder: start,
  }).toString()

  const headers = new Headers({ "User-Agent": USER_AGENT })
  // ttps://pcw-api.iq.com/api/v2/episodeListSource/4886493532106801?platformId=3&modeCode=vn&langCode=en_us&deviceId=ac895c382d771fde2c9efe36ba145d4c&endOrder=850&startOrder=801
  const apiUrl = `https://pcw-api.iq.com/api/v2/episodeListSource${albumId}?${query}`
  const response = await fetch(apiUrl, { headers })
  const data = await response.json()
  console.log(data)
}

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

  const page = Object.keys(initialState.play.cachePlayList)
  if (page.length === 0) throw new Error("Không tìm thấy danh sách video")

  const currentPage = initialState.play.curVideoPageInfo.pageNo
  const videoList = initialState.play.cachePlayList[currentPage]

  // const maxOrder = initialState.play.albumInfo.maxOrder
  // const totalPageRange = initialState.play.albumInfo.totalPageRange
  // if (currentPage > 1) {
  //   const startOrder =
  //   // const endOrder = Math.min(...videoList.map((v) => v.order))
  //   // const moreVideos = await getEpisodeListSource(albumId, 0)
  // }

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
