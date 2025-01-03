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
