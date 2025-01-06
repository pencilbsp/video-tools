import { expect, test } from "bun:test";

import { wetvExtract, DEFN_LIST } from "./index";

const testUrl =
    "https://wetv.vip/vi/play/sgynhsgc43q8mtg-Đại%20Phụng%20Đả%20Canh%20Nhân/p4100xx8ko6-EP19%3A%20Đại%20Phụng%20Đả%20Canh%20Nhân";

const testVideo = {
    vid: "p4100xx8ko6",
    id: "6571be67231006bce9714b3c",
    name: "Đại Phụng Đả Canh Nhân 19",
    options: {
        subtitleType: "srt",
        downloadVideoQuality: "720P",
        targetSubtitleLanguage: "vi",
    },
    nativeUrl: testUrl,
    userId: "65631af7562ba00fa726d8f6",
    cookieId: "656c21f2030a554f8cf02ed7",
    updatedAt: "2023-12-07T12:55:12.768Z",
    createdAt: "2023-12-07T12:45:27.443Z",
};

test(
    "WETV EXTRACT",
    async () => {
        const result = await wetvExtract(testVideo, null, false);

        expect(result.subtitle.code).toBe("vi");
        expect(result.video.name).toBe(DEFN_LIST["720P"]);
    },
    { timeout: 30 * 60 * 1000 },
);
