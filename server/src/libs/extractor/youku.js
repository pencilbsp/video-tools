import { JSDOM } from "jsdom";
import { USER_AGENT } from "../configs";
import { parseSetCookie } from "../cookie";

globalThis.goldlog = {
    cookie: new Map(),
    // etag: "yQP/H5CYR2ECAXEWPl2xH/Wd",
};

goldlog.cookie.set("yk_lang", "vi_VN");
// goldlog.cookie.set("_m_h5_tk_enc", "8f35c310e24a42e75384772e72c4941d");
// goldlog.cookie.set("_m_h5_tk", "df767d97f1620aafb014b79f47fff9a6_1735928005467");

const baseUrl = "https://acs.youku.tv/h5/mtop.youku.columbus.gateway.new.execute/1.0/?";

function md5(e) {
    function t(e, t) {
        return (e << t) | (e >>> (32 - t));
    }
    function n(e, t) {
        var n, o, i, r, a;
        return (
            (i = 2147483648 & e),
            (r = 2147483648 & t),
            (a = (1073741823 & e) + (1073741823 & t)),
            (n = 1073741824 & e) & (o = 1073741824 & t)
                ? 2147483648 ^ a ^ i ^ r
                : n | o
                  ? 1073741824 & a
                      ? 3221225472 ^ a ^ i ^ r
                      : 1073741824 ^ a ^ i ^ r
                  : a ^ i ^ r
        );
    }
    function o(e, o, i, r, a, s, c) {
        return (
            (e = n(
                e,
                n(
                    n(
                        (function (e, t, n) {
                            return (e & t) | (~e & n);
                        })(o, i, r),
                        a,
                    ),
                    c,
                ),
            )),
            n(t(e, s), o)
        );
    }
    function i(e, o, i, r, a, s, c) {
        return (
            (e = n(
                e,
                n(
                    n(
                        (function (e, t, n) {
                            return (e & n) | (t & ~n);
                        })(o, i, r),
                        a,
                    ),
                    c,
                ),
            )),
            n(t(e, s), o)
        );
    }
    function r(e, o, i, r, a, s, c) {
        return (
            (e = n(
                e,
                n(
                    n(
                        (function (e, t, n) {
                            return e ^ t ^ n;
                        })(o, i, r),
                        a,
                    ),
                    c,
                ),
            )),
            n(t(e, s), o)
        );
    }
    function a(e, o, i, r, a, s, c) {
        return (
            (e = n(
                e,
                n(
                    n(
                        (function (e, t, n) {
                            return t ^ (e | ~n);
                        })(o, i, r),
                        a,
                    ),
                    c,
                ),
            )),
            n(t(e, s), o)
        );
    }
    function s(e) {
        var t,
            n = "",
            o = "";
        for (t = 0; 3 >= t; t++) n += (o = "0" + ((e >>> (8 * t)) & 255).toString(16)).substr(o.length - 2, 2);
        return n;
    }
    var c, u, p, d, l, f, m, g, h, v;
    for (
        e = (function (e) {
            e = e.replace(/\r\n/g, "\n");
            for (var t = "", n = 0; n < e.length; n++) {
                var o = e.charCodeAt(n);
                128 > o
                    ? (t += String.fromCharCode(o))
                    : o > 127 && 2048 > o
                      ? ((t += String.fromCharCode((o >> 6) | 192)), (t += String.fromCharCode((63 & o) | 128)))
                      : ((t += String.fromCharCode((o >> 12) | 224)),
                        (t += String.fromCharCode(((o >> 6) & 63) | 128)),
                        (t += String.fromCharCode((63 & o) | 128)));
            }
            return t;
        })(e),
            v = (function (e) {
                for (
                    var t,
                        n = e.length,
                        o = n + 8,
                        i = 16 * ((o - (o % 64)) / 64 + 1),
                        r = new Array(i - 1),
                        a = 0,
                        s = 0;
                    n > s;

                )
                    (a = (s % 4) * 8), (r[(t = (s - (s % 4)) / 4)] = r[t] | (e.charCodeAt(s) << a)), s++;
                return (
                    (a = (s % 4) * 8),
                    (r[(t = (s - (s % 4)) / 4)] = r[t] | (128 << a)),
                    (r[i - 2] = n << 3),
                    (r[i - 1] = n >>> 29),
                    r
                );
            })(e),
            f = 1732584193,
            m = 4023233417,
            g = 2562383102,
            h = 271733878,
            c = 0;
        c < v.length;
        c += 16
    )
        (u = f),
            (p = m),
            (d = g),
            (l = h),
            (f = o(f, m, g, h, v[c + 0], 7, 3614090360)),
            (h = o(h, f, m, g, v[c + 1], 12, 3905402710)),
            (g = o(g, h, f, m, v[c + 2], 17, 606105819)),
            (m = o(m, g, h, f, v[c + 3], 22, 3250441966)),
            (f = o(f, m, g, h, v[c + 4], 7, 4118548399)),
            (h = o(h, f, m, g, v[c + 5], 12, 1200080426)),
            (g = o(g, h, f, m, v[c + 6], 17, 2821735955)),
            (m = o(m, g, h, f, v[c + 7], 22, 4249261313)),
            (f = o(f, m, g, h, v[c + 8], 7, 1770035416)),
            (h = o(h, f, m, g, v[c + 9], 12, 2336552879)),
            (g = o(g, h, f, m, v[c + 10], 17, 4294925233)),
            (m = o(m, g, h, f, v[c + 11], 22, 2304563134)),
            (f = o(f, m, g, h, v[c + 12], 7, 1804603682)),
            (h = o(h, f, m, g, v[c + 13], 12, 4254626195)),
            (g = o(g, h, f, m, v[c + 14], 17, 2792965006)),
            (f = i(f, (m = o(m, g, h, f, v[c + 15], 22, 1236535329)), g, h, v[c + 1], 5, 4129170786)),
            (h = i(h, f, m, g, v[c + 6], 9, 3225465664)),
            (g = i(g, h, f, m, v[c + 11], 14, 643717713)),
            (m = i(m, g, h, f, v[c + 0], 20, 3921069994)),
            (f = i(f, m, g, h, v[c + 5], 5, 3593408605)),
            (h = i(h, f, m, g, v[c + 10], 9, 38016083)),
            (g = i(g, h, f, m, v[c + 15], 14, 3634488961)),
            (m = i(m, g, h, f, v[c + 4], 20, 3889429448)),
            (f = i(f, m, g, h, v[c + 9], 5, 568446438)),
            (h = i(h, f, m, g, v[c + 14], 9, 3275163606)),
            (g = i(g, h, f, m, v[c + 3], 14, 4107603335)),
            (m = i(m, g, h, f, v[c + 8], 20, 1163531501)),
            (f = i(f, m, g, h, v[c + 13], 5, 2850285829)),
            (h = i(h, f, m, g, v[c + 2], 9, 4243563512)),
            (g = i(g, h, f, m, v[c + 7], 14, 1735328473)),
            (f = r(f, (m = i(m, g, h, f, v[c + 12], 20, 2368359562)), g, h, v[c + 5], 4, 4294588738)),
            (h = r(h, f, m, g, v[c + 8], 11, 2272392833)),
            (g = r(g, h, f, m, v[c + 11], 16, 1839030562)),
            (m = r(m, g, h, f, v[c + 14], 23, 4259657740)),
            (f = r(f, m, g, h, v[c + 1], 4, 2763975236)),
            (h = r(h, f, m, g, v[c + 4], 11, 1272893353)),
            (g = r(g, h, f, m, v[c + 7], 16, 4139469664)),
            (m = r(m, g, h, f, v[c + 10], 23, 3200236656)),
            (f = r(f, m, g, h, v[c + 13], 4, 681279174)),
            (h = r(h, f, m, g, v[c + 0], 11, 3936430074)),
            (g = r(g, h, f, m, v[c + 3], 16, 3572445317)),
            (m = r(m, g, h, f, v[c + 6], 23, 76029189)),
            (f = r(f, m, g, h, v[c + 9], 4, 3654602809)),
            (h = r(h, f, m, g, v[c + 12], 11, 3873151461)),
            (g = r(g, h, f, m, v[c + 15], 16, 530742520)),
            (f = a(f, (m = r(m, g, h, f, v[c + 2], 23, 3299628645)), g, h, v[c + 0], 6, 4096336452)),
            (h = a(h, f, m, g, v[c + 7], 10, 1126891415)),
            (g = a(g, h, f, m, v[c + 14], 15, 2878612391)),
            (m = a(m, g, h, f, v[c + 5], 21, 4237533241)),
            (f = a(f, m, g, h, v[c + 12], 6, 1700485571)),
            (h = a(h, f, m, g, v[c + 3], 10, 2399980690)),
            (g = a(g, h, f, m, v[c + 10], 15, 4293915773)),
            (m = a(m, g, h, f, v[c + 1], 21, 2240044497)),
            (f = a(f, m, g, h, v[c + 8], 6, 1873313359)),
            (h = a(h, f, m, g, v[c + 15], 10, 4264355552)),
            (g = a(g, h, f, m, v[c + 6], 15, 2734768916)),
            (m = a(m, g, h, f, v[c + 13], 21, 1309151649)),
            (f = a(f, m, g, h, v[c + 4], 6, 4149444226)),
            (h = a(h, f, m, g, v[c + 11], 10, 3174756917)),
            (g = a(g, h, f, m, v[c + 2], 15, 718787259)),
            (m = a(m, g, h, f, v[c + 9], 21, 3951481745)),
            (f = n(f, u)),
            (m = n(m, p)),
            (g = n(g, d)),
            (h = n(h, l));
    return (s(f) + s(m) + s(g) + s(h)).toLowerCase();
}

