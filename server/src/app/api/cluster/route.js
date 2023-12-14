"use server"
import { genSalt, hash } from "bcryptjs"
import { getServerSession } from "next-auth"

import prisma from "@/libs/prisma"
import { Conflict, Unauthorized } from "@/libs/error"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request) {
  try {
    const query = request.nextUrl.searchParams
    const userId = query.get("userId")
    console.log(userId)

    // const session = await getServerSession(authOptions)
    // if (!session || !session.user) throw new Unauthorized()

    const clusters = await prisma.cluster.findMany({
      where: {
        userId,
      },
    })

    return Response.json({ clusterList: clusters.map((c) => ({ ...c, password: c.password ? true : false })) })
  } catch (error) {
    return Response.json(
      { success: false, error: { message: error.message } },
      { status: error.status || 500, statusText: error.statusText || "Internal Server Error" }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) throw new Unauthorized()

    const serial = data.os.serial
    const cluster = await prisma.cluster.findUnique({ where: { serial } })
    if (cluster && cluster.serial) throw new Conflict("Máy tính này đã được thêm vào trước đó")

    let password
    if (data.password) {
      const salt = await genSalt(5)
      password = await hash(data.password, salt)
    }

    await prisma.cluster.create({
      data: {
        password,
        host: data.host,
        serial: data.os.serial,
        ffmpeg: data.os.ffmpeg,
        port: Number(data.port),
        isPublic: data.isPublic,
        userId: session.user.id,
        platform: data.os.platform,
        processor: data.os.cpu.model,
        name: data.name || data.os.hostname,
      },
    })

    return Response.json({})
  } catch (error) {
    return Response.json(
      { success: false, error: { message: error.message } },
      { status: error.status || 500, statusText: error.statusText || "Internal Server Error" }
    )
  }
}
