import puppeteer from "puppeteer-core";
import { CHROME_PATH } from "@/configs";
import { closeResources, DEFN_LIST, YOUKU_LANG_CODE as LANG_CODE } from "./helper";

const cookie = [
    {
        domain: ".youku.tv",
        hostOnly: false,
        httpOnly: false,
        name: "__aypstp",
        path: "/",
        sameSite: null,
        secure: false,
        session: true,
        storeId: null,
        value: "3",
    },
    {
        domain: "www.youku.tv",
        hostOnly: true,
        httpOnly: false,
        name: "csrfToken",
        path: "/",
        sameSite: null,
        secure: true,
        session: true,
        storeId: null,
        value: "ouEmOgDDyA0YFq2GqgMkOTTL",
    },
    {
        domain: ".youku.tv",
        hostOnly: false,
        httpOnly: false,
        name: "__arpvid",
        path: "/",
        sameSite: null,
        secure: false,
        session: true,
        storeId: null,
        value: "1735873558569tRLujW-1735873558571",
    },
    {
        domain: ".youku.tv",
        expirationDate: 1735875330,
        hostOnly: false,
        httpOnly: false,
        name: "login_index",
        path: "/",
        sameSite: null,
        secure: false,
        session: false,
        storeId: null,
        value: "1_1735871730329",
    },
    {
        domain: ".youku.tv",
        expirationDate: 1767409559.171392,
        hostOnly: false,
        httpOnly: false,
        name: "yk_lang",
        path: "/",
        sameSite: null,
        secure: true,
        session: false,
        storeId: null,
        value: "en_US",
    },
    {
        domain: ".www.youku.tv",
        hostOnly: false,
        httpOnly: false,
        name: "P_F",
        path: "/",
        sameSite: null,
        secure: false,
        session: true,
        storeId: null,
        value: "1",
    },
    {
        domain: ".youku.tv",
        expirationDate: 1767341193,
        hostOnly: false,
        httpOnly: false,
        name: "allowCookie",
        path: "/",
        sameSite: null,
        secure: false,
        session: false,
        storeId: null,
        value: "true",
    },
    {
        domain: ".youku.tv",
        expirationDate: 1743676553.35941,
        hostOnly: false,
        httpOnly: false,
        name: "P_gck",
        path: "/",
        sameSite: "no_restriction",
        secure: true,
        session: false,
        storeId: null,
        value: "NA%7CN5pR%2BOplgrjBLLjNcg0waQ%3D%3D%7CNA%7C1735871753358",
    },
    {
        domain: ".youku.tv",
        hostOnly: false,
        httpOnly: false,
        name: "__arcms",
        path: "/",
        sameSite: null,
        secure: false,
        session: true,
        storeId: null,
        value: "dd-3-00",
    },
    {
        domain: ".youku.tv",
        expirationDate: 1770365133.199986,
        hostOnly: false,
        httpOnly: false,
        name: "__ysuid",
        path: "/",
        sameSite: null,
        secure: false,
        session: false,
        storeId: null,
        value: "17358051331994gx",
    },
    {
        domain: ".youku.tv",
        hostOnly: false,
        httpOnly: false,
        name: "__arycid",
        path: "/",
        sameSite: null,
        secure: false,
        session: true,
        storeId: null,
        value: "dd-3-00",
    },
    {
        domain: ".youku.tv",
        hostOnly: false,
        httpOnly: false,
        name: "__ayft",
        path: "/",
        sameSite: null,
        secure: false,
        session: true,
        storeId: null,
        value: "1735873527339",
    },
    {
        domain: ".youku.tv",
        hostOnly: false,
        httpOnly: false,
        name: "__ayscnt",
        path: "/",
        sameSite: null,
        secure: false,
        session: true,
        storeId: null,
        value: "1",
    },
    {
        domain: ".youku.tv",
        expirationDate: 1736046358,
        hostOnly: false,
        httpOnly: false,
        name: "__aysid",
        path: "/",
        sameSite: null,
        secure: false,
        session: false,
        storeId: null,
        value: "17358051332001d9",
    },
    {
        domain: ".youku.tv",
        expirationDate: 1736046358,
        hostOnly: false,
        httpOnly: false,
        name: "__ayspstp",
        path: "/",
        sameSite: null,
        secure: false,
        session: false,
        storeId: null,
        value: "50",
    },
    {
        domain: ".youku.tv",
        expirationDate: 1736046360,
        hostOnly: false,
        httpOnly: false,
        name: "__aysvstp",
        path: "/",
        sameSite: null,
        secure: false,
        session: false,
        storeId: null,
        value: "169",
    },
    {
        domain: ".youku.tv",
        hostOnly: false,
        httpOnly: false,
        name: "__ayvstp",
        path: "/",
        sameSite: null,
        secure: false,
        session: true,
        storeId: null,
        value: "12",
    },
    {
        domain: ".youku.tv",
        expirationDate: 1767381927,
        hostOnly: false,
        httpOnly: false,
        name: "cna",
        path: "/",
        sameSite: null,
        secure: false,
        session: false,
        storeId: null,
        value: "zTb9H9L7cmkCAXG5LOVy7l9g",
    },
    {
        domain: ".youku.tv",
        expirationDate: 1743676553.359552,
        hostOnly: false,
        httpOnly: true,
        name: "disrd",
        path: "/",
        sameSite: "no_restriction",
        secure: true,
        session: false,
        storeId: null,
        value: "85034",
    },
    {
        domain: ".youku.tv",
        expirationDate: 1751425559,
        hostOnly: false,
        httpOnly: false,
        name: "isg",
        path: "/",
        sameSite: "no_restriction",
        secure: true,
        session: false,
        storeId: null,
        value: "BG9vJx6VVJEZDVCsOeJKL1o0_oV5FMM27h6diIH91l7l0I3SieXwh2jKVthuqJuu",
    },
    {
        domain: ".youku.tv",
        expirationDate: 1743676553.359485,
        hostOnly: false,
        httpOnly: true,
        name: "P_pck_rm",
        path: "/",
        sameSite: "no_restriction",
        secure: true,
        session: false,
        storeId: null,
        value: "xUX3JEGC2b81934a117c06ZB3st2WgByFuMwctzjTd1u%2FH959QwGo6Oow%2BgwtN0XkFrwiqaeNDjCF61zd9t1Ker3EHUxb%2FJdbFU2PNsYdwXmIQ3IEaj%2FObDJhQztaRupgOh8k9JzKX1t0TP4MacZXY9fp%2BEawMPOsepQgQ%3D%3D_V2",
    },
    {
        domain: ".youku.tv",
        expirationDate: 1735905953.359287,
        hostOnly: false,
        httpOnly: true,
        name: "P_sck",
        path: "/",
        sameSite: "no_restriction",
        secure: true,
        session: false,
        storeId: null,
        value: "zLMDptakBC2%2BhifLoHZPtTjEIENsOys393sLqQ23%2F5yO6x1Ksd0c%2B8fFeWyNaDWao9AdBuSgjM1ztkUZqNR2RAtTTftp77VA3aDu20DPCyGZ4ycpj7%2BEW7XRlu4Z6pwNwAGILyKuFau77aFDTzKSpw%3D%3D",
    },
    {
        domain: ".youku.tv",
        expirationDate: 1751425558,
        hostOnly: false,
        httpOnly: false,
        name: "tfstk",
        path: "/",
        sameSite: null,
        secure: false,
        session: false,
        storeId: null,
        value: "g3UqmhZLTV2S9nUVIb0w85bw563xxqXBnPMss5ViGxDDlE9g4SwJcqGbsfxiEWMDfZHX_RPneSa1kFERblGiHPCDf8h8lSmYhIA04CPLUVwa6shiIR2ZCos5RSFxWVXQQw_QMHHU-_wqImblsflIi_i0w0L9SVXCdatWZmBjS-9jBbSzZYhZsdx0I3Do_YcDIV2iE0cnOK0iSRfrEXlIiAYisQmoMYDiSV2gZ_lt_8nIb9lsm1qszsVHwpnSKSDySeJ-gmYzMhT65zGqHPVmUci_zjoqK0EAoS4UtS4K_PCHbAPLm-G8QwWrrry4o0uN7U3bTu2q4oWwz0Eu9Pmz29-L9S24xD4cz_mzkWgmUPC9WxqbsPiao9AsnrebzDU93TM_A7am4JXWzRnamk00797l48vtZjVTWoJMbmc-av1Pa2q45gkpZ3BkXhnv3bkCilx9Xmmqav1PahKtDJcrdsqG.",
    },
].map((item) => {
    if (item.sameSite === null) {
        item.sameSite = "None";
    }

    return item
});

