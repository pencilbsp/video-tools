import cors from "cors"
import express from "express"
import { Server } from "socket.io"
import { createServer } from "http"

import encodeTask from "./tools/encode.js"
import downloadTask from "./tools/dowload.js"
//
import pong from "./controllers/pong.js"
import { SERVER_URL } from "./configs.js"
import status from "./controllers/status.js"
import { taskControl } from "./controllers/task.js"
import { deleteVideo } from "./controllers/video.js"

encodeTask.setup().then(() => console.log("✅ Tool đã sẵn sàng tải encode video"))
downloadTask.setup().then(() => console.log("✅ Tool đã sẵn sàng tải xuống video"))

const port = 9909
const app = express()
const server = createServer(app)
const io = new Server(server, { cors: { origin: SERVER_URL } })

app.use(express.static("public"))

app.use(cors())
app.get("/ping", pong)
app.get("/status", status)
app.delete("/video", deleteVideo)
app.patch("/task/:taskId", taskControl)

io.on("connection", (socket) => {
  console.log("A user connected")

  socket.on("joinRoom", (roomName) => {
    socket.join(roomName)
    console.log(`User joined room: ${roomName}`)
  })

  socket.on("leaveRoom", (roomName) => {
    socket.leave(roomName)
    console.log(`User left room: ${roomName}`)
  })

  socket.on("disconnect", () => {
    console.log("A user disconnected")
  })
})

server.listen(port, () => {
  encodeTask.setIo(io)
  downloadTask.setIo(io)
  console.log(`Listening on port ${port}...`)
})
