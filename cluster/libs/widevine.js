import { join, basename, parse } from "path"
import { writeFile, unlink } from "fs/promises"

import exec from "./exec.js"
import { GETWVKEYS_API, GETWVKEYS_API_KEY, USER_AGENT } from "../configs.js"

function base64ToHex(base64String) {
  const binaryBuffer = Buffer.from(base64String, "base64") // Decode Base64 thành Buffer
  let hexString = ""
  for (let i = 0; i < binaryBuffer.length; i++) {
    const hex = binaryBuffer[i].toString(16) // Chuyển đổi mỗi byte thành Hex
    hexString += hex.length === 1 ? "0" + hex : hex // Đảm bảo rằng mỗi byte có đúng 2 ký tự Hex
  }
  return hexString
}

function hexToBase64(hexString) {
  const buffer = Buffer.from(hexString, "hex")
  return buffer.toString("base64")
}

/**
 * Cảm ơn chia sẻ từ: https://lxlit.dev/posts/cdm-tools/obtaining-pssh/
 */

const VALID_PSSH = /70737368.*(?<pssh>.{8}70737368.*)/

export function extractPssh(cenc) {
  const hex = base64ToHex(cenc)
  const psshHex = VALID_PSSH.exec(hex).groups?.pssh
  return psshHex ? hexToBase64(psshHex) : ""
}

/**
 * Sponsored by https://getwvkeys.cc
 */

export async function extractWVKey({ license_url, pssh, cache, force }, headers = {}) {
  const payload = JSON.stringify({ license_url, pssh, cache, force })

  const response = await fetch(GETWVKEYS_API, {
    body: payload,
    method: "POST",
    headers: new Headers({
      "User-Agent": USER_AGENT,
      "X-API-Key": GETWVKEYS_API_KEY,
      "Content-Type": "application/json",
      ...headers,
    }),
  })

  const data = await response.json()
  return data.keys
}

export async function widevineDecrypt(videoPath, wvKey) {
  const decryptedVideoPath = videoPath + "_dec.mp4"
  await exec(`mp4decrypt --key ${wvKey} "${videoPath}" "${decryptedVideoPath}"`)

  await exec(`ffmpeg -i "${decryptedVideoPath}" -y -map_metadata -1 -c copy ${videoPath}`)

  await unlink(decryptedVideoPath)
  return videoPath
}

export async function mergeToFile(filePath, filePaths) {
  const cwd = parse(filePath).dir
  const fileListPath = join(cwd, "files.txt")
  const content = filePaths.map((path) => `file '${basename(path)}'`).join("\n")
  await writeFile(fileListPath, content)

  await exec(`ffmpeg -f concat -i "${basename(fileListPath)}" -y -c copy ${basename(filePath)}`, { cwd })

  await unlink(fileListPath)
  for (const path of filePaths) await unlink(path)
}

export async function mixVideoWithAudio(outputFile, videoPath, audioPath) {
  await exec(`ffmpeg -i "${videoPath}" -i ${audioPath} -y -c copy ${outputFile}`)
  await unlink(videoPath)
  await unlink(audioPath)
}
