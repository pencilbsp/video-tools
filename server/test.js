let c = function (e) {
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
};

console.log(c("bb0a36f6ed94d69868d0fd80e79a4110&1735919311846&34300712&{\"ms_codes\":\"2019030100\",\"params\":\"{\\\"biz\\\":\\\"i18n_DETAIL_WEB_EN\\\",\\\"videoId\\\":\\\"XNTg4NjQ3OTYyMA==\\\",\\\"scene\\\":\\\"web_page\\\",\\\"componentVersion\\\":\\\"3\\\",\\\"ip\\\":\\\"1.54.209.231\\\",\\\"debug\\\":0,\\\"utdid\\\":\\\"zTb9H9L7cmkCAXG5LOVy7l9g\\\",\\\"userId\\\":\\\"3559685034\\\",\\\"platform\\\":\\\"pc\\\",\\\"nextSession\\\":\\\"{\\\\\\\"spmA\\\\\\\":\\\\\\\"a2h08\\\\\\\",\\\\\\\"level\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"spmB\\\\\\\":\\\\\\\"8165823\\\\\\\",\\\\\\\"lastPageNo\\\\\\\":1,\\\\\\\"index\\\\\\\":1,\\\\\\\"pageId\\\\\\\":\\\\\\\"PCSHOW_NORMAL\\\\\\\",\\\\\\\"pageName\\\\\\\":\\\\\\\"page_playpage\\\\\\\",\\\\\\\"lastSubIndex\\\\\\\":1,\\\\\\\"lifecycle\\\\\\\":1,\\\\\\\"scmB\\\\\\\":\\\\\\\"manual\\\\\\\",\\\\\\\"scmA\\\\\\\":\\\\\\\"20140719\\\\\\\",\\\\\\\"lastSubId\\\\\\\":37261,\\\\\\\"id\\\\\\\":6929}\\\",\\\"gray\\\":0,\\\"source\\\":\\\"pcNoPrev\\\",\\\"showId\\\":\\\"bebb9ed7f55d4362a425\\\"}\",\"system_info\":\"{\\\"os\\\":\\\"pc\\\",\\\"device\\\":\\\"pc\\\",\\\"ver\\\":\\\"1.0.0\\\",\\\"appPackageKey\\\":\\\"pcweb\\\",\\\"appPackageId\\\":\\\"pcweb\\\",\\\"zx\\\":0,\\\"pid\\\":\\\"\\\",\\\"appkey\\\":\\\"34300712\\\",\\\"language\\\":\\\"EN\\\"}\"}"));
