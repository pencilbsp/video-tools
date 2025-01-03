import { join, parse } from "path"
import { createReadStream } from "fs"
import { unlink, writeFile } from "fs/promises"
import { createHash, randomUUID } from "crypto"

import prisma from "./prisma"
import { PUBLIC_DIR } from "./configs"

export default async function fileHandler(uploadFile, rootDir, fileType) {
  const tempName = randomUUID()
  const { ext } = parse(uploadFile.name)
  const filePath = join(rootDir, tempName + ext)
  const buffer = await toBuffer(uploadFile.stream())
  await writeFile(filePath, buffer)

  const md5Checksum = await createMd5Checksum(filePath)
  let file = await prisma.file.findUnique({ where: { md5Checksum } })
  if (file) await unlink(filePath)
  else
    file = await prisma.file.create({
      data: {
        md5Checksum,
        ext: fileType.ext,
        name: uploadFile.name,
        size: uploadFile.size,
        mimeType: fileType.mime,
        path: filePath.replace(PUBLIC_DIR, ""),
      },
    })

  return file
}

export async function toBuffer(stream) {
  const list = []
  const reader = stream.getReader()
  while (true) {
    const { value, done } = await reader.read()
    if (value) list.push(value)
    if (done) break
  }
  return Buffer.concat(list)
}

export function createMd5Checksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("md5")
    const stream = createReadStream(filePath)
    stream.on("error", (error) => reject(error))
    stream.on("data", (data) => hash.update(data))
    stream.on("end", () => resolve(hash.digest("hex")))
  })
}
