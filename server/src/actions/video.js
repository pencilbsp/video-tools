"use server"

import { getServerSession } from "next-auth"

import prisma from "@/libs/prisma"
import getExtractor from "@/libs/extractor"
import { createOptions, videoSchema } from "@/libs/validate"
import { Forbidden, NotFound, Unauthorized } from "@/libs/error"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function getVideos({
  take = 5,
  page = 0,
  order = "desc",
  orderBy = "updatedAt",
  status = { notIn: ["error", "done"] },
} = {}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) throw new Unauthorized()

    const skip = take * page
    const where = { userId: session.user.id, status }
    const total = await prisma.video.count({ where })
    const videoList = await prisma.video.findMany({
      where,
      select: {
        id: true,
        name: true,
        status: true,
        message: true,
        percent: true,
        createdAt: true,
        updatedAt: true,
        clusterId: true,
        supportActions: true,
      },
      take,
      skip,
      orderBy: { [orderBy]: order },
    })

    return { videoList, take, page, total, orderBy, order }
  } catch (error) {
    console.log(error)
    return { error: { message: error.message } }
  }
}

export async function getVideo(id) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) throw new Unauthorized()

    const video = await prisma.video.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        userId: true,
        status: true,
        options: true,
        message: true,
        nativeUrl: true,
        style: { select: { id: true, name: true } },
        cookie: { select: { name: true, id: true } },
        logo: { select: { id: true, name: true, file: { select: { path: true } } } },
        subtitle: { select: { file: { select: { name: true, size: true, path: true } } } },
        cluster: { select: { id: true } },
      },
    })

    if (!video) throw new NotFound("Video không tồn tại hoặc đã bị xoá")
    if (video.userId !== session.user.id) throw new Forbidden()

    const [, site] = getExtractor(video.nativeUrl)

    const cookies = await prisma.cookie.findMany({
      select: { id: true, name: true },
      where: { site, userId: session.user.id },
    })

    return { ...video, cookies }
  } catch (error) {
    // console.log(error)
    return { error: { message: error.message } }
  }
}

export async function updateVideo(id, data) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) throw new Unauthorized()

    const video = await prisma.video.findUnique({ where: { id } })
    if (!video) throw new NotFound("Video không tồn tại hoặc đã bị xoá")
    if (video.userId !== session.user.id) throw new Forbidden()

    data = await videoSchema.validate({ ...data, mode: "video" }, { stripUnknown: true })

    const [options, videoDirty] = createOptions(data)

    const message = video.status === "error" ? "" : video.message
    const status = video.status === "error" ? "pending" : video.status

    await prisma.video.update({
      where: { id },
      data: {
        status,
        options,
        message,
        logoId: null,
        styleId: null,
        cookieId: null,
        clusterId: null,
        subtitleId: null,
        ...videoDirty,
      },
    })

    return {}
  } catch (error) {
    // console.log(error)
    return { error: { message: error.message } }
  }
}

export async function deleteVideos(videoIds) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) throw new Unauthorized()

    const deletedIds = []
    for (const id of videoIds) {
      const video = await prisma.video.findUnique({
        where: { id },
        select: { userId: true, status: true, cluster: { select: { host: true, port: true } } },
      })

      if (!video || !["done", "error", "pending", "downloaded", "muxed"].includes(video.status)) continue

      if (video.userId !== session.user.id) throw new Forbidden()

      if (video.cluster) {
        const deleteEndpoit = `${video.cluster.host}:${video.cluster.port}/video?id=${id}`
        console.log("Gửi yêu cầu xoá các tệp tin từ cluster:", deleteEndpoit)
        fetch(deleteEndpoit, { method: "DELETE" })
          .then(() => {})
          .catch(console.log)
      }

      await prisma.video.delete({ where: { id } })
      deletedIds.push(id)
    }

    return { deletedIds }
  } catch (error) {
    return { error: { message: error.message } }
  }
}

export async function sendAction(id, action) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) throw new Unauthorized()

    const video = await prisma.video.findUnique({ where: { id }, select: { userId: true, cluster: true } })
    if (!video) throw new NotFound("Video không tồn tại hoặc đã bị xoá")
    if (video.userId !== session.user.id) throw new Forbidden()

    const actionUrl = `${video.cluster.host}:${video.cluster.port}/task/${id}?action=${action}`
    const response = await fetch(actionUrl, { method: "PATCH" })
    const result = await response.json()
    return result
  } catch (error) {
    return { error: { message: error.message } }
  }
}