function toList(origin, nodes) {
    return nodes.map((video) => {
        const vid = video.data.action.value;
        const isTrailer = video.data.videoType !== "正片";
        const nativeUrl = `${origin}/v/v_show/id_${vid}.html`;
        const requireVip = video.data?.mark?.data?.color === "GOLDEN";
        // const requireVip = ["VIP", "TVOD"].includes(video.data?.mark?.data?.text);
        return {
            vid: video.data.action.value,
            name: video.data.title,
            nativeUrl,
            isTrailer,
            requireVip,
            duration: null,
        };
    });
}

async function fetchTab(nextSession, start, end, tryCount = 0) {
    if (typeof nextSession === "string") {
        // nextSession.replace("${moduleIndex}", "1");
        nextSession = JSON.parse(nextSession);
    }

    nextSession.itemStartStage = start;
    nextSession.itemEndStage = end;

    const time = Date.now();
    const appKey = 34300712;
    const msCodes = "2019030100";

    const params = {
        biz: "i18n_DETAIL_WEB_VN",
        scene: "component",
        componentVersion: "3",
        ip: "192.168.1.1",
        debug: 0,
        utdid: encodeURIComponent(goldlog.etag || "empty_cna"),
        userId: "",
        platform: "pc",
        gray: "0",
        nextSession: JSON.stringify(nextSession),
        videoId: nextSession.trackInfo["pvv_vid"],
        showId: nextSession.trackInfo["pvv_sid"],
    };

    const data = {
        ms_codes: msCodes,
        params: JSON.stringify(params),
        system_info: JSON.stringify({
            os: "pc",
            device: "pc",
            ver: "1.0.0",
            appPackageKey: "pcweb",
            appPackageId: "pcweb",
            appkey: appKey.toString(),
            language: "VN",
        }),
    };

    const token = goldlog.cookie.get("_m_h5_tk")?.split("_")?.[0];
    const dataString = token + "&" + time + "&" + appKey + "&" + JSON.stringify(data);
    const sign = md5(dataString);

    const url = new URLSearchParams({
        jsv: "2.6.1",
        appKey,
        t: time.toString(),
        sign,
        api: "mtop.youku.columbus.gateway.new.execute",
        type: "originaljson",
        v: "1.0",
        ecode: "1",
        dataType: "json",
        data: JSON.stringify(data),
    });

    // console.log({
    //     url: baseUrl + url.toString(),
    //     cookie: goldlog.cookie?.toCookieString() || "",
    // });

    const response = await fetch(baseUrl + url.toString(), {
        headers: { "User-Agent": USER_AGENT, Cookie: goldlog.cookie?.toCookieString() || "" },
    });
    const result = await response.json();

    if (tryCount < 3 && !result.ret[0].includes("SUCCESS")) {
        goldlog.cookie = parseSetCookie(response.headers.getSetCookie());

        tryCount += 1;
        return fetchTab(nextSession, start, end, tryCount);
    }

    // const tabs = result.data[msCodes].data.nodes;
    // console.log(tabs);
    // return result.data[msCodes].data.nodes;
    return result.data[msCodes].data;
}

