import { join } from "path";

export const USER_AGENT =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";

export const PUBLIC_DIR = join(process.cwd(), "public");

export const UPLOAD_DIR = join(PUBLIC_DIR, "assets");

export const LOGO_DIR = join(UPLOAD_DIR, "logo");
export const SUBTITLE_DIR = join(UPLOAD_DIR, "subtitle");

export const MAX_LOGO_SIZE = 1024 * 1000;
export const MAX_SUBTITLE_SIZE = 1024 * 500;

export const SECRET_KEY = process.env.SECRET_KEY;

export const NEXT_AUTH_SECRET = process.env.NEXT_AUTH_SECRET;

export const defaultVideoOptions = {
    mode: "video",
    name: "",
    logo: null,
    style: null,
    cookie: null,
    nativeUrl: "",
    cluster: null,
    subtitle: null,
    options: {
        upload: false,
        videoScale: "",
        skipEncode: false,
        ffmpegOptions: [],
        namePrefix: "{name}",
        createDubbing: false,
        rootUploadFolderId: "",
        downloadVideoQuality: "720P",
        targetSubtitleLanguage: "vi",
        createUploadSubfolder: false,
        targetAudioLanguage: "default",
    },
};

export const videoOptionsMapName = {
    logo: "Logo",
    style: "Style phụ đề",
    cookieId: "Chọn cookie",
    createDubbing: "Tạo thuyết minh",
    namePrefix: "Thêm tiền tố vào tên",
    ffmpegOptions: "Tuỳ chỉnh lệnh ffmpeg",
    upload: "Tự động tải lên Google Drive",
    targetSubtitleLanguage: "Ngôn ngữ phụ đề",
    targetAudioLanguage: "Ngôn ngữ âm thanh",
    skipEncode: "Bỏ qua encode/chỉ tải video",
    videoScale: "Buộc encode video theo tỉ lệ",
    rootUploadFolderId: "ID thư mục gốc Google Drive",
    downloadVideoQuality: "Chất lương ưu tiên khi tải video",
    createUploadSubfolder: "Tạo thư mục con trong thư mục gốc",
};
