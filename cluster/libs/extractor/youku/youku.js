import slug from "slug";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import { mkdir, rm } from "node:fs/promises";
import { connect } from "puppeteer-real-browser";
import { closeResources, DEFN_LIST, YOUKU_LANG_CODE as LANG_CODE } from "./helper";

import YoukuDRM from "./drm";
import prisma from "@/libs/prisma";
import { CHROME_PATH, VIDEO_DIR } from "@/configs";
import { downloadFile } from "@/libs/download";

export const SUPPORT_SUBTITLE_TYPES = ["ass"];

export default async function youkuExtract(_video, progressCallback) {
    let browser, page, videoDir;

    try {
        const url = _video.nativeUrl;
        const options = _video.options;

        const vid = url.match(/id_(.*?)\.html/)[1];

        if (!options.targetAudioLanguage || options.targetAudioLanguage === "default") {
            options.targetAudioLanguage = "guoyu";
        }

        const subtitleType = SUPPORT_SUBTITLE_TYPES.includes(options.subtitleType)
            ? options.subtitleType
            : SUPPORT_SUBTITLE_TYPES[0];
        const subCode = Object.keys(LANG_CODE).includes(options.targetSubtitleLanguage)
            ? options.targetSubtitleLanguage
            : LANG_CODE.vi;
        const defn = Object.keys(DEFN_LIST).includes(options.downloadVideoQuality)
            ? DEFN_LIST[options.downloadVideoQuality]
            : DEFN_LIST["720P"];

        const realOptions = {
            args: [],
            skipTarget: [],
            turnstile: true,
            headless: "auto",
            customConfig: {},
            connectOption: {
                defaultViewport: null,
            },
            fingerprint: true,
        };

        if (CHROME_PATH) {
            realOptions.customConfig.chromePath = CHROME_PATH;
        }

        const real = await connect(realOptions);
        page = real.page;
        browser = real.browser;

        // Bao bọc hàm window._sce_dlgtqred khi nó được định nghĩa
        await page.evaluateOnNewDocument(() => {
            window.drmKeys = [];
            Object.defineProperty(window, "_sce_dlgtqred", {
                configurable: true,
                enumerable: true,
                set(value) {
                    if (typeof value === "function") {
                        const originalFunction = value; // Lưu hàm gốc
                        Object.defineProperty(window, "_sce_dlgtqred", {
                            value: function (...args) {
                                const key = {
                                    R1: args[0],
                                    result: null,
                                    copyright_key: args[2],
                                    encryptR_server: args[1],
                                };
                                key.result = originalFunction.apply(this, args);
                                window.drmKeys.push(key);
                                return key.result;
                            },
                            writable: true,
                            configurable: true,
                        });
                    }
                },
                get() {
                    return undefined; // Trả về undefined nếu truy cập trước khi khai báo
                },
            });
        });

        if (_video.cookieId) {
            const cookie = await prisma.cookie.findUnique({ where: { id: _video.cookieId } });

            if (cookie && Array.isArray(cookie.values)) {
                await browser.setCookie(
                    ...cookie.values.map((c) => ({ ...c, sameSite: c.sameSite === null ? "None" : c.sameSite })),
                );
            }
        }

        await page.goto(url, { waitUntil: "domcontentloaded" });
        const response = await page.waitForResponse((response) =>
            response.url().includes("mtop.youku.play.ups.appinfo.get"),
        );

        // Xử lý dữ liệu từ response
        const data = await response.text();
        const { searchParams } = new URL(response.url());
        const callback = searchParams.get("callback");
        const json = JSON.parse(data.trim().slice(callback.length + 1, -1));

        // Giả lập khai báo hàm và gọi từ Node.js
        const drmKeys = await page.evaluate(() => window.drmKeys);

        await closeResources(page, browser);

        if (json?.data?.data?.error) {
            throw new Error(json.data.data.error.note);
        }

        const stream = json?.data?.data?.stream || [];

        const video = stream.find((item) => item.stream_type === defn);
        if (!video) {
            throw new Error("Không tìm thấy video");
        }

        videoDir = join(VIDEO_DIR, _video.id);
        if (!existsSync(videoDir)) await mkdir(videoDir, { recursive: true });

        const fileName = slug(_video.name || _video.id || vid, { replacement: "." });
        const qualityName = Object.keys(DEFN_LIST)[Object.values(DEFN_LIST).indexOf(defn)];

        const videoName = fileName + "." + qualityName + ".mp4";
        const videoPath = join(videoDir, videoName);

        const subtitles = (json?.data?.data?.subtitle || []).map((sub) => {
            const index = Object.values(LANG_CODE).indexOf(sub["subtitle_lang"]);
            return {
                url: sub.url,
                name: sub["subtitle_info"][0],
                id: vid + sub["subtitle_lang"],
                type: extname(sub.url).slice(1),
                code: Object.keys(LANG_CODE)[index],
            };
        });
        const subtitle = subtitles.find((item) => item.code === subCode && item.type === subtitleType);

        if (subtitle) {
            const subtitleName = `${fileName}.${subtitle.code}.${subtitleType}`;
            const subtitlePath = join(videoDir, subtitleName);
            await downloadFile(subtitle.url, subtitlePath, undefined, undefined, { force: true });
            Object.assign(subtitle, { path: subtitlePath.replace(VIDEO_DIR, "") });
        }

        // Check DRM

        if (video && video["stream_ext"]) {
            // console.log(video["drm_type"]);
            // cbcs | copyrightDRM
            const drm = new YoukuDRM(video["m3u8_url"], vid, video["stream_ext"], video["stream_ext"]["hls_duration"]);
            drm.on("progress", (progress) => {
                if (progressCallback) progressCallback(progress);
            });

            await drm.parse(options.targetAudioLanguage || "guoyu", drmKeys);
            await drm.download(videoPath);
        } else {
            throw new Error("No DRM");
        }

        Object.assign(video, { path: videoPath.replace(VIDEO_DIR, "") });

        return { video, subtitle };
    } catch (error) {
        if (videoDir) {
            try {
                await rm(videoDir, { recursive: true, force });
            } catch (error) {}
        }
        await closeResources(page, browser);
        throw error;
    }
}
