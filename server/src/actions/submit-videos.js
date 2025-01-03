"use server";
import { getServerSession } from "next-auth";
//libs
import prisma from "@/libs/prisma";
// auth
import { Unauthorized } from "@/libs/error";
import { createOptions, videoSchema } from "@/libs/validate";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function submitVideos(videos, _options = {}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) throw Unauthorized("Bạn cần đăng nhập để thêm video");

        if (!Array.isArray(videos)) throw new Error("Danh sách video không hợp lệ");
        if (videos.length === 0) throw new Error("Bạn cần ít nhất 1 video để thêm");

        const defaultOptions = { ignoreDouble: true, resetError: true };
        if (_options) Object.assign(defaultOptions, _options);

        const result = [];
        for (let initVideo of videos) {
            initVideo = await videoSchema.validate({ ...initVideo, mode: "video" }, { stripUnknown: true });
            let video = await prisma.video.findFirst({
                where: {
                    vid: initVideo.vid,
                    userId: session.user.id,
                },
            });

            if (!defaultOptions.ignoreDouble || !video) {
                const [options, addMore] = createOptions(initVideo);
                // console.log(options, addMore);

                video = await prisma.video.create({
                    data: {
                        options,
                        vid: initVideo.vid,
                        name: initVideo.name,
                        userId: session.user.id,
                        nativeUrl: initVideo.nativeUrl,
                        ...addMore,
                    },
                });
            }

            if (defaultOptions.resetError && video?.status === "error") {
                await prisma.video.update({
                    where: {
                        id: video.id,
                    },
                    data: {
                        logs: [],
                        status: "pending",
                    },
                });
            }

            video && result.push(video.id);
        }

        return result;

        // return new Promise((resolve) => {
        //   setTimeout(() => {
        //     resolve([]);
        //   }, 10000);
        // });
    } catch (error) {
        console.log(error);
        return { error: { message: error.message } };
    }
}
