import { iqExtract } from "./iq/index.js"
import { wetvExtract } from "./wetv/index.js"
import { biliExtract } from "./bilibili/index.js"
import { IS_BILIBILI, IS_IQ, IS_WETV } from "../../configs.js"

export default function getExtractor(url) {
  if (IS_IQ.test(url)) return [iqExtract, "iq.com"]
  if (IS_WETV.test(url)) return [wetvExtract, "wetv.vip"]
  if (IS_BILIBILI.test(url)) return [biliExtract, "bilibili.tv"]
  // if (IS_GOOGLE_DRIVE.test(url)) return [googleDriveVideoParse, "drive.google.com"]

  throw new Error("URL không hợp lệ hoặc không được hỗ trợ")
}
