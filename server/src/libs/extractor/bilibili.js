import { toSourceDom } from "../html.js";
import { USER_AGENT } from "../configs.js";

export default async function biliVideoParse(url, options = {}) {
    const response = await fetch(url, { headers: { "user-agent": USER_AGENT } });
    const body = await response.text();

    const { window } = toSourceDom(body);
    const scripts = window.document.querySelectorAll("script");
    const initialScript = Array.from(scripts).find((script) => script.textContent.includes("window.__initialState"));

    const initialState = eval(initialScript.textContent);

    const title = initialState.ogv.season.title;
    const seasonId = initialState.ogv.season["season_id"];
    // https://www.bilibili.tv/en/play/2084055/12999902?bstar_from=bstar-web.pgc-video-detail.episode.all
    const baseUrl = `${new URL(url).origin}/vi/play/${seasonId}`;

    const episodes = initialState.ogv.sectionsList.reduce((list, section) => {
        const isTrailer = !/^\d+-\d+$/.test(section["ep_list_title"]);
        return list.concat(section.episodes.map((episode) => ({ ...episode, isTrailer })));
    }, []);

    return [
        episodes.map((episode) => {
            const vid = episode["episode_id"];
            const requireVip = episode.limit > 1;
            const url = `${baseUrl}/${vid}?bstar_from=bstar-web.pgc-video-detail.episode.all`;

            return {
                vid,
                requireVip,
                nativeUrl: url,
                duration: null,
                isTrailer: episode.isTrailer,
                name: episode["title_display"],
            };
        }),
        title,
    ];
}
