import slug from "slug";
import { join } from "path";
import { JSDOM } from "jsdom";
import { unlink } from "fs/promises";

import FFmpeg from "../../../libs/ffmpeg.js";
import Cookie from "../../../libs/cookie.js";
import prisma from "../../../libs/prisma.js";
import { QN_MAP, BILI_LANG_CODE } from "./helper.js";
import { jsonToSrt } from "../../../libs/subtitle.js";
import { downloadFile } from "../../../libs/download.js";
import { VIDEO_DIR, USER_AGENT } from "../../../configs.js";
// import { de } from "date-fns/locale";

// const platform = "web";
// const s_locale = "vi_VN";
// const spm_id = "bstar-web.pgc-video-detail.0.0";
// const from_spm_id = "bstar-web.pgc-video-detail.episode.all";

export default async function biliExtract(_video, progressCallback) {
    // const url = _video.nativeUrl
    const options = _video.options;

    const cookie = new Cookie();
    const url = new URL(_video.nativeUrl);
    const headers = new Headers({ "User-Agent": USER_AGENT, Origin: url.origin, Referer: `${url.origin}/` });

    if (_video.cookieId) {
        const _cookie = await prisma.cookie.findUnique({ where: { id: _video.cookieId } });
        if (_cookie && _cookie.values) {
            cookie.set(_cookie.values);
            // console.log(cookie.toString())
            headers.set("Cookie", cookie.toString());
        }
    }

    // console.log("Fetching video data from Bilibili...", headers);

    const quality = QN_MAP[options.downloadVideoQuality] ?? 64;
    const subtitleLang = BILI_LANG_CODE[options.targetSubtitleLanguage] ?? "vi";

    const response = await fetch(url, { headers });
    const html = await response.text();

    const dom = new JSDOM(html);
    const scriptTags = Array.from(dom.window.document.querySelectorAll("script"));
    const initialStateScript = scriptTags.find((tag) => tag.textContent.includes("window.__initialState"));

    if (!initialStateScript) throw new Error("Không thể tìm thấy dữ liệu video");

    // Extract the JSON data from the script content
    const scriptContent = initialStateScript.textContent;
    var window = {};

    eval(scriptContent);

    const playerState = window.__initialState.player;
    if (!playerState) throw new Error("Không thể tìm thấy dữ liệu video");

    const videoTyepes = Object.keys(playerState.playUrl);

    if (!videoTyepes.length) throw new Error("Không thể tìm thấy dữ liệu video");

    const videoType = videoTyepes[0];
    const videoData = playerState.playUrl[videoType];

    const video = videoData.video.find((v) => v.id === quality);
    const audio = videoData.audio.find((audio) => audio.quality === video["audio_quality"]);

    if (!video || !audio) throw new Error("Không tìm thấy dữ liệu video hoặc âm thanh");

    let subtitle = playerState.subtitleList.find((subtitle) => subtitle.key === subtitleLang);
    const videoDir = join(VIDEO_DIR, _video.id);
    const videoName = slug(_video.name, { replacement: "." });
    let subType = ["srt", "ass"].includes(options.subtitleType) ? options.subtitleType : "ass";

    if (subtitle) {
        const subtitleName = `${videoName}.${subtitleLang}.${subType}`;
        const subtitlePath = join(videoDir, subtitleName);

        switch (subType) {
            case "srt":
                await jsonToSrt(subtitle.url, subtitlePath);
                subtitle.path = subtitlePath.replace(VIDEO_DIR, "");
                break;
            case "ass":
                await downloadFile(subtitle.assUrl, subtitlePath);
                subtitle.path = subtitlePath.replace(VIDEO_DIR, "");
                break;
            default:
                subtitle = null;
                break;
        }
    }

    const qualityName = getFileName(QN_MAP, quality);
    const videoPath = join(videoDir, `${videoName}.mp4`);
    const audioPath = join(videoDir, `${videoName}.aac`);
    const videoMuxedPath = join(videoDir, `${videoName}.${qualityName}.mp4`);

    const headersObject = Object.fromEntries(Array.from(headers.entries()));

    let count = 0;
    let realPercent = 0;
    const handleProgress = ({ percent }) => {
        percent = count + percent / 2;
        if (percent > realPercent + 1 && progressCallback) {
            realPercent = percent;
            progressCallback({ percent: realPercent });
        }
    };

    await downloadFile(audio["base_url"], audioPath, headersObject, null, {}, handleProgress);
    count += 50;

    await downloadFile(video["base_url"], videoPath, headersObject, null, {}, handleProgress);

    const ffmpeg = new FFmpeg(_video.id, videoPath, [], ["-c copy"]);
    ffmpeg.addInput(audioPath);
    await ffmpeg.start(videoMuxedPath);

    await unlink(audioPath);

    if (progressCallback) progressCallback({ percent: 100 });

    return { video: { ...video, path: videoMuxedPath.replace(VIDEO_DIR, "") }, subtitle };
}

function getFileName(objName, key) {
    return Object.keys(objName)[Object.values(objName).indexOf(key)];
}
