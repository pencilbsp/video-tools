Map.prototype.toCookieString = function () {
    return Array.from(this)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ");
};

export function parseSetCookie(cookies) {
    const cookieMap = new Map();

    cookies.forEach((cookie) => {
        const [cookieValue] = cookie.split(";");
        const [key, value] = cookieValue.split("=");
        cookieMap.set(key, value);
    });

    return cookieMap;
}
