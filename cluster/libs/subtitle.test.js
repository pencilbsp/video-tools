import { join } from "path"

import prisma from "./prisma"
import { VIDEO_DIR } from "@/configs"
import { getServerFile } from "./file"
import { mergeStyle, toAssSubtitle } from "./subtitle"

try {
  // const subtitlePath = join(VIDEO_DIR, "6576d12ec9c763ed8461981d", "khong.chi.la.thich.em.20.vi.srt")
  // await toAssSubtitle(subtitlePath)
  const video = await prisma.video.findUnique({
    where: { id: "6576e06ec8b533c52ff91855" },
    include: {
      logo: {
        include: {
          file: true,
        },
      },
      subtitle: {
        include: {
          file: true,
        },
      },
      style: {
        include: {
          file: true,
        },
      },
    },
  })

  let logoPath
  let stylePath

  const videoDir = join(VIDEO_DIR, video.id)
  const videoPath = join(VIDEO_DIR, video.paths.video)
  let subtitlePath = join(VIDEO_DIR, video.paths?.subtitle)

  if (video.style) stylePath = await getServerFile(video.style.file)
  if (video.logo) logoPath = await getServerFile(video.logo.file, videoDir)
  if (video.subtitle) subtitlePath = await getServerFile(video.subtitle.file, videoDir)

  if (subtitlePath) subtitlePath = await toAssSubtitle(subtitlePath)

  const mainStyle = video.style?.options?.mainStyle || "Default"
  if (stylePath && subtitlePath) await mergeStyle(stylePath, subtitlePath, mainStyle)

  
} catch (error) {
  console.log(error)
}
