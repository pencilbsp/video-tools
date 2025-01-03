import { JSDOM } from "jsdom";

export const toSourceDom = (source) => new JSDOM(source);

export function getNextScript(source) {
    const {
        window: { document },
    } = toSourceDom(source);

    const props = {};
    const nextScript = document.getElementById("__NEXT_DATA__");

    if (nextScript) Object.assign(props, JSON.parse(nextScript.textContent));

    return props;
}
