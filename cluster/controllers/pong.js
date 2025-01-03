import os from "node:os";
import { promisify } from "util";
import { exec as _exec } from "child_process";

import { serialNumber } from "@/libs/system";

const exec = promisify(_exec);

export default async function pong(req, res) {
    try {
        const cpu = os.cpus()[0];
        const platform = os.platform();
        const hostname = os.hostname();
        const serial = await serialNumber();
        const { stdout } = await exec("ffmpeg -version");
        const version = stdout.match(/ffmpeg\sversion\s(\d+.\d+)/)[1];

        return res.json({ ping: "pong", platform, ffmpeg: version, hostname, cpu, serial });
    } catch (error) {
        console.log(error.message);
        return res.json({ ping: "error", message: error.message });
    }
}
