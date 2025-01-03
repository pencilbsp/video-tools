import { existsSync } from "fs";
import EventEmitter from "events";
import { mkdir } from "fs/promises";
import { basename, join, parse } from "path";

import { USER_AGENT } from "@/configs.js";
import { downloadFile } from "@/libs/download.js";
import { extractPssh, generateChallenge, mergeToFile, mixVideoWithAudio, parsePssh, widevineDecrypt } from "@/libs/widevine.js";

/**
 * Cảm ơn thông tin rất quan trọng từ
 * zackmark29 (https://forum.videohelp.com/members/295006-zackmark29)
 * Chi tiết thông tin: https://forum.videohelp.com/threads/408497-Find-Key-for-Iqiyi
 */

export default class IqDRM extends EventEmitter {
    count = 0;
    m3u8s = [];
    wvKeys = [];
    totalSegment = 0;
    progress = { message: "Đang phân tích drm", percent: 0, status: "downloading" };
    constructor(m3u8String, vid, drm, duration) {
        super();
        this.vid = vid;
        this.drm = drm;
        this.duration = duration;
        this.m3u8 = JSON.parse(m3u8String);
    }

    createGroups = (files) =>
        files.reduce((prev, current) => {
            const sourceId = current.file_name.split("?")[0].split("/").slice(-1)[0].split(".")[0];

            const pos = current.seekable.pos;
            const time = current.seekable.time;
            const index = prev.findIndex((g) => g.sourceId === sourceId);

            if (index > -1) {
                !pos && prev[index].seekable.pos.push(current.seekable["pos_end"]);
                !time && prev[index].seekable.time.push(current.seekable["time_end"]);
                prev[index].size += current.size;
                prev[index].durationSecond += current["duration_second"];
            } else {
                prev.push({
                    sourceId: sourceId,
                    size: current.size,
                    realIdx: prev.length,
                    url: current["file_name"],
                    startSecond: current["start_second"],
                    durationSecond: current["duration_second"],
                    seekable: {
                        pos: pos ?? [current.seekable["pos_start"], current.seekable["pos_end"]],
                        time: time ?? [current.seekable["time_start"], current.seekable["time_end"]],
                    },
                });
            }

            return prev;
        }, []);

    findWVKey = (kid) => {
        const key = this.wvKeys.find((key) => key.kid === kid);
        return key.kid + ":" + key.k;
    };
    // #findWVKey = (keyId) => this.wvKeys.find((key) => (key.key ?? key).startsWith(keyId));

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

    // #showProgress = (message, percent) => process.stdout.write(`${message}: ${percent.toFixed(2)}%\r`)

    downloadSegments = async (filePath, segments, initCodec, wvKey) => {
        const paths = [];
        const { ext, dir } = parse(filePath);
        const initCodecBuffer = Buffer.from(initCodec, "base64");

        this.progress.message = `Đang tải xuống ${this.count}/${this.totalSegment} phân đoạn`;
        this.count === 0 && this.emit("progress", this.progress);

        for (const segment of segments) {
            const segmentName = segment.realIdx + ext;
            const segmentPath = join(dir, segmentName);

            const options = { force: true };

            // const callback = ({ percent }) => this.#showProgress(`Đang tải xuống [${segmentName}]`, percent)

            await downloadFile(segment.url, segmentPath, {}, initCodecBuffer, options);
            const segmentPathDec = await widevineDecrypt(segmentPath, wvKey);

            this.count++;
            const percent = (this.count / this.totalSegment) * 100;
            this.progress.percent = parseInt(percent.toFixed(2));
            this.progress.message = `Đang tải xuống ${this.count}/${this.totalSegment} phân đoạn`;
            this.emit("progress", this.progress);

            paths.push(segmentPathDec);
        }

        this.progress.message = `Đang ghép các phân đoạn => [${basename(filePath)}]`;
        this.emit("progress", this.progress);
        await mergeToFile(filePath, paths);

        return filePath;
    };

    download = async (filePath, types = ["video", "audio"]) => {
        const { dir } = parse(filePath);
        if (!existsSync(dir)) await mkdir(dir, { recursive: true });

        const files = { audio: null, video: null };

        this.totalSegment = this.m3u8s.reduce((total, m3u8) => {
            if (types.includes(m3u8.type)) {
                total += m3u8.segments?.length ?? 0;
            }

            return total;
        }, 0);

        for (const _type of types) {
            const content = this.m3u8s.find(({ type }) => type === _type);
            if (!content || content.segments?.length === 0) continue;

            const contentExt = _type === "audio" ? ".aac" : ".mp4";
            const contentPath = join(dir, content.name + contentExt);

            files[_type] = await this.downloadSegments(contentPath, content.segments, content.initCodec, content.wvKey);
        }

        this.progress.message = `Đang ghép video và audio => [${basename(filePath)}]`;
        this.emit("progress", this.progress);
        if (files.audio && files.video) await mixVideoWithAudio(filePath, files.video, files.audio);
    };

    parseDRM = async () => {
        for (const trackName of Object.keys(this.m3u8.payload.wm_a)) {
            this.progress.message = `Đang phân tích dữ liệu drm [${trackName}]`;
            this.emit("progress", this.progress);

            const track = this.m3u8.payload.wm_a[trackName];
            const segments = this.createGroups(track.files);

            const keyId = track["key_id"];
            const initCodec = track["codec_init"];

            this.progress.message = `Đang trính xuất pssh [${trackName}]`;
            this.emit("progress", this.progress);

            const pssh = extractPssh(initCodec);

            this.progress.message = `Đang trính xuất widevine key [${trackName}]`;
            this.emit("progress", this.progress);

            await this.extractWVKey(parsePssh(pssh));
            const wvKey = this.findWVKey(keyId);

            this.progress.message = `Trích xuất widevine key [${trackName}] => ${wvKey}`;
            this.emit("progress", this.progress);

            this.m3u8s.push({ name: trackName, wvKey, pssh, type: track.type[0], initCodec, keyId, segments });
        }
    };
}
