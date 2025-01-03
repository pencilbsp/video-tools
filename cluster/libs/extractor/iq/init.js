import { parse } from "path";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";

import Cookie from "../../../libs/cookie.js";
import { USER_AGENT } from "../../../configs.js";

export const IQ_LANG_CODE = {
    zh: 1, // Simplified Chinese
    "zh-tw": 2, // Traditional Chinese
    en: 3, // English
    ko: 4, // Korean
    ja: 5, // Japanese
    th: 18, // Thai
    vi: 23, // Vietnamese
    ar: 28, // Arabic
    es: 26, // Spanish
    ms: 21, // Bahasa Malaysia
    id: 24, // Bahasa Indonesia
};

export const BID_TAGS = {
    "240P": 100,
    "360P": 200,
    "480P": 300,
    "720P": 500,
    "1080P": 600,
    "1080P50": 610,
    "2K": 700,
    "4K": 800,
};

export const FORMATS_MAP = {
    96: 1, // 216p, 240p
    1: 2, // 336p, 360p
    2: 3, // 480p, 504p
    21: 4, // 504p
    4: 5, // 720p
    17: 5, // 720p
    5: 6, // 1072p, 1080p
    18: 7, // 1080p
};

const E = {
    1: {
        3: true,
        8: true,
        37: false,
        40: true,
        42: true,
        48: true,
    },
    2: {},
    4: {
        3: true,
        5: false,
        20: true,
        21: true,
        36: true,
    },
    5: {
        1: true,
        25: false,
    },
    7: {
        3: true,
    },
    b_ft1: {},
};

export function getFT(t) {
    for (var n = [], r = 1; r <= 64; r++) n.push(E[t][r] ? 1 : 0);
    return parseInt(n.reverse().join(""), 2);
}

/**
 *
 * @param {Cookie} cookie
 * @return {Promise<string[]>}
 */
export async function getUtList(cookie) {
    const uid = getUid(cookie);
    if (!uid) return [0];

    const query = new URLSearchParams({
        batch: "1",
        platformId: "3",
        modeCode: cookie.getValue("mod", "intl"),
        langCode: cookie.getValue("lang", "en_us"),
        deviceId: cookie.getValue("QC005"),
        uid: uid,
        vipInfoVersion: "5.0",
    });

    const response = await fetch("https://pcw-api.iq.com/api/vtype?" + query.toString(), {
        headers: {
            "User-Agent": USER_AGENT,
            Cookie: cookie.toString(),
        },
    });

    if (!response.ok) return [0];

    const data = await response.json();
    const vips = data.data["all_vip"];
    if (vips.length === 0) return [0];

    return [vips[vips.length - 1].vipType];
}

export function getUid(cookie) {
    const uidValue = cookie.getValue("I00002");
    if (!uidValue) return 0;

    const uidObj = JSON.parse(decodeURIComponent(uidValue));
    return uidObj.data.uid;
}

export class Bitmap {
    size = 0;
    data = null;
    constructor(size) {
        this.size = size;
        this.data = new Uint8Array(Math.ceil(this.size / 8));
    }

    getBit = (e) => {
        if (e >= 0 && e < this.size) {
            var t = e % 8,
                r = Math.floor(e / 8);
            return 0 != (this.data[r] & (1 << t));
        }
        return !1;
    };

    setBit = (e, t) => {
        if (e >= 0 && e < this.size) {
            var r = e % 8,
                n = Math.floor(e / 8);
            this.data[n] = !0 === t ? this.data[n] | (1 << r) : this.data[n] & ~(1 << r);
        }
    };
}

export class DrmHelper {
    Us = 1024;
    videoDataSize = 0;
    fastGC = this.videoDataSize;
    videoMaxSize = 134217728;
    size = 0;
    subPcNum = 0;
    subBitmap = null;
    runSubBitmap = null;
    sourceId = "";
    realIdx = "";
    vid = "";
    gpSID = 0;
    bsID = -1;
    esID = 0;
    constructor(size, vid, realIdx, sourceId) {
        this.vid = vid;
        this.size = size;
        this.realIdx = realIdx;
        this.sourceId = sourceId;
        this.subPcNum = Math.ceil(this.size / this.Us);
        this.esID = this.subPcNum;
        this.subBitmap = new Bitmap(this.size);
        this.runSubBitmap = new Bitmap(this.size);
    }

    checkGpSID = (e) => {
        for (
            this.gpSID = e;
            this.gpSID < this.subPcNum &&
            !(
                !this.runSubBitmap.getBit(this.gpSID) &&
                !this.subBitmap.getBit(this.gpSID) &&
                this.gpSID >= this.bsID &&
                this.gpSID <= this.esID
            );

        )
            this.gpSID++;
    };

    checkTask = (e, t) => {
        var r = Math.floor(e / this.Us),
            n = Math.min(this.subPcNum, Math.ceil(t / this.Us));
        (n - r) * this.Us + this.videoDataSize > this.videoMaxSize &&
            2 === fastGC &&
            (n = r + Math.floor((this.videoMaxSize - this.videoDataSize) / this.Us));
        for (var i = [], o = 0, a = -1, s = -1; r < n; )
            this.subBitmap.getBit(r)
                ? (-1 !== a && o++,
                  o >= 32 &&
                      (i.push({
                          begin: a * this.Us,
                          end: Math.min((s + 1) * this.Us, this.size),
                      }),
                      (a = -1),
                      (s = -1),
                      (o = 0)))
                : ((o = 0), -1 === a && (a = r), (s = r), this.runSubBitmap.setBit(r, !0)),
                r++;
        return (
            -1 !== a &&
                i.push({
                    begin: a * this.Us,
                    end: Math.min((s + 1) * this.Us, this.size),
                }),
            this.checkGpSID(this.gpSID),
            i
        );
    };
}

export async function fetchM3U8(video, headers) {
    const response = await fetch("https://intl-api.iq.com/3f4/cache-video.iq.com/" + video.dashPath, { headers });

    const data = await response.json();
    if (data.code !== "A00000") throw new Error(data.msg || "Đã xả ra lỗi khi gửi yêu cầu tới iq.com");

    return data.data.program.video.find((video) => video.m3u8 !== "");
}

export function checkRequireVip(video, ut) {
    if (video.t && video.t < video.duration) return true;
    if (Array.isArray(video.vut) && !video.vut.includes(ut)) return true;

    return false;
}

export function getVideoQuality(videos, bid, def = "max") {
    let video = videos.find((video) => video.bid === bid);

    if (!video) {
        bid = Math[def](...videos.map(({ bid }) => bid));
        video = videos.find((video) => video.bid === bid);
    }

    return { video, bid };
}

export async function createM3U8File(path, m3u8String) {
    const dir = parse(path).dir;
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });

    await writeFile(path, m3u8String);
}
