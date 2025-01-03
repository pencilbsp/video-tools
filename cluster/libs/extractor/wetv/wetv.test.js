import { expect, test } from "bun:test";

import { wetvExtract, DEFN_LIST } from "./index";

const testUrl =
    "https://wetv.vip/en/play/sgynhsgc43q8mtg-Guardians%20of%20the%20Dafeng/j4100chcwca-EP01%3A%20Guardians%20of%20the%20Dafeng";

const testVideo = {
    vid: "j4100chcwca",
    id: "6571be67231006bce9714b3c",
    name: "Guardians of the Dafeng 01",
    options: {
        subtitleType: "srt",
        downloadVideoQuality: "720P",
        targetSubtitleLanguage: "vi",
    },
    nativeUrl: testUrl,
    userId: "65631af7562ba00fa726d8f6",
    updatedAt: "2023-12-07T12:55:12.768Z",
    createdAt: "2023-12-07T12:45:27.443Z",
};

test(
    "IQ EXTRACT",
    async () => {
        const result = await wetvExtract(testVideo, null, false);

        expect(result.subtitle.code).toBe("vi");
        expect(result.video.name).toBe(DEFN_LIST["720P"]);
    },
    { timeout: 30 * 60 * 1000 },
);
