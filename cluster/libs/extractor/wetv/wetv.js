import slug from "slug";
import { join } from "path";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";

import prisma from "@/libs/prisma.js";
import Cookie from "@/libs/cookie.js";
import FFmpeg from "@/libs/ffmpeg.js";
import { downloadFile } from "@/libs/download.js";
import { VIDEO_DIR, USER_AGENT } from "@/configs.js";
import { isWetv, getCKey, DEFN_LIST, generateGuid, WETV_LANG_CODE as LANG_CODE, getVideoQuality } from "./helper.js";

export default async function wetvExtract(_video, progressCallback, action = true) {
    const url = _video.nativeUrl;
    const options = _video.options;

    const _url = new URL(url);
    const cookie = new Cookie();
    const { vid, cid } = isWetv(url);
    const headers = new Headers({ "User-Agent": USER_AGENT });

    if (_video.cookieId) {
        const _cookie = await prisma.cookie.findUnique({ where: { id: _video.cookieId } });
        if (_cookie && _cookie.values) {
            cookie.set(_cookie.values);
            headers.set("Cookie", cookie.toString());
        }
    }

    const platform = 4830201;
    const appVersion = "2.6.22";
    const flowid = generateGuid(32);
    const timestamp = Math.floor(Date.now() / 1000);
    const guid = cookie.getValue("guid", generateGuid(32));
    const cKey = getCKey(vid, url, guid, { platform, appVersion, timestamp });

    const targetSubType = ["srt", "vtt"].indexOf(options.subtitleType);
    const spcaptiontype = targetSubType < 0 ? 0 : targetSubType;

    const subCode = Object.keys(LANG_CODE).includes(options.targetSubtitleLanguage)
        ? options.targetSubtitleLanguage
        : LANG_CODE.vi;
    const defn = Object.keys(DEFN_LIST).includes(options.downloadVideoQuality)
        ? DEFN_LIST[options.downloadVideoQuality]
        : DEFN_LIST["720P"];

    const query = new URLSearchParams({
        charge: 0,
        otype: "json",
        defnpayver: 0,
        spau: 1,
        spaudio: 1,
        spwm: 1,
        sphls: 1,
        host: _url.hostname,
        refer: _url.hostname,
        ehost: url,
        sphttps: 1,
        encryptVer: "8.1",
        cKey: cKey,
        clip: 4,
        guid: guid,
        flowid: flowid,
        platform: platform,
        sdtfrom: 1002,
        appVer: appVersion,
        unid: "",
        auth_from: "",
        auth_ext: "",
        vid: vid,
        defn: defn, // Video quality
        fhdswitch: 0,
        dtype: 3,
        spsrt: 1,
        tm: timestamp,
        lang_code: 1491994, // Tiếng Việt
        logintoken: "",
        spcaptiontype: spcaptiontype, // 1: vtt, 0: srt
        cmd: 2,
        country_code: 153513, // Việt Nam
        cid: cid,
        drm: 40, // Enable DRM
    }).toString();

    const response = await fetch("https://play.wetv.vip/getvinfo?" + query, { headers });
    const text = await response.text();

    let QZOutputJson = null;
    const data = eval(text);

    if (!data.vl && data.msg) throw new Error(data.msg);

    const isDRM = data.vl.vi[0].drm !== 0;
    const duration = parseInt(data.vl.vi[0].td);

    // Kiểm tra video có được bảo vệ bởi cộng nghệ DRM ko
    if (isDRM) throw new Error("Chưa hỗ trợ tải xuống video sử dụng DRM");
    // Kiểm tra video có yêu cầu tải khoản vip ko
    if (data.preview < duration) throw new Error("Video này yêu cầu tài khoản VIP");

    const videoList = data.fl.fi;
    const sources = data.vl.vi[0].ul.ui.map((u) => u.url + u.hls.pt);

    const subtitles = data.sfl.fi.map((sub) => {
        const index = Object.values(LANG_CODE).indexOf(sub.langId);
        const code = Object.keys(LANG_CODE)[index];
        return { id: sub.id, name: sub.name, url: sub.url, code, type: spcaptiontype === 1 ? "webvtt" : "srt" };
    });

    const subtitle = subtitles.find((stl) => stl.code === subCode);
    const videoQuality = getVideoQuality(videoList, defn, "max");

    const video = { ...videoQuality.video, sources, duration };

    // Tạo thư mục lưu trữ video
    const videoDir = join(VIDEO_DIR, _video.id);
    if (!existsSync(videoDir)) await mkdir(videoDir);

    const fileName = slug(_video.name ?? _video.id, { replacement: "." });

    // Tải xuống phụ đề cho video nếu có
    if (subtitle) {
        const subtitleExt = subtitle.type === "webvtt" ? "vtt" : subtitle.type;
        const subtitleName = `${fileName}.${subtitle.code}.${subtitleExt}`;
        const subtitlePath = join(videoDir, subtitleName);
        await downloadFile(subtitle.url.replace(".m3u8?ver=4", ""), subtitlePath);
        Object.assign(subtitle, { path: subtitlePath.replace(VIDEO_DIR, "") });
    }

    const qualityName = Object.keys(DEFN_LIST)[Object.values(DEFN_LIST).indexOf(defn)];
    const videoName = `${fileName}.${qualityName}.mp4`;
    const videoPath = join(videoDir, videoName);

    const ffmpeg = new FFmpeg(_video.id, sources[0], [], ["-c copy"]);
    action && (await prisma.video.update({ where: { id: _video.id }, data: { supportActions: true } }));

    ffmpeg.setStatus("downloading");
    ffmpeg.on("progress", (progress) => {
        // console.log("Đang tải xuống...", progress.percent)
        if (typeof progressCallback === "function") progressCallback(progress);
    });

    await ffmpeg.start(videoPath);
    Object.assign(video, { path: videoPath.replace(VIDEO_DIR, "") });
    action && (await prisma.video.update({ where: { id: _video.id }, data: { supportActions: false } }));

    return { video, subtitle };
}
