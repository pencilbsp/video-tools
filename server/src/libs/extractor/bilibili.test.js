import biliVideoParse from "./bilibili";

const testUrl = "https://www.bilibili.tv/vi/play/2084055?bstar_from=bstar-web.homepage.anime.all";

try {
    const videos = await biliVideoParse(testUrl);
    console.log(videos);
} catch (error) {
    console.log(error);
}
