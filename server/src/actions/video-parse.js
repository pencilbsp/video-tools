"use server";

import { getServerSession } from "next-auth";

import prisma from "@/libs/prisma";
import getExtractor from "@/libs/extractor";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function videoParse(url, options = {}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) throw new Unauthorized();

        const [extractor, site] = getExtractor(url);

        const [videoList, title] = await extractor(url, options);

        const cookies = await prisma.cookie.findMany({
            select: { id: true, name: true },
            where: { site, userId: session.user.id },
        });

        const withVip = options.withVip ?? true;
        const withTrailer = options.withTrailer ?? false;
        let filteredVideos = videoList.filter((video) => (withTrailer ? true : video.isTrailer === withTrailer));
        filteredVideos = filteredVideos.filter((video) => (!withVip ? video.requireVip === withVip : true));

        if (options.order === "desc") filteredVideos = filteredVideos.reverse();

        const total = filteredVideos.length;
        const skip = options.skip ?? 0;
        let withCookieVideos = filteredVideos.slice(skip, skip + 100).map((video) => ({ ...video, cookie: cookies?.[0] }));

        return { title, total, videoList: withCookieVideos, cookies, site };
    } catch (error) {
        return { error: { message: error.message } };
    }
}
