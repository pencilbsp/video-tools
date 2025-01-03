import { expect, test } from "bun:test";

import youkuExtract from "./youku";
import { DEFN_LIST } from "./helper";

const videoTest = {
    id: "1235",
    name: "test video",
    cookieId: "6777c54f4a3a1e7b0295ea43",
    nativeUrl: "https://www.youku.tv/v/v_show/id_XNjQ0NDYxNTAwOA==.html",
    options: {
        subtitleType: "ass",
        targetAudioLanguage: "vi",
        targetSubtitleLanguage: "vi",
        downloadVideoQuality: "1080P",
    },
};

// test(
//     "YOUKU EXTRACT",
//     async () => {
//         const result = await youkuExtract(videoTest);

//         // expect(result.subtitle.code).toBe("vi");
//         // expect(result.video["stream_type"]).toBe(DEFN_LIST["720P"]);
//     },
//     { timeout: 30 * 60 * 1000 }
// );

try {
    const result = await youkuExtract(videoTest);
} catch (error) {
    console.log(error);
}
