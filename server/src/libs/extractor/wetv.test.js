import { expect, test } from "bun:test";

import wetvVideoParse from "./wetv";

const testUrl =
    "https://wetv.vip/en/play/krp35ghl641h5uw-Wonderland%20of%20Love/n0047r8ek4f-EP1%3A%20Wonderland%20of%20Love";

test("Wetv Parser", async () => {
    const data = await wetvVideoParse(testUrl);
    expect(data).toBeArray();
    expect(data[0].vid).toBeString();
});
