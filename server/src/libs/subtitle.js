const VALID_STYLE = /^Style:\s((?:.*?,|,){22}[\d]+)$/
const VALID_FORMAT = /^Format:\s(?<format>(?:.*?,|,){9})(?<text>.*)$/
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

export function parseAssSubtitle(subtitleContent) {
  const styles = subtitleContent.match(new RegExp(VALID_STYLE, "gm")).map(getStyle)
  const subtitles = subtitleContent.match(new RegExp(VALID_SUBLINE, "gm")).map(getFormat)
  const header = subtitleContent.match(/\[Script\sInfo\][\r\n]+(?:.*?[\r\n]+)*?\[V4\+\sStyles\]/)[0]
  return { styles, subtitles, header }
}
