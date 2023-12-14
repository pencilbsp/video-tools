import { join } from "path"
import { existsSync } from "fs"
import { rm } from "fs/promises"

import { VIDEO_DIR } from "../configs.js"

export async function deleteVideo(req, res) {
  try {
    const videoId = req.query.id
    const videoDir = join(VIDEO_DIR, videoId)

    console.log("Nhận yêu cầu xoá thư mục video:", videoDir)

    if (existsSync(videoDir)) await rm(videoDir, { recursive: true, force: true })
    return res.json({ success: true })
  } catch (error) {
    return res.json({ success: true, message: error.message })
  }
}
