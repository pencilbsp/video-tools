import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import { basename, join, parse } from "path";

import { downloadFile } from "./download.js";
import { ASSETS_PATH, SERVER_URL } from "../configs.js";

export async function getServerFile(file, workDir = ASSETS_PATH) {
    const filePath = join(workDir, basename(file.path));

    if (!existsSync(filePath)) {
        const { dir } = parse(filePath);
        if (!existsSync(dir)) await mkdir(dir);
        await downloadFile(SERVER_URL + file.path, filePath);
    }

    return filePath;
}

export function waiting_file_exists(file_path, timeout = 10000) {
    let loop_count = 0;
    const loop_time = 500;
    let is_exists = false;
    return new Promise((resolve, reject) => {
        const interval = setInterval(function () {
            loop_count += loop_time;
            is_exists = existsSync(file_path);
            if (is_exists) {
                clearInterval(interval);
                return resolve();
            }

            if (loop_count >= timeout) {
                clearInterval(interval);
                return reject();
            }
        }, loop_time);
    });
}
