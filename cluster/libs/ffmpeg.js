import { join } from "path";
import { existsSync } from "fs";
import EventEmitter from "events";
import ffmpeg from "fluent-ffmpeg";
import { Parser } from "m3u8-parser";
import { readFile, unlink } from "fs/promises";

import { downloadFile } from "./download.js";
import ffmpegProcessing from "./processing.js";
import { ASSETS_PATH, SERVER_URL, VIDEO_DIR } from "../configs.js";

function timeToSeconds(timeString) {
    const parts = timeString.split(":");
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;

    // Chia giây và mili-giây
    const secondsAndMillis = parts[2].split(".");
    const seconds = parseInt(secondsAndMillis[0], 10) || 0;
    const milliseconds = parseInt(secondsAndMillis[1], 10) || 0;

    // Tổng số giây
    const totalSeconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;

    return totalSeconds;
}

export default class FFmpeg extends EventEmitter {
    // Mặc định tiến trình sẽ tự huỷ sau 90 phút
    timeout = 90 * 60 * 1000;
    filters = [];
    duration = 0;
    reject = null;
    command = null;
    resolve = null;
    tmpFile = null;
    timeoutId = null;
    timeoutCallback = () => {
        if (this.command) {
            this.command.kill();
        }
    };
    status = "";
    mode = "reject";
    inputFile = null;
    commandLine = "";
    outputFile = null;
    inputOptions = [];
    progress = { percent: 0, status: "" };
    options = ["-c:v libx264", "-strict -2", "-c:a copy"];

    constructor(id, input, inputOptions, outputOptions) {
        super();

        this.id = id;
        if (Array.isArray(outputOptions)) this.options = outputOptions;
        if (Array.isArray(inputOptions)) this.inputOptions = inputOptions;

        this.command = ffmpeg();

        if (typeof input === "string") {
            this.inputFile = input;
            this.command.input(this.inputFile);
        }
    }

    addInput = (input) => this.command.input(input);

    addOutputOptions = (options) => (this.options = [...this.options, ...options]);

    addInputOptions = (options) => (this.inputOptions = [...this.inputOptions, ...options]);

    getProgress() {
        return this.progress;
    }

    getProcess() {
        return this.command;
    }

    setMode(mode) {
        this.mode = mode;
    }

    setStatus(status) {
        this.status = status;
        this.progress.status = status;
    }

    #removeTimeout = () => {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    };

    #handleStart = (commandLine) => {
        this.commandLine = commandLine;
        this.progress.status = "processing";
        this.emit("progress", this.progress);
        ffmpegProcessing.append(this.id, this);

