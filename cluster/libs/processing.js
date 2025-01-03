class Processing {
  list = new Map()
  constructor() {}

  append = (videoId, ffmpegProcess) => {
    this.list.set(videoId, ffmpegProcess)
  }

  remove = (videoId) => {
    if (this.list.has(videoId)) {
      this.list.delete(videoId)
    }
  }

  kill = (videoId) => {
    return new Promise((resolve) => {
      if (!this.list.has(videoId)) return resolve({ message: "Tiến trình không tồn tại" })

      const command = this.list.get(videoId)

      command.on("error", function () {
        console.log("Ffmpeg has been killed", videoId)
        resolve({ message: "Đã yêu cầu huỷ tiến trình thành công" })
      })

      command.kill()
      resolve({ message: "Đã yêu cầu huỷ tiến trình thành công" })
    })
  }

  getProcess = (videoId) => {
    return this.list.get(videoId)
  }
}

const ffmpegProcessing = globalThis.ffmpegProcessing ?? new Processing()
if (process.emit.NODE_ENV !== "production") globalThis.ffmpegProcessing = ffmpegProcessing

export default ffmpegProcessing
