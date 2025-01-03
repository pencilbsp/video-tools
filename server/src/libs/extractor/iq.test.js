import { expect, test } from "bun:test";

import iqVideoParse from "./iq";

const testUrl = "https://www.iq.com/play/paper-bride-2023-n360k9qb88?lang=en_us";
// const testUrl = "https://www.iq.com/play/my-journey-to-you-episode-1-2d9r925j7po?lang=en_us"

test("Iq Parser", async () => {
    const data = await iqVideoParse(testUrl);
    expect(data).toBeArray();
    expect(data[0].vid).toBeString();
});
