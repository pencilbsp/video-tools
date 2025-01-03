import CryptoJS from "crypto-js";

import { SECRET_KEY } from "./configs";

// Hàm mã hóa với chế độ CBC và padding PKCS7
export const encryptData = (data, secretKey = SECRET_KEY) => {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const iv = CryptoJS.lib.WordArray.random(16); // initialization vector

    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    // Kết hợp IV và ciphertext để lưu trữ hoặc truyền tải
    const encryptedData = iv.concat(ciphertext.ciphertext);
    return encryptedData.toString(CryptoJS.enc.Base64);
};

// Hàm giải mã với chế độ CBC và padding PKCS7
export const decryptData = (ciphertext, secretKey = SECRET_KEY) => {
    const key = CryptoJS.enc.Utf8.parse(secretKey);

    // Tách IV từ ciphertext
    const encryptedData = CryptoJS.enc.Base64.parse(ciphertext);
    const iv = encryptedData.clone();
    iv.sigBytes = 16;
    iv.clamp();

    // Giải mã dữ liệu
    const ciphertextPart = CryptoJS.lib.WordArray.create(encryptedData.words.slice(4));
    const decryptedData = CryptoJS.AES.decrypt({ ciphertext: ciphertextPart }, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8));
};