        if (this.timeout && this.timeout > 0) {
            this.timeoutId = setTimeout(this.timeoutCallback, this.timeout);
        }
    };

    #handleError = async (error) => {
        try {
            this.#removeTimeout();
            ffmpegProcessing.remove(this.id);

            if (this.outputFile && existsSync(this.outputFile)) await unlink(this.outputFile);

            this.progress.status = "error";
            this.emit("progress", this.progress);

            if (this.mode === "reject") return this.reject(error);
            this.resolve({ error: { message: error.message } });
        } catch (error) {
            if (this.mode === "reject") return this.reject(error);
            this.resolve({ error: { message: error.message } });
        }
    };

    #handleFinish = async () => {
        try {
            this.#removeTimeout();
            ffmpegProcessing.remove(this.id);

            if (typeof this.inputFile === "string") {
                this.inputFile = [this.inputFile];
            }

            if (Array.isArray(this.inputFile))
                for (const filePath of this.inputFile) {
                    if (existsSync(filePath)) {
                        await unlink(filePath);
                    }
                }

            // await rename(this.tmpFile, this.outputFile)
            this.progress.percent = 100;
            this.progress.status = "completed";
            this.emit("progress", this.progress);
            this.resolve({ success: true, path: this.outputFile });
        } catch (error) {
            if (this.mode === "reject") return this.reject(error);
            this.resolve({ success: true, path: this.outputFile, error: { message: error.message } });
        }
    };

    #handleProgress = (progress = {}) => {
        if (this.duration && progress.timemark) {
            const seconds = timeToSeconds(progress.timemark);
            progress.percent = (seconds / this.duration) * 100;
        }

        if (progress.percent) {
            const currentPercent = parseFloat(progress.percent.toFixed(2));
            if (currentPercent > this.progress.percent + 1) {
                this.progress.percent = currentPercent;
                this.emit("progress", this.progress);
            }
        }
    };

    applyOptions = async (_options = {}) => {
        let inputs = "[0:v]";

        // Add logo
        if (_options.logo) {
            const offsetY = _options.logo.offsetY;
            const offsetX = _options.logo.offsetX;
            const position = _options.logo.position;

            /**
             * [center topLeft topRight bottomLeft bottomRight]
             * Centered Position: overlay=(W-w)/2:(H-h)/2 / overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2
             * Top Left Position: overlay=10:10
             * Top Right Position: overlay=W-w-10:10 / (main_w-overlay_w)-10:10
             * Bottom Left Position: overlay=10:H-h-10 / 10:(main_h-overlay_h)-10
             * Bottom Right Position: overlay=W-w-10:H-h-10 / (main_w-overlay_w)-5:(main_h-overlay_h)-5
             */

            const options = getLogoPosition(position, offsetX, offsetY);
            this.filters.push({ filter: "overlay", options, inputs, outputs: "[tmp_overlay]" });
            inputs = "[tmp_overlay]";

            this.filters.push({ filter: "fade", options: "in:0:20", inputs, outputs: "[tmp_fade]" });
            inputs = "[tmp_fade]";

            this.command.addInput(logo.path);
        }

        // Add subtitle
        if (_options.subtitle) {
            // Add subtitle to ffmpeg options
            // Sửa lỗi không nhận path video trên Windows
            const options = _options.subtitle.path.replace(/\\/g, "\\\\\\\\").replace(":", "\\\\:");
            this.filters.push({ filter: "subtitles", options, inputs, outputs: "[tmp_subtitles]" });
            inputs = "[tmp_subtitles]";
        }

        // Apply complex filters
        if (this.filters.length > 0) {
            this.command.complexFilter(this.filters);
            this.options = [`-map ${inputs}`, "-map 0:a", ...this.options, "-crf 25"];
        }
    };

    mergeToFile = (videoPaths, output, timeout) => {
        this.timeout = timeout;
        this.outputFile = output;

        this.inputFile = videoPaths;
        videoPaths.forEach((videoPath) => {
            this.command.input(videoPath);
        });

        return new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;

            this.command
                .on("end", this.#handleFinish)
                .on("error", this.#handleError)
                .on("start", this.#handleStart)
                .on("progress", this.#handleProgress)
                // .crf(20)
                .mergeToFile(this.outputFile, VIDEO_DIR);
        });
    };

    parseM3U8 = async () => {
        const m3u8Content = await readFile(this.inputFile, "utf-8");
        const parser = new Parser();

        parser.push(m3u8Content);
        parser.end();

        const data = parser.manifest;
        const totalTime = data.segments.reduce((total, segment) => (total += segment.duration), 0);
        return { ...data, totalTime };
    };

    setDuration = (duration) => (this.duration = duration);

    start = (output, timeout) => {
        this.timeout = timeout;
        this.outputFile = output;

        return new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;

            // Apply options
            this.command.addOptions(this.options);
            this.command.inputOptions(this.inputOptions);

            this.command
                .on("end", this.#handleFinish)
                .on("error", this.#handleError)
                .on("start", this.#handleStart)
                .on("progress", this.#handleProgress)
                .save(this.outputFile);
        });
    };

    cancel = () => {
        this.progress.status = "canceled";
        this.emit("progress", this.progress);

        this.command.kill();
    };

    pause = () => {
        this.progress.status = "paused";
        this.emit("progress", this.progress);

        this.#removeTimeout();
        this.command.kill("SIGSTOP");
    };

    resume = () => {
        this.progress.status = this.status;
        this.emit("progress", this.progress);

        this.command.kill("SIGCONT");
    };
}

export function readMetadata(videoPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (error, metadata) => {
            if (error) return reject(error);
            return resolve(metadata);
        });
    });
}

export async function getSegmentsDuration(videoPaths) {
    let totalDuration = 0;

    for (const videoPath of videoPaths) {
        const metadata = await readMetadata(videoPath);
        const startTime = metadata.format["start_time"] ?? 0;
        const videoDuration = metadata.format.duration - startTime;
        totalDuration += videoDuration;
    }

    return totalDuration;
}

// Heplper

function getLogoPosition(position, offsetX, offsetY) {
    if (position === "topLeft") return `${offsetX}:${offsetY}`;
    if (position === "center") return "(main_w-overlay_w)/2:(main_h-overlay_h)/2";
    if (position === "topRight") return `main_w-overlay_w-${offsetX}:${offsetY}`;
    if (position === "bottomLeft") return `${offsetX}:main_h-overlay_h-${offsetY}`;
    if (position === "bottomRight") return `main_w-overlay_w-${offsetX}:main_h-overlay_h-${offsetY}`;
}

async function getFile(file) {
    const filePath = join(ASSETS_PATH, file.path);
    if (!existsSync(filePath)) await downloadFile(SERVER_URL + file.path, filePath);

    return { ...file, path: filePath };
}
