import { JSDOM } from "jsdom";
import { USER_AGENT } from "../configs";

export default async function youkuVideoParse(url) {
    if (typeof url === "string") {
        url = new URL(url);
    }

    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT, Cookie: "yk_lang=vi_VN" } });
    const body = await response.text();

    const dom = new JSDOM(body);
    const scripts = dom.window.document.querySelectorAll("script");

    const initScript = Array.from(scripts).find((script) => script.textContent.includes("window.__INITIAL_DATA__"));
    const inintString = initScript.textContent.replace(/^.*?__INITIAL_DATA__\s=/, "").slice(0, -1);
    const initData = JSON.parse(inintString);

    const title = initData.data.data.data.extra.showName;

    const videoList = initData.data.data.nodes[0].nodes[1].nodes.map((video) => {
        const vid = video.data.action.value;
        const isTrailer = video.data.videoType !== "正片";
        // https://www.youku.tv/v/v_show/id_
        const nativeUrl = `${url.origin}/v/v_show/id_${vid}.html`;
        const requireVip = ["VIP"].includes(video.data?.mark?.data?.text);
        return { vid: video.data.action.value, name: video.data.title, nativeUrl, isTrailer, requireVip, duration: null };
    });

    return [videoList, title];
}
