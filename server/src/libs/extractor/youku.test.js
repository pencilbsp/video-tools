import { expect, test } from "bun:test";

import youkuVideoParse from "./youku";

const testUrl =
    "https://www.youku.tv/v/v_show/id_XNjQzOTcyNDczNg==.html?spm=a2hja.14919748_WEBCOMIC_JINGXUAN.drawer2.d_zj1_3&s=edfc593bb3ae4013932e&scm=20140719.manual.38409.show_edfc593bb3ae4013932e&s=edfc593bb3ae4013932e";

test("Youku Parser", async () => {
    const data = await youkuVideoParse(testUrl);
    console.log(data);
    expect(data).toBeArray();
    expect(data[0].vid).toBeString();
});
