import { platform } from "os";
import { existsSync } from "fs";
import EventEmitter from "events";
import { mkdir } from "fs/promises";
import { Parser } from "m3u8-parser";
import { spawn } from "child_process";
import { basename, join, parse } from "path";

import { USER_AGENT } from "@/configs.js";
import { waiting_file_exists } from "@/libs/file";
import { base64toUint8Array, uint8ArrayToBase64 } from "@/libs/widevine/util.js";
import { generateChallenge, mixVideoWithAudio, widevineDecrypt } from "@/libs/widevine.js";

export default class YoukuDRM extends EventEmitter {
    count = 0;
    m3u8s = [];
    wvKeys = new Map();
    files = { audio: null, video: null };
    totalSegment = 0;
    progress = { message: "Đang phân tích drm", percent: 0, status: "downloading" };
    constructor(m3u8String, vid, drm, duration) {
        super();
        this.vid = vid;
        this.drm = drm;
        this.m3u8 = m3u8String;
        this.duration = duration;
    }

    findWVKey = (kid) => {
        const key = this.wvKeys.get(kid)[0];
        return key.kid + ":" + key.k;
    };

    extractWVKey = async (pssh) => {
        if (this.wvKeys.length > 0) return;
        const { session, challenge } = await generateChallenge(pssh);
        const response = await fetch(this.drm.wvlhost, {
            method: "POST",
            body: challenge,
            headers: {
                "User-Agent": USER_AGENT,
            },
        });

        const license = await response.arrayBuffer();
        this.wvKeys = await session.parseLicense(license);
        // this.wvKeys = await extractWVKey({ license_url: this.drm.wvlhost, pssh, force: true });
    };

    getAudio = (audioList, lang) => {
        if (lang) {
            const audio = audioList.find((a) => a.language === lang);
            if (audio) return audio;
        }

        return audioList.find((audio) => audio.default) ?? audioList[0];
    };

    async parse(audio_lang, drmKeys = []) {
        const m3u8 = await this.loadM3u8(this.m3u8);
        if (m3u8.playlists.length === 0) throw new Error("M3u8 không chứa luồng video nào");

        this.files.video = m3u8.playlists[0];

        const audioKey = this.files.video["attributes"]["AUDIO"];
        if (audioKey && m3u8.mediaGroups["AUDIO"]) {
            const audioList = Object.values(m3u8.mediaGroups["AUDIO"][audioKey]);
            this.files.audio = this.getAudio(audioList, audio_lang);
        }

        for (const type of Object.keys(this.files)) {
            if (this.files[type] === null) continue;

            const m3u8 = await this.loadM3u8(this.files[type]["uri"]);
            this.files[type].m3u8 = m3u8;

            const wv = m3u8.contentProtection["com.widevine.alpha"];
            const kid = wv["attributes"].keyId;
            this.files[type].kid = kid;

            if (this.wvKeys.has(kid)) continue;

            if (Array.isArray(drmKeys) && drmKeys.length > 0) {
                const key = drmKeys.find(({ copyright_key }) => this.drm["copyright_key"] === copyright_key);
                const k = key.result.map((num) => num.toString(16).padStart(2, "0")).join("");
                this.wvKeys.set(kid, [{ k, kid }]);
                continue;
            }

            const { pathname, searchParams, origin } = new URL(this.drm.uri);
            const payload = searchParams;
            payload.set("drmType", "widevine");

            const { challenge, session } = await generateChallenge(wv.pssh);

            payload.set("licenseRequest", uint8ArrayToBase64(challenge));

            const response = await fetch(origin + pathname, {
                method: "POST",
                body: payload.toString(),
                headers: {
                    "user-agent": USER_AGENT,
                    "content-type": "application/x-www-form-urlencoded",
                },
            });

            if (!response.ok) {
                throw new Error("Không thể tải xuống key widevine");
            }

            const result = await response.json();

            const keys = await session.parseLicense(base64toUint8Array(result.data));
            this.wvKeys.set(kid, keys);
        }
    }

    // #showProgress = (message, percent) => process.stdout.write(`${message}: ${percent.toFixed(2)}%\r`)

    async download_sengment(uri, output_path, check_certificate) {
        return new Promise(async (resolve, reject) => {
            const command = "yt-dlp";
            const args = [
                "--progress",
                // "--no-check-certificate",
                // "--external-downloader",
                // "aria2c",
                "--allow-unplayable-formats",
                // "--verbose",
                "--hls-use-mpegts",
                uri,
                "-o",
                output_path,
            ];

            // Thêm `--no-check-certificate` nếu `check_certificate` là `false`
            if (!check_certificate) {
                const insert_index = 1; // Vị trí muốn thêm, ngay sau "yt-dlp"
                args.splice(insert_index, 0, "--no-check-certificate");
            }

            // Chạy yt-dlp
            // console.log(command + " " + args.join(" "));
            const process = spawn(command, args);

            let current = 0;

            // Xử lý đầu ra
            process.stdout.on("data", (data) => {
                const output = data.toString();
                const match = output.match(/\[download\]\s+([\d.]+)%.*?at\s+(.*?\/s).*?\(frag\s([\d]+\/[\d]+)\)/);

                if (match) {
                    const frag = match[3].split("/");
                    current = this.count + parseInt(frag[0]);

                    const percent = (current / this.totalSegment) * 100;
                    this.progress.percent = parseInt(percent.toFixed(2));
                    this.progress.message = `Đang tải xuống ${current}/${this.totalSegment} phân đoạn`;
                    this.emit("progress", this.progress);
                }
            });

            process.on("close", async (code) => {
                if (code === 0) {
                    this.count = current;
                    await waiting_file_exists(output_path);
                    return resolve();
                }

                return reject(new Error(`Process exited with code: ${code}`));
            });
        });
    }

    loadM3u8 = async (m3u8String) => {
        if (m3u8String.startsWith("http")) {
            const response = await fetch(m3u8String);
            m3u8String = await response.text();
        }

        if (!m3u8String.startsWith("#EXTM3U")) {
            throw new Error("Định dạng m3u8 không hợp lệ");
        }

        const parser = new Parser();
        parser.push(m3u8String);
        parser.end();

        return parser.manifest;
    };

    download = async (filePath, types = ["video", "audio"]) => {
        const { dir, name } = parse(filePath);
        if (!existsSync(dir)) await mkdir(dir, { recursive: true });

        const files = { audio: null, video: null };

        this.totalSegment = types.reduce((total, key) => {
            const content = this.files[key];
            if (content) {
                total += content.m3u8.segments?.length ?? 0;
            }

            return total;
        }, 0);

        for (const type of types) {
            const content = this.files[type];
            if (!content || content.segments?.length === 0) continue;

            const contentExt = type === "audio" ? ".aac" : ".mp4";
            const contentPath = join(dir, name + contentExt);

            await this.download_sengment(content.uri, contentPath);
            files[type] = await widevineDecrypt(contentPath, this.findWVKey(content.kid));
        }

        this.progress.message = `Đang ghép video và audio => [${basename(filePath)}]`;
        this.emit("progress", this.progress);
        if (files.audio && files.video) await mixVideoWithAudio(filePath, files.video, files.audio);
    };
}
