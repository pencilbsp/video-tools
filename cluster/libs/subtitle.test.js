// import { expect } from "bun:test"

import { join } from "path"

import prisma from "./prisma"
import { getServerFile } from "./file"
import { downloadFile } from "./download"
import { TMP_DIR, VIDEO_DIR } from "@/configs"
import { jsonToSrt, mergeStyle, toAssSubtitle } from "./subtitle"

try {
  // const subtitlePath = join(VIDEO_DIR, "6576d12ec9c763ed8461981d", "khong.chi.la.thich.em.20.vi.srt")
  // await toAssSubtitle(subtitlePath)
  // const video = await prisma.video.findUnique({
  //   where: { id: "6576e06ec8b533c52ff91855" },
  //   include: {
  //     logo: {
  //       include: {
  //         file: true,
  //       },
  //     },
  //     subtitle: {
  //       include: {
  //         file: true,
  //       },
  //     },
  //     style: {
  //       include: {
  //         file: true,
  //       },
  //     },
  //   },
  // })

  // let logoPath
  // let stylePath

  // const videoDir = join(VIDEO_DIR, video.id)
  // const videoPath = join(VIDEO_DIR, video.paths.video)
  // let subtitlePath = join(VIDEO_DIR, video.paths?.subtitle)

  // if (video.style) stylePath = await getServerFile(video.style.file)
  // if (video.logo) logoPath = await getServerFile(video.logo.file, videoDir)
  // if (video.subtitle) subtitlePath = await getServerFile(video.subtitle.file, videoDir)

  // if (subtitlePath) subtitlePath = await toAssSubtitle(subtitlePath)

  // const mainStyle = video.style?.options?.mainStyle || "Default"
  // if (stylePath && subtitlePath) await mergeStyle(stylePath, subtitlePath, mainStyle)

  const subtitle = {
    subtitle_id: 1617629763671,
    url: "https://s.bstarstatic.com/ogv/subtitle/3d6b40a96083c60a9a9c5fbbfa5bd051b8e96a5b.json?auth_key=1702806372-0-0-33af7ca60cb04c06dd319aab5956ff48",
  }

  // // Chuyển đổi phụ đề json thành ass
  const subtitlePath = join(TMP_DIR, "json_subtitle.srt")
  // await downloadFile(subtitle.url, subtitlePath, {}, null, { force: true })
  await jsonToSrt(subtitle.url, subtitlePath)
  await toAssSubtitle(subtitlePath)
} catch (error) {
  console.log(error)
}
