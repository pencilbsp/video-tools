import { promisify } from "util";
import { fileURLToPath } from "url";
import _serialNumber from "serial-number";
import { join, resolve, dirname } from "path";

_serialNumber.preferUUID = true;
const serialNumber = promisify(_serialNumber);

// Lấy đường dẫn tệp hiện tại
const __filename = fileURLToPath(import.meta.url);

// Lấy thư mục chứa tệp hiện tại
const __dirname = dirname(__filename);

export const ROOT_DIR = resolve(__dirname);

export const SERVER_URL = process.env.SERVER_URL;

export const GETWVKEYS_API = process.env.GETWVKEYS_API;

export const CHROME_PATH = process.env.CHROME_PATH;

export const WD_NAME = process.env.WD_NAME;

export const GETWVKEYS_API_KEY = process.env.GETWVKEYS_API_KEY;

export const MAX_ENCODE_TASK = Number(process.env.MAX_ENCODE_TASK || 1);

export const MAX_DOWNLOAD_TASK = Number(process.env.MAX_DOWNLOAD_TASK || 2);

export const ASSETS_PATH = join(ROOT_DIR, "assets");

export const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";

export const IS_WETV = /^https:\/\/wetv\.vip(?:\/\w{2}|)\/play\/.+$/;

export const IS_IQ = /^https:\/\/(?:www.|)iq\.com\/(?:play|album)\/.+$/;

export const IS_YOUKU = /^https:\/\/(?:www.|)youku\.tv\/v\/(?:v_show)\/.+$/;

export const IS_GOOGLE_DRIVE = /^https:\/\/drive\.google\.com\/(?:drive\/folders|file\/d)\/.+$/;

export const IS_BILIBILI = /^https:\/\/(?:www.|)bilibili\.tv(?:\/\w{2}|)\/play\/.+$/;

export const PUBLIC_DIR = join(ROOT_DIR, "public");

export const M3U8_DIR = join(PUBLIC_DIR, "m3u8");

export const TMP_DIR = join(PUBLIC_DIR, "tmp");

export const VIDEO_DIR = join(PUBLIC_DIR, "video");

export const getClusterSerial = () => serialNumber();

export const START_TIME = new Date();
