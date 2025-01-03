import prisma from "../libs/prisma.js"
import encodeTask from "../tools/encode.js"
import downloadTask from "../tools/dowload.js"
import ffmpegProcessing from "../libs/processing.js"

export async function tasksControl(req, res) {
  try {
    const action = req.query.action
    const serial = req.query.serial

    if (action === "stop" && downloadTask.staus !== "stoped") {
      encodeTask.stopEncodeTask()
      downloadTask.stopDownloadTask()
    }

    if (action === "start" && downloadTask.staus === "stoped") {
      encodeTask.startEncodeTask()
      downloadTask.startDownloadTask()
    }
  } catch (error) {
    return res.json({ error: { message: error.message } })
  }
}

export async function taskControl(req, res) {
  try {
    const action = req.query.action
    const taskId = req.params.taskId
    const task = ffmpegProcessing.getProcess(taskId)
    if (!task) throw new Error("Tiến trình không tồn tại hoặc không được hỗ trợ")

    if (!["cancel", "pause", "resume"].includes(action)) throw new Error("Hành động không hợp lệ")

    task[action]()

    let message = ""
    if (action === "cancel") message = "Tiến trình sử lý video đã được huỷ bỏ"
    if (action === "pause") message = "Tiến trình sử lý video đã được tạm dừng"
    if (action === "resume") message = "Tiến trình sử lý video đã được khôi phục"
    
    await prisma.video.update({ where: { id: taskId }, data: { status: task.progress.status } })
    return res.json({ success: true, task: task.progress, message })
  } catch (error) {
    return res.json({ error: { message: error.message } })
  }
}