export default async function youkuVideoParse(url) {
    if (typeof url === "string") {
        url = new URL(url);
    }

    // const vid = url.href.match(/id_(.*?).html/)[1];

    if (!goldlog.etag) {
        const response = await fetch("https://log.mmstat.com/eg.js?t=" + Date.now(), {
            headers: { "User-Agent": USER_AGENT, Cookie: goldlog.cookie?.toCookieString() || "" },
        });
        const eg = await response.text();
        goldlog.etag = eg.match(/goldlog\.Etag="(.*?)";/)[1];
    }

    const response = await fetch(url);
    const body = await response.text();

    const dom = new JSDOM(body);
    const scripts = dom.window.document.querySelectorAll("script");

    const initScript = Array.from(scripts).find((script) => script.textContent.includes("window.__INITIAL_DATA__"));
    const inintString = initScript.textContent.replace(/^.*?__INITIAL_DATA__\s=/, "").slice(0, -1);
    const initData = JSON.parse(inintString);

    const title = initData.data.data.data.extra.showName;

    const tabs = initData.data.data.nodes[0].nodes;
    const videoList = toList(url.origin, initData.data.data.nodes[0].nodes[1].nodes);

    // for (const tab of tabs) {
    //     if (!tab.more || tab.type !== 10013 || tab.data.action.type !== "JUMP_TO_EXPAND" || !tab.data.pageSize) {
    //         continue;
    //     }

    //     const start = videoList.length + 1;
    //     const end = start + tab.data.pageSize - 1;
    //     const nextPage = await fetchTab(tab.data.session, start, end);
    //     videoList.push(...toList(url.origin, nextList));
    // }

    let count = 0;
    while (true) {
        const tab = tabs[count];

        if (!tab) {
            break;
        }

        // if (!tab.more || tab.type !== 10013 || tab.data.action.type !== "JUMP_TO_EXPAND" || !tab.data.pageSize) {
        //     start += 1;
        //     continue;
        // }

        if (tab.more && tab.data.action.type === "JUMP_TO_EXPAND") {
            const start = videoList.length + 1;
            const end = start + tab.data.pageSize - 1;

            // console.log("Loading", start, end, tab.data.session);

            const moreTab = await fetchTab(tab.data.session, start, end);

            const nodes = toList(url.origin, moreTab.nodes);
            // console.log("Loaded", nodes.length);

            videoList.push(...nodes);

            moreTab.nodes = [];
            moreTab.data.session = tab.data.session;
            tabs.push(moreTab);
        }

        count += 1;
    }

    return [videoList, title];
}
