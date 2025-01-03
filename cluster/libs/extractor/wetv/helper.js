import CriptoJS from "crypto-js"
import { USER_AGENT } from "../../../configs.js"

export const DEFN_LIST = {
  "144P": "ld",
  "270P": "sd",
  "480P": "hd",
  "720P": "shd",
  "1080P": "fhd",
}

export const WETV_LANG_CODE = {
  vi: 70,
  en: 30,
  zh: 20,
  "zh-tw": 50,
  th: 60,
  id: 80,
  ms: 100,
  pt: 150,
  es: 160,
}

export const sum = (payload) => {
  let s = 0
  for (var i = 0; i < payload.length; i++) {
    var c = payload.charCodeAt(i)
    s = (s = (s << 5) - s + c) & s
  }

  return s
}

export const encrypt = (payload) => {
  const iv = CriptoJS.lib.WordArray.create([22039283, 1457920463, 776125350, -1941999367])
  const key = CriptoJS.lib.WordArray.create([1332468387, -1641050960, 2136896045, -1629555948])

  const options = { iv, mode: CriptoJS.mode.CBC }
  const encrypted = CriptoJS.AES.encrypt(payload, key, options)

  return encrypted.ciphertext.toString().toUpperCase()
}

/**
 * @typedef {Object} Options
 * @property {number} platform
 * @property {string} appVersion
 * @property {string|undefined} referer
 * @property {number|undefined} timestamp
 */

/**
 *
 * @param {string} videoId
 * @param {string} url
 * @param {string} guid
 * @param {Options} options
 */
export function getCKey(videoId, url, guid, options) {
  const { appVersion, platform, timestamp = Date.now(), referer = "" } = options
  let payload = `|${videoId}|${timestamp}|mg3c3b04ba|${appVersion}|${guid}|${platform}|${url.slice(0, 48)}`
  payload += `|${USER_AGENT.toLowerCase().slice(0, 48)}|${referer.slice(0, 48)}|Mozilla|Netscape|MacIntel|00|`
  return encrypt(`|${sum(payload)}${payload}`)
}

export function isWetv(url) {
  return /^https:\/\/wetv\.vip(?:\/\w{2}|)\/play\/(?<cid>\w+)(?:-.*?|)\/(?<vid>\w+)(?:-.*?|)/.exec(url).groups || {}
}

export function generateGuid(length) {
  let result = ""
  const characters = "0123456789abcdefghijklmnopqrstuvwxyz"

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }

  return result
}

export function getVideoQuality(videos, defn, def = "max") {
  let video = videos.find((video) => video.name === defn)

  if (!video) {
    let index = 0
    let checkList = Object.values(DEFN_LIST)
    if (def === "max") checkList.reverse()

    while (video && checkList[index]) {
      defn = checkList[index]
      video = videos.find((video) => video.name === checkList[index])
    }

    return video
  }

  return { video, defn }
}
