import { expect, test } from "bun:test";

import youkuExtract from "./youku";
import { DEFN_LIST } from "./helper";

const videoTest = {
    id: "1235",
    name: "test video",
    cookieId: "67790c508b0622a1ba072524",
    nativeUrl: "https://www.youku.tv/v/v_show/id_XNTk3NzA3NDMyMA==.html",
    options: {
        subtitleType: "ass",
        targetAudioLanguage: "vi",
        targetSubtitleLanguage: "vi",
        downloadVideoQuality: "720P",
    },
};

test(
    "YOUKU EXTRACT",
    async () => {
        const result = await youkuExtract(videoTest);

        expect(result.subtitle.code).toBe("vi");
        expect(result.video["stream_type"]).toBe(DEFN_LIST["720P"]);
    },
    { timeout: 30 * 60 * 1000 },
);
