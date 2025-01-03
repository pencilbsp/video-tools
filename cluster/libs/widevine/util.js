export function intToUint8Array(num) {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, num, false);
    return new Uint8Array(buffer);
}

export function compareUint8Arrays(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return Array.from(arr1).every((value, index) => value === arr2[index]);
}

export function uint8ArrayToHex(buffer) {
    return Array.prototype.map.call(buffer, (x) => x.toString(16).padStart(2, "0")).join("");
}

export function uint8ArrayToString(uint8array) {
    return String.fromCharCode.apply(null, uint8array);
}

export function uint8ArrayToBase64(uint8array) {
    return btoa(String.fromCharCode.apply(null, uint8array));
}

export function base64toUint8Array(base64_string) {
    return Uint8Array.from(atob(base64_string), (c) => c.charCodeAt(0));
}

export function stringToUint8Array(string) {
    return Uint8Array.from(string.split("").map((x) => x.charCodeAt()));
}

export function stringToHex(string) {
    return string
        .split("")
        .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("");
}
