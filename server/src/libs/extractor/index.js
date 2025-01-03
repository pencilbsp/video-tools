import iqVideoParse from "./iq";
import wetvVideoParse from "./wetv";
import biliVideoParse from "./bilibili";
import youkuVideoParse from "./youku";
import googleDriveVideoParse from "./google-drive";
import { IS_BILIBILI, IS_GOOGLE_DRIVE, IS_IQ, IS_WETV, IS_YOUKU } from "../validate";

export default function getExtractor(url) {
    if (IS_IQ.test(url)) return [iqVideoParse, "iq.com"];
    if (IS_WETV.test(url)) return [wetvVideoParse, "wetv.vip"];
    if (IS_YOUKU.test(url)) return [youkuVideoParse, "youku.tv"];
    if (IS_BILIBILI.test(url)) return [biliVideoParse, "bilibili.tv"];
    if (IS_GOOGLE_DRIVE.test(url)) return [googleDriveVideoParse, "drive.google.com"];

    throw new Error("URL không hợp lệ hoặc không được hỗ trợ");
}
