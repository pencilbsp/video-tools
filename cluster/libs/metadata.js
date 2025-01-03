import { ffprobe } from "fluent-ffmpeg"

const metadata = async (filePath) => {
  return new Promise((resolve, reject) => {
    ffprobe(filePath, (error, metadata) => {
      if (error) return reject(error)
      if (!metadata || !metadata.streams) return reject(new Error("Cannot read metadata information"))

      const vcodec = metadata.streams.find((e) => e.codec_type === "video")
      const acodec = metadata.streams.find((e) => e.codec_type === "audio")

      if (!vcodec) return reject(new Error("File without video stream"))
      if (!acodec) return reject(new Error("File without audio stream"))

      return resolve({ vcodec, acodec })
    })
  })
}

export default metadata
