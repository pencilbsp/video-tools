import sharp from "sharp"
import { getServerSession } from "next-auth"
import { fileTypeFromBuffer } from "file-type"
// auth
import { authOptions } from "../../auth/[...nextauth]/route"
// libs
import prisma from "@/libs/prisma"
import fileHandler from "@/libs/file"
import { formatData } from "@/libs/format"
import { LOGO_DIR, MAX_LOGO_SIZE } from "@/libs/configs"
import { ContentTooLarge, Unauthorized, UnsupportedMediaType } from "@/libs/error"

const acceptMimes = ["image/jpeg", "image/png"]
const logoSelect = {
  id: true,
  name: true,
  file: {
    select: {
      path: true,
    },
  },
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) throw new Unauthorized()

    const data = await request.formData()
    const uploadFile = data.get("file")

    if (uploadFile.size > MAX_LOGO_SIZE)
      throw new ContentTooLarge(`Kích thước logo vượt quá ${formatData(MAX_LOGO_SIZE)}`)

    const input = await uploadFile.arrayBuffer()
    const fileType = await fileTypeFromBuffer(input)

    if (!acceptMimes.includes(fileType.mime)) throw new UnsupportedMediaType("Định dạng logo không được hỗ trợ")

    const file = await fileHandler(uploadFile, LOGO_DIR, fileType)
    let logo = await prisma.logo.findFirst({
      where: {
        fileId: file.id,
        userId: session.user.id,
      },
      select: logoSelect,
    })

    if (!logo) {
      const metadata = await sharp(input).metadata()
      logo = await prisma.logo.create({
        data: {
          name: file.name,
          fileId: file.id,
          width: metadata.width,
          userId: session.user.id,
          height: metadata.height,
        },
        select: logoSelect,
      })
    }

    return Response.json({ success: true, logo })
  } catch (error) {
    return Response.json(
      { success: false, error: { message: error.message } },
      { status: error.status || 500, statusText: error.statusText || "Internal Server Error" }
    )
  }
}
