import { existsSync } from "fs";
// import { getPageCookies } from "./puppeteer"
import { writeFile, readFile } from "fs/promises";

export default class Cookie {
    #cookie = [];
    constructor(cookie = []) {
        if (Array.isArray(cookie)) {
            this.#cookie = cookie;
        }
    }

    set(cookie) {
        if (Array.isArray(cookie)) {
            this.#cookie = cookie;
        }
    }

    setValue(name, value) {
        const index = this.#cookie.findIndex((cookie) => cookie.name === name);
        if (index > -1) this.#cookie[index].value = value;
        else this.#cookie.push({ name, value, id: this.#cookie.length + 1 });
    }

    getCookie() {
        return this.cookie;
    }

    getValue(name, defaultValue = "") {
        return this.#cookie.find((cookie) => cookie.name === name)?.value ?? defaultValue;
    }

    toString() {
        return this.#cookie.map(({ name, value }) => `${name}=${value}`).join("; ");
    }
}

// export async function getDefaultCookies(url, cookiePath) {
//   if (existsSync(cookiePath)) {
//     const cookieString = await readFile(cookiePath, "utf-8")
//     const cookies = JSON.parse(cookieString)
//     return cookies
//   } else {
//     const cookies = await getPageCookies(url)
//     await writeFile(cookiePath, JSON.stringify(cookies))
//     return cookies
//   }
// }
