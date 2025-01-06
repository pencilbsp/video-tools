import { join, parse } from "path";

import prisma from "@/libs/prisma.js";
import FFmpeg from "@/libs/ffmpeg.js";
import { serialNumber } from "@/libs/system.js";
import { getServerFile } from "@/libs/file.js";
import { mergeStyle, toAssSubtitle } from "@/libs/subtitle.js";
import { ASSETS_PATH, MAX_ENCODE_TASK, VIDEO_DIR } from "@/configs.js";

const TAG = "[ENCODE_TASK]";
export const DEFAULT_INTERVAL_TIME = 10 * 1000; // 10

const prismaQuery = {
    orderBy: {
        createdAt: "desc",
    },
    include: {
        logo: {
            include: {
                file: true,
            },
        },
        subtitle: {
            include: {
                file: true,
            },
        },
        style: {
            include: {
                file: true,
            },
        },
    },
};

class EncodeTask {
    io = null;
    userId = null;
    interval = null;
    clusterId = null;
    intervalTime = 0;
    status = "stoped";
    taskList = new Map();
    MAX_ENCODE_TASK = MAX_ENCODE_TASK;
    constructor(initIntervalTime) {
        if (!initIntervalTime || initIntervalTime < DEFAULT_INTERVAL_TIME) {
            initIntervalTime = DEFAULT_INTERVAL_TIME;
        }

        this.intervalTime = initIntervalTime;
    }

    setup = async () => {
        const serial = await serialNumber();
        const cluster = await prisma.cluster.findUnique({ where: { serial } });

        if (cluster) {
            this.clusterId = cluster.id;
            this.userId = cluster.userId;

            await prisma.video.updateMany({
                where: {
                    userId: this.userId,
                    clusterId: this.clusterId,
                    status: "encoding",
                },
                data: {
                    status: "pending",
                },
            });

            this.startEncodeTask();
        }
    };

    setIo = (io) => {
        // console.log(io)
        this.io = io;
    };

    boardcast = (videoId, progress) => {
        if (this.io) {
            this.io.to(videoId).emit(videoId, progress);
        }
    };

    encodeTask = async () => {
        let video = null;
        try {
            // Kiểm tra danh sách task đang hoạt động
            // Nếu tổng số task đang hoạt động bằng MAX_ENCODE_TASK thì bỏ qua
            if (this.taskList.size === this.MAX_ENCODE_TASK) return;

            // Tìm kiếm video đang ở trạng thái downloaded được chỉ định sử lý bằng cluster này
            video = await prisma.video.findFirst({
                where: {
                    userId: this.userId,
                    status: "downloaded",
                    clusterId: this.clusterId,
                },
                ...prismaQuery,
            });

            // Nếu không có video encode các video không chỉ định cluster hoặc không có thì bỏ qua
            // if (!video)
            //     video = await prisma.video.findFirst({
            //         where: {
            //             userId: this.userId,
            //             status: "downloaded",
            //         },
            //         ...prismaQuery,
            //     });

            if (!video || !video.paths) return;

            // Thêm video vào danh sách task
            this.status = "working";
            this.taskList.set(video.id, video.id);
            console.log(TAG, `Đang chuẩn bị encode "${video.name}"`);

            let status = "encoding";
            if (video.options.skipEncode) status = "done";
            if (video.options.upload) status = "muxed";

            // Cập nhật trạng thái video
            await prisma.video.update({ where: { id: video.id }, data: { status, clusterId: this.clusterId } });

            if (status === "encoding") {
                const options = { subtitle: {} };
                const videoDir = join(VIDEO_DIR, video.id);
                const videoPath = join(VIDEO_DIR, video.paths.video);

                const { dir, name } = parse(videoPath);
                const videoMuxedPath = join(dir, `${name}_muxed.mp4`);

                // Thêm logo vào tuỳ chọn nếu có
                if (video.logo) {
                    options.logo = video.logo;
                    options.logo.path = await getServerFile(video.logo.file, videoDir);
                }

                // Thêm phụ đề vào tuỳ chọn
                if (video.paths.subtitle) {
                    const subtitlePath = join(VIDEO_DIR, video.paths.subtitle);
                    options.subtitle.path = await toAssSubtitle(subtitlePath);
                }

                /**
                 * Nếu người dùng tải lên phụ đề
                 * thì sử dụng phụ đề này thay cho phụ đề từ extractor
                 */
                if (video.subtitle) {
                    const subtitlePath = await getServerFile(video.subtitle.file, videoDir);
                    options.subtitle.path = await toAssSubtitle(subtitlePath);
                }

                // Thêm style vào phụ đề nếu có
                if (video.style && options.subtitle.path) {
                    const mainStyle = video.style?.options?.mainStyle || "Default";
                    const stylePath = await getServerFile(video.style.file, ASSETS_PATH);
                    await mergeStyle(stylePath, options.subtitle.path, mainStyle);
                }

                const ffmpeg = new FFmpeg(video.id, videoPath);
                await prisma.video.update({ where: { id: video.id }, data: { supportActions: true } });

                ffmpeg.applyOptions(options);

                ffmpeg.setStatus("encoding");
                ffmpeg.on("progress", (progress) => this.boardcast(video.id, progress));

                await ffmpeg.start(videoMuxedPath);
                await prisma.video.update({ where: { id: video.id }, data: { supportActions: false } });

                // Update trạng thái sau khi hoàn thành encode
                status = "muxed";
                if (!video.options.upload) status = "done";

                const paths = { ...video.paths, muxed: videoMuxedPath };
                await prisma.video.update({ where: { id: video.id }, data: { paths, status } });

                this.boardcast(video.id, { status });
            }

            // Dọn dẹp sau khi encode
            console.log(TAG, `Đã encode thành công video "${video.name}"`);
        } catch (error) {
            console.log(error);
            if (video) {
                console.log(TAG, `Video "${video.name}" gặp lỗi: "${error.message}"`);

                try {
                    await prisma.video.update({
                        where: {
                            id: video.id,
                        },
                        data: {
                            status: "error",
                            supportActions: false,
                            message: error.message,
                        },
                    });
                } catch (error) {
                    // Thông báo lỗi nếu quá trình cập nhật trạng thái thất bại
                }
            }
        } finally {
            // Dọn dẹp task list
            if (video) {
                this.taskList.delete(video.id);
            }
            if (this.taskList.size === 0) this.status = "idle";
        }
    };

    stopEncodeTask = () => {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            if (taskList.size === 0) this.status = "stoped";
        }
    };

    startEncodeTask = () => {
        if (!this.interval && this.userId) {
            this.status = "idle";
            console.log("Bắt đầu task encode...");
            this.interval = setInterval(this.encodeTask, this.intervalTime);
        }
    };

    setTaskLimit = (taskLimit) => {
        this.MAX_ENCODE_TASK = taskLimit;
    };

    setIntervalTime = (initIntervalTime) => {
        if (!initIntervalTime || initIntervalTime < DEFAULT_INTERVAL_TIME) {
            initIntervalTime = DEFAULT_INTERVAL_TIME;
        }

        this.intervalTime = initIntervalTime;
        this.stopEncodeTask();
        this.startEncodeTask();
    };
}

const encodeTask = globalThis.encodeTask ?? new EncodeTask(DEFAULT_INTERVAL_TIME);
if (process.emit.NODE_ENV !== "production") globalThis.encodeTask = encodeTask;

export default encodeTask;
