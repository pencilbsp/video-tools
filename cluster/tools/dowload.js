import prisma from "@/libs/prisma.js";
import { serialNumber } from "@/libs/system.js";
import { MAX_DOWNLOAD_TASK } from "@/configs.js";
import getExtractor from "@/libs/extractor/index.js";

const TAG = "[DOWNLOAD_TASK]";
export const DEFAULT_INTERVAL_TIME = 10 * 1000; // 10

class DownloadTask {
    io = null;
    userId = null;
    interval = null;
    clusterId = null;
    intervalTime = 0;
    status = "stoped";
    taskList = new Map();
    MAX_DOWNLOAD_TASK = MAX_DOWNLOAD_TASK;
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
                    status: "downloading",
                },
                data: {
                    status: "pending",
                },
            });

            this.startDownloadTask();
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

    downloadTask = async () => {
        let video = null;
        try {
            // Kiểm tra danh sách task đang hoạt động
            // Nếu tổng số task đang hoạt động bằng MAX_DOWNLOAD_TASK thì bỏ qua
            if (this.taskList.size === this.MAX_DOWNLOAD_TASK) return;

            // Tìm kiếm video đang ở trạng thái pending
            video = await prisma.video.findFirst({
                where: {
                    status: "pending",
                    userId: this.userId,
                    clusterId: this.clusterId,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            // if (!video)
            //     video = await prisma.video.findFirst({
            //         where: {
            //             status: "pending",
            //             userId: this.userId,
            //         },
            //         orderBy: {
            //             createdAt: "desc",
            //         },
            //     });

            // Nếu không có video thì bỏ qua
            if (!video || !video.nativeUrl) return;

            // Thêm video vào danh sách task
            this.status = "working";
            this.taskList.set(video.id, video.nativeUrl);
            console.log(TAG, `Bắt đầu tải xuống video "${video.name}"`);

            // Cập nhật trạng thái video
            await prisma.video.update({
                where: {
                    id: video.id,
                },
                data: {
                    status: "downloading",
                    clusterId: this.clusterId,
                },
            });

            // Extract video thành link m3u8 hoặc api
            const [extractor] = getExtractor(video.nativeUrl);
            const result = await extractor(video, (progress) => this.boardcast(video.id, progress));

            // Update trạng thái sau khi hoàn thành tải xuống
            let status = "downloaded";
            const paths = { video: result.video?.path, subtitle: result.subtitle?.path };

            await prisma.video.update({ where: { id: video.id }, data: { status, paths } });

            this.boardcast(video.id, { status });

            // Dọn dẹp sau khi tải xuống
            console.log(TAG, `Đã tải xuống video "${video.name}"`);
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
            if (video) this.taskList.delete(video.id);
            if (this.taskList.size === 0) this.status = "idle";
        }
    };

    stopDownloadTask = () => {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            if (taskList.size === 0) this.status = "stoped";
        }
    };

    startDownloadTask = () => {
        if (!this.interval && this.userId) {
            this.status = "idle";
            console.log("Bắt đầu task download...");
            this.interval = setInterval(this.downloadTask, this.intervalTime);
        }
    };

    setTaskLimit = (taskLimit) => {
        this.MAX_DOWNLOAD_TASK = taskLimit;
    };

    setIntervalTime = (initIntervalTime) => {
        if (!initIntervalTime || initIntervalTime < DEFAULT_INTERVAL_TIME) {
            initIntervalTime = DEFAULT_INTERVAL_TIME;
        }

        this.intervalTime = initIntervalTime;
        this.stopDownloadTask();
        this.startDownloadTask();
    };
}

const downloadTask = globalThis.downloadTask ?? new DownloadTask(DEFAULT_INTERVAL_TIME);
if (process.emit.NODE_ENV !== "production") globalThis.downloadTask = downloadTask;

export default downloadTask;
