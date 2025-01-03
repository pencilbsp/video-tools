import { parse } from "path"
import { createWriteStream, existsSync } from "fs"
import { mkdir, unlink, writeFile } from "fs/promises"

import { USER_AGENT } from "../configs.js"

/**
 * @typedef {Object} Progress
 * @property {number} loaded - Số lượng dữ liệu đã tải xuống.
 * @property {number} total - Tổng số lượng dữ liệu cần tải xuống.
 * @property {number} percent - Phần trăm tiến trình tải xuống.
 * @property {boolean} isComplete - Đã hoàn tất tải xuống hay chưa.
 * @property {string=} error - Chuỗi mô tả lỗi nếu có.
 */

/**
 * @typedef {Object} Options
 * @property {boolean=} force - Chế độ ghi đè dữ liệu.
 */

/**
 *
 * @param {string} url
 * @param {string} filePath
 * @param {object=} _headers
 * @param {Buffer=} initBuffer
 * @param {Options} options
 * @param {(progress: Progress) => void|undefined} onProgressCallback
 */

export const downloadFile = async (url, filePath, headers = {}, initBuffer, options = {}, onProgressCallback) => {
  let isComplete = false

  try {
    const { dir } = parse(filePath)
    if (!existsSync(dir)) await mkdir(dir)

    if (options.force && existsSync(filePath)) await unlink(filePath)

    if (initBuffer) await writeFile(filePath, initBuffer)

    const response = await fetch(url, { headers: new Headers({ "User-Agent": USER_AGENT, ...headers }) })

    if (!response.ok) throw new Error(`Lỗi khi tải xuống file: ${response.statusText}`)

    const contentLength = response.headers.get("content-length")
    const total = parseInt(contentLength, 10)

    let loaded = 0
    let percent = 0

    const reader = response.body.getReader()
    const writableStream = createWriteStream(filePath, { flags: "a" })

    // Pipe từ ReadableStream sang WritableStream
    await reader.read().then(async function process(result) {
      if (result.done) {
        writableStream.end()
        return
      }

      loaded += result.value.length
      const currentPercent = (loaded / total) * 100

      if (currentPercent > percent + 1 && onProgressCallback) {
        percent = currentPercent
        onProgressCallback({ loaded, total, percent: (loaded / total) * 100, isComplete })
      }

      writableStream.write(result.value)

      // Tiếp tục đọc
      await reader.read().then(process)
    })

    isComplete = true
    if (onProgressCallback) onProgressCallback({ loaded, total, percent: 100, isComplete })
    return { isComplete, error: null }
  } catch (error) {
    console.error(error)
    const result = { error: error.message, isComplete }
    if (onProgressCallback) onProgressCallback(result)
    return result
  }
}
