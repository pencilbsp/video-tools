import * as yup from "yup"
import { merge, isUndefined } from "lodash"

// config
import { decryptData } from "./aes"
import { defaultVideoOptions } from "./configs"

export const IS_WETV = /^https:\/\/wetv\.vip(?:\/\w{2}|)\/play\/.+$/
export const IS_IQ = /^https:\/\/(?:www.|)iq\.com\/(?:play|album)\/.+$/
export const IS_BILIBILI = /^https:\/\/(?:www.|)bilibili\.tv(?:\/\w{2}|)\/play\/.+$/
export const IS_GOOGLE_DRIVE = /^https:\/\/drive\.google\.com\/(?:drive\/folders|file\/d)\/.+$/
export const IS_SUPPORT_URL = /^https:\/\/(?:wetv\.vip|(?:www.|)iq\.com|drive\.google\.com|(?:www.|)bilibili\.tv)\/.+?$/

export const isSupportUrl = (url) => IS_SUPPORT_URL.test(url)

// export function isModified(options) {
//   let index = 0
//   let isModified = false
//   const keys = Object.keys(options)

//   while (index < keys.length - 1) {
//     isModified = options[keys[index]] !== defaultVideoOptions[keys[index]]
//     if (isModified) break
//     index++
//   }

//   return isModified
// }

export const cookieSchema = yup.object().shape({
  name: yup.string().required("Vui lòng đặt tên cho cookie"),
  cookie: yup.string().required("Không được bỏ trống chuỗi cookie"),
})

export const loginSchema = yup.object().shape({
  email: yup.string().email("Email không hợp lệ").required("Email không được bỏ trống"),
  password: yup.string().min(6, "Mật khẩu quá ngắn").required("Mật khẩu không được bỏ trống"),
})

export const signUpSchema = yup.object().shape({
  name: yup.string().min(2, "Tên quá ngắn").max(64, "Tên quá dài").required("Tên không được bỏ trống"),
  email: yup.string().email("Email không hợp lệ").required("Email không được bỏ trống"),
  password: yup.string().min(6, "Mật khẩu quá ngắn").required("Mật khẩu không được bỏ trống"),
})

export const videoSchema = yup.object().shape({
  vid: yup.string(),
  mode: yup.string().oneOf(["global", "video"]),
  name: yup.string().when("mode", {
    is: "video",
    then: () => yup.string().required("Tên video không được bỏ trống"),
  }),
  nativeUrl: yup.string().when("mode", {
    is: "video",
    then: () => yup.string().required("URL của video không được bỏ trống"),
  }),
  logo: yup
    .object({
      id: yup.string(),
      name: yup.string(),
    })
    .nullable(),
  style: yup
    .object({
      id: yup.string(),
      name: yup.string(),
    })
    .nullable(),
  cookie: yup
    .object({
      id: yup.string(),
      name: yup.string(),
    })
    .nullable(),
  subtitle: yup
    .object({
      id: yup.string(),
      name: yup.string(),
    })
    .nullable(),
  cluster: yup
    .object({
      id: yup.string(),
      hash: yup.string(),
      password: yup.boolean(),
    })
    .nullable(),
  options: yup.object().shape({
    upload: yup.boolean(),
    namePrefix: yup.string(),
    videoSacle: yup.string(),
    skipEncode: yup.boolean(),
    ffmpegOptions: yup.array().of(yup.string()),
    createDubbing: yup.boolean(),
    downloadVideoQuality: yup.string(),
    rootUploadFolderId: yup.string().when("upload", (upload, schema) => {
      if (!upload[0]) return schema
      return schema
        .required("Cần có ID của thư mục Google Drive")
        .test("len", "ID thư mục không hợp lệ", (val) => val.length > 31)
    }),
    createUploadSubfolder: yup.boolean(),
    targetSubtitleLanguage: yup.string(),
  }),
})

export function trimFalsely(options) {
  if (!options) return
  const keys = Object.keys(options)
  return keys.reduce((prev, key) => {
    const value = options[key]
    const isArray = Array.isArray(value)
    if (!value || (isArray && value.length === 0)) return prev

    if (typeof value === "object") {
      prev[key] = isArray ? value : trimFalsely(value)
    } else {
      prev[key] = options[key]
    }
    return prev
  }, {})
}

export const mergeOptions = (source, target = JSON.parse(JSON.stringify(defaultVideoOptions))) => {
  // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
  for (const key of Object.keys(source)) {
    if (isUndefined(target[key])) {
      delete source[key]
      continue
    }
    if (source[key] instanceof Object) Object.assign(source[key], merge(target[key], source[key]))
  }

  // Join `target` and modified `source`
  // Object.assign(target, source)
  return { ...target, ...source }
}

export function createOptions({ options = {}, subtitle, name, style, logo, cookie, cluster }) {
  const video = {}
  options = trimFalsely(options)

  if (options.namePrefix?.includes("{name}")) {
    video.name = options.namePrefix.replace("{name}", name)
  }
  delete options.namePrefix

  if (logo) Object.assign(video, { logoId: logo.id })
  if (style) Object.assign(video, { styleId: style.id })
  if (cookie) Object.assign(video, { cookieId: cookie.id })
  if (cluster) {
    if (cluster.password && cluster.hash) {
      let data = {}
      try {
        data = decryptData(cluster.hash)
      } catch (error) {}
      if (data.id !== cluster.id) throw new Error("Không thể xác minh mật khẩu cluster")
    }
    Object.assign(video, { clusterId: cluster.id })
  }
  if (subtitle) Object.assign(video, { subtitleId: subtitle.id })

  return [options, video]
}
