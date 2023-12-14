import { existsSync } from "fs"
import { mkdir } from "fs/promises"
import { basename, join, parse } from "path"

import { downloadFile } from "./download.js"
import { ASSETS_PATH, SERVER_URL } from "../configs.js"

export async function getServerFile(file, workDir = ASSETS_PATH) {
  const filePath = join(workDir, basename(file.path))
  

  if (!existsSync(filePath)) {
    const { dir } = parse(filePath)
    if (!existsSync(dir)) await mkdir(dir)
    await downloadFile(SERVER_URL + file.path, filePath)
  }

  return filePath
}
