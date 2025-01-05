import { expect, test } from "bun:test";

import youkuVideoParse from "./youku";

const testUrl = "https://www.youku.tv/v/v_show/id_XNjQ0ODE0NjE3Mg==.html";

test("Youku Parser", async () => {
    const data = await youkuVideoParse(testUrl);
    console.log(data[0].at(-1));
    expect(data[0]).toBeArray();
    expect(data[0][0].vid).toBeString();
});