export default async function youkuExtract(_video, progressCallback) {
    let browser, page;

    try {
        const url = _video.nativeUrl;
        const options = _video.options;

        const subCode = Object.keys(LANG_CODE).includes(options.targetSubtitleLanguage) ? options.targetSubtitleLanguage : LANG_CODE.vi;
        const defn = Object.keys(DEFN_LIST).includes(options.downloadVideoQuality) ? DEFN_LIST[options.downloadVideoQuality] : DEFN_LIST["720P"];

        const targetSubType = ["ass"].indexOf(options.subtitleType);
        const spcaptiontype = targetSubType < 0 ? 0 : targetSubType;

        browser = await puppeteer.launch({ headless: false, executablePath: CHROME_PATH, defaultViewport: null });
        page = await browser.newPage();

        // Bật chế độ chặn request
        await page.setRequestInterception(true);

        if (_video.cookieId) {
            const cookie = await prisma.cookie.findUnique({ where: { id: _video.cookieId } });
            if (Array.isArray(cookie)) {
                await page.setCookie(...cookie);
            }
        } else {
            await page.setCookie(...cookie);
        }

        page.on("request", (request) => {
            if (request.url().includes("drm-license.youku")) {
                console.log("Intercepting request:", request.url());

                if (request.method() === "POST") {
                    console.log(request.postData());
                }

                request.continue();
            } else {
                // Cho phép các request khác tiếp tục
                request.continue();
            }
        });

        await page.goto(url, { waitUntil: "domcontentloaded" });
        const response = await page.waitForResponse((response) => response.url().includes("mtop.youku.play.ups.appinfo.get"));

        // Xử lý dữ liệu từ response
        const data = await response.text();
        const { searchParams } = new URL(response.url());
        const callback = searchParams.get("callback");
        const json = JSON.parse(data.trim().slice(callback.length + 1, -1));

        // const cookie = await page.cookies();
        // console.log(cookie);

        await closeResources(page, browser);
        // return json;

        const stream = json?.data?.data?.stream || [];
        const subtitles = json?.data?.data?.stream || [];

        const video = stream.find((item) => item.stream_type === defn);
        const subtitle = subtitles.find((item) => item.subtitle_lang === subCode);

        const subType = ["srt", "webvtt", "xml"].includes(options.subtitleType) ? options.subtitleType : "srt";

        console.log(video, subtitle);
    } catch (error) {
        await closeResources(page, browser);
        throw error;
    }
}

try {
    const videoTest = {
        nativeUrl:
            "https://www.youku.tv/v/v_show/id_XNjQ0ODEzODIxMg==.html?s=bcab343b5eb6436ea5ed&spm=a2hje.13141534.1_2.d_zj2_3&scm=20140719.apircmd.242627.video_XNjQ0ODEzODIxMg==",
        options: {
            subtitleType: "srt",
            targetSubtitleLanguage: "vi",
            downloadVideoQuality: "720P",
        },
    };
    const data = await youkuExtract(videoTest);
} catch (error) {
    console.error(error);
}
