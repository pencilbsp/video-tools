import { existsSync } from "fs";

export const DEFN_LIST = {
    "270P": "cmfv4ld",
    "360P": "cmfv4sd",
    "480P": "cmfv4hd",
    "720P": "cmfv4hd2",
    "1080P": "cmfv4hd3",
};

export const YOUKU_LANG_CODE = {
    vi: "vi",
    en: "en",
    th: "th",
    id: "id",
    ms: "ms",
    kr: "kr",
    es: "es",
    cn: "default",
};

export async function closeResources(page, browser) {
    if (page && !page.isClosed()) {
        await page.close();
    }
    if (browser && browser.isConnected()) {
        await browser.close();
    }
}

export function copyrightDRM(r, encryptR_server, copyright_key) {
    // Decode base64 input
    const rBuffer = Buffer.from(r, "utf8");
    const encryptRBuffer = Buffer.from(encryptR_server, "base64");
    const copyrightKeyBuffer = Buffer.from(copyright_key, "base64");

    // Step 1: Create AES ECB cipher and decrypt encryptR_server
    const crypto1 = createDecipheriv("aes-128-ecb", rBuffer, null);
    crypto1.setAutoPadding(false);
    const key2 = crypto1.update(encryptRBuffer) + crypto1.final();

    // Step 2: Create another AES ECB cipher and decrypt copyright_key
    const crypto2 = createDecipheriv("aes-128-ecb", Buffer.from(key2, "utf8"), null);
    crypto2.setAutoPadding(false);
    const decryptedKey = crypto2.update(copyrightKeyBuffer) + crypto2.final();

    // Step 3: Base64 encode the result
    return Buffer.from(decryptedKey, "utf8").toString("base64");
}
