import subsrt from "subsrt"
import { existsSync } from "fs"
import { join, parse } from "path"
import { readFile, writeFile } from "fs/promises"

import exec from "./exec.js"

export async function toAssSubtitle(subtitlePath) {
  if (!existsSync(subtitlePath)) throw new Error("Tệp tin phụ đề không tồn tại")

  const subtitleContent = await readFile(subtitlePath, "utf-8")

  const format = subsrt.detect(subtitleContent)
  if (!["srt", "vtt", "json", "ass"].includes(format)) throw new Error("Loại phụ đề không được hỗ trợ")

  if (format === "ass") return subtitlePath

  const { name, dir } = parse(subtitlePath)
  const assSubtitlePath = join(dir, name + ".ass")
  await exec(`ffmpeg -i ${subtitlePath} -y ${assSubtitlePath}`)
  return assSubtitlePath
}

const VALID_STYLE = /^Style:\s((?:.*?,|,){22}[\d]+)$/
// const VALID_FORMAT = /^Format:\s(?<format>(?:.*?,|,){9})(?<text>.*)$/
const VALID_SUBLINE = /^Dialogue:\s(?<format>(?:.*?,|,){9})(?<text>.*)$/

const subtitleLabels = ["Layer", "Start", "End", "Style", "Name", "MarginL", "MarginR", "MarginV", "Effect", "Text"]
const styleLabels = [
  "Name",
  "Fontname",
  "Fontsize",
  "PrimaryColour",
  "SecondaryColour",
  "OutlineColour",
  "BackColour",
  "Bold",
  "Italic",
  "Underline",
  "StrikeOut",
  "ScaleX",
  "ScaleY",
  "Spacing",
  "Angle",
  "BorderStyle",
  "Outline",
  "Shadow",
  "Alignment",
  "MarginL",
  "MarginR",
  "MarginV",
  "Encoding",
]

function getFormat(line) {
  const { text, format } = VALID_SUBLINE.exec(line).groups
  const formats = format.split(",")
  return formats.reduce((prev, current, index) => {
    prev[subtitleLabels[index]] = index === subtitleLabels.length - 1 ? text : current
    return prev
  }, {})
}

function getStyle(line) {
  const values = line.match(VALID_STYLE)[1].split(",")
  return values.reduce((prev, current, index) => {
    prev[styleLabels[index]] = current
    return prev
  }, {})
}

function parseAssSubtitle(subtitleContent) {
  const styles = subtitleContent.match(new RegExp(VALID_STYLE, "gm")).map(getStyle)
  const subtitles = subtitleContent.match(new RegExp(VALID_SUBLINE, "gm")).map(getFormat)
  const header = subtitleContent.match(/\[Script\sInfo\][\r\n]+(?:.*?[\r\n]+)*?\[V4\+\sStyles\]/)[0]
  return { styles, subtitles, header }
}

class Subtitle {
  constructor(content, styleName) {
    this.content = content
    this.mainStyle = styleName ?? "Default"
    const data = parseAssSubtitle(this.content)

    this.styles = data.styles
    this.header = data.header
    this.subtitles = data.subtitles
  }

  removeLineByStyle = (styleName) => {
    this.subtitles = this.subtitles.filter(({ Style }) => Style !== styleName)
  }

  addLine = (line) => {
    this.subtitles.push({ ...line, Style: this.mainStyle })
  }

  toString = () => {
    const contents = [this.header]

    contents.push(
      ...[
        "Format: " + styleLabels.join(", "),
        ...this.styles.map((style) => "Style: " + Object.values(style).join(",")),
      ]
    )

    contents.push("\r\n[Events]")
    contents.push(
      ...[
        "Format: " + subtitleLabels.join(", "),
        ...this.subtitles.map((line) => "Dialogue: " + Object.values(line).join(",")),
      ]
    )

    return contents.join("\r\n")
  }
}

export async function mergeStyle(stylePath, subtitlePath, styleName) {
  const sytleContent = await readFile(stylePath, "utf-8")
  const subtitle = new Subtitle(sytleContent, styleName)
  subtitle.removeLineByStyle(styleName)

  const subtitleContent = await readFile(subtitlePath, "utf-8")
  const lines = parseAssSubtitle(subtitleContent).subtitles
  lines.forEach((line) => subtitle.addLine(line))

  await writeFile(subtitlePath, subtitle.toString())
}
