import { getNextScript } from "../html";

export default async function wetvVideoParse(url) {
    const response = await fetch(url);
    const body = await response.text();

    const pageProps = getNextScript(body);

    const videoSlug = pageProps.query.ids[0];
    const data = JSON.parse(pageProps.props.pageProps.data);

    if (!data.videoList) throw new Error("Không tìm thấy danh sách video");

    return [
        data.videoList.map((video) => {
            let name = video.episode;
            const requireVip = !video.isFree;
            const isTrailer = video.isTrailer === 1;
            const nativeUrl = `https://wetv.vip/en/play/${encodeURIComponent(videoSlug)}/${video.vid}`;

            if (isTrailer) {
                const hasLabel = Object.values(video.labels);
                hasLabel.length > 0 && hasLabel[0] && (name += ` ${hasLabel[0].text}`);
            }

            if ([10001].includes(video.coverCategoryType)) name = video.title;

            return { vid: video.vid, name, nativeUrl, isTrailer, requireVip, duration: video.duration };
        }),
        data.coverInfo.title,
    ];
}
