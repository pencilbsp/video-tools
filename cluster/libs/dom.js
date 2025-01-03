import { JSDOM } from "jsdom";

export function getNextScript(source) {
    const {
        window: { document },
    } = new JSDOM(source);

    const props = {};
    const nextScript = document.getElementById("__NEXT_DATA__");
    if (nextScript) Object.assign(props, JSON.parse(nextScript.textContent));

    return props;
}
