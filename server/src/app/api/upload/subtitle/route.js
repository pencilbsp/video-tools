import slug from "slug"
import subsrt from "subsrt"
import { getServerSession } from "next-auth"
// auth
import { authOptions } from "../../auth/[...nextauth]/route"
// libs
import prisma from "@/libs/prisma"
import fileHandler from "@/libs/file"
import { formatData } from "@/libs/format"
import { SUBTITLE_DIR, MAX_SUBTITLE_SIZE } from "@/libs/configs"
import { ContentTooLarge, NotFound, Unauthorized, UnsupportedMediaType, Forbidden } from "@/libs/error"

const subSelect = {
  id: true,
  name: true,
  userId: true,
  file: {
    select: {
      id: true,
      path: true,
      name: true,
      size: true,
    },
  },
}

const message = {
  style: {
    notFound: "Style không tồn tại hoặc đã bị xoá",
    tooLarge: `Kích thước style vượt quá ${formatData(MAX_SUBTITLE_SIZE)}`,
    unsupported: "Style chỉ có thể là tệp phụ đề ass",
  },
  subtitle: {
    notFound: "Phụ đề không tồn tại hoặc đã bị xoá",
    tooLarge: `Kích thước phụ đề vượt quá ${formatData(MAX_SUBTITLE_SIZE)}`,
    unsupported: "Chỉ chấp nhận tệp phụ đề srt, ass hoặc vtt",
  },
}

const getMessage = (type, name) => message[type][name]

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) throw new Unauthorized()

    const data = await request.formData()

    let file = null
    let subtitle = null
    const id = data.get("id")
    const name = data.get("name")
    const uploadFile = data.get("file")

    let options = data.get("options")
    if (options) options = JSON.parse(options)

    let subType = data.get("type")
    if (subType !== "style") subType = "subtitle"

    if (id) {
      // Update mode
      // Kiểm tra điều kiện khi update style
      subtitle = await prisma.subtitle.findUnique({ where: { id }, select: subSelect })
      if (!subtitle) throw new NotFound(getMessage(subType, "notFound"))
      if (subtitle.userId !== session.user.id) throw new Forbidden()
    } else {
      // Create mode
      // Tạo mới yêu cầu có tệp tin style
      if (!uploadFile) throw new Error("Tệp tin style không được bỏ trống")
    }

    // Handle upload file
    if (uploadFile && typeof uploadFile === "object") {
      if (uploadFile.size > MAX_SUBTITLE_SIZE) throw new ContentTooLarge(getMessage(subType, "tooLarge"))

      const input = await uploadFile.arrayBuffer()
      const fileContent = Buffer.from(input).toString()
      const type = subsrt.detect(fileContent)
      if (!["ass", "srt", "vtt"].includes(type)) throw new UnsupportedMediaType(getMessage(subType, "unsupported"))

      file = await fileHandler(uploadFile, SUBTITLE_DIR, { ext: type, mime: `text/${type}` })
    }

    if (!id) {
      // Create mode
      // Nếu tệp tin của style đã tồn tại thì bỏ qua việc tạo thêm style
      const subtitleName = name ?? file.name
      subtitle = await prisma.subtitle.findFirst({
        where: {
          fileId: file.id,
          userId: session.user.id,
        },
        select: subSelect,
      })

      if (subtitle) return Response.json({ success: true, double: true, subtitle })

      // Tạo style mới
      subtitle = await prisma.subtitle.create({
        data: {
          fileId: file.id,
          options: options,
          name: subtitleName,
          userId: session.user.id,
          isStyle: subType === "style" ? true : false,
          text: slug(subtitleName, { replacement: " " }),
        },
        select: subSelect,
      })
    } else {
      // Update mode
      const data = {}
      // Kiểm tra tên mới và tên cũ
      if (name !== subtitle.name) {
        data.name = name
        data.text = slug(name, { replacement: " " })
      }

      if (options) data.options = options

      // Kiểm tra tệp tin cũ và tệp tin mới
      if (file && file.id !== style.file.id) data.file = { connect: { id: file.id } }

      // Cập nhật dữ liệu mới nếu có tự thay đổi
      if (Object.keys(data).length > 0) {
        subtitle = await prisma.subtitle.update({ where: { id }, data, select: subSelect })
        return Response.json({ success: true, update: true, subtitle })
      }
    }

    return Response.json({ success: true, subtitle })
  } catch (error) {
    console.log(error)
    return Response.json(
      { success: false, error: { message: error.message } },
      { status: error.status || 500, statusText: error.statusText || "Internal Server Error" }
    )
  }
}
