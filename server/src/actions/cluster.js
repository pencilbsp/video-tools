"use server";
import { getServerSession } from "next-auth";
import { genSalt, hash, compare } from "bcryptjs";

import prisma from "@/libs/prisma";
import { encryptData } from "@/libs/aes";
import { Forbidden, NotFound, Unauthorized } from "@/libs/error";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function addCluster(data) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) throw new Unauthorized();

        const serial = data.os.serial;
        const cluster = await prisma.cluster.findUnique({ where: { serial } });
        if (cluster && cluster.serial) throw new Error("Cluster này đã được thêm vào trước đó");

        let password;
        if (data.password) {
            const salt = await genSalt(5);
            password = await hash(data.password, salt);
        }

        await prisma.cluster.create({
            data: {
                password,
                host: data.host,
                serial: data.os.serial,
                ffmpeg: data.os.ffmpeg,
                port: Number(data.port),
                isPublic: data.isPublic,
                userId: session.user.id,
                platform: data.os.platform,
                processor: data.os.cpu.model,
                name: data.name || data.os.hostname,
            },
        });

        return {};
    } catch (error) {
        return { error: { message: error.message } };
    }
}

export const getClusters = async () => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) throw new Unauthorized();

        const clusters = await prisma.cluster.findMany({
            where: {
                userId: session.user.id,
            },
        });

        return { clusterList: clusters.map((c) => ({ ...c, password: c.password ? true : false })) };
    } catch (error) {
        return { error: { message: error.message } };
    }
};

export async function deleteCluster(id) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) throw new Unauthorized();

        const cluster = await prisma.cluster.findUnique({ where: { id }, select: { userId: true } });
        if (!cluster || !cluster.userId) throw new NotFound("Cluster không tồn tại hoặc đã bị xoá");
        if (cluster.userId !== session.user.id) throw new Forbidden();

        const inProcessVideoCount = await prisma.video.count({
            where: {
                clusterId: id,
                status: {
                    notIn: ["done", "error"],
                },
            },
        });

        if (inProcessVideoCount > 0) throw new Error("Không thể xoá cluster đang encode video");

        await prisma.cluster.delete({ where: { id } });

        return {};
    } catch (error) {
        return { error: { message: error.message } };
    }
}

export async function verifyPassword(id, password) {
    try {
        const cluster = await prisma.cluster.findUnique({ where: { id } });
        if (!cluster) throw new NotFound("Cluster không tồn tại hoặc đã bị xoá");
        if (!cluster.isPublic) throw new Forbidden("Cluster này không được chia sẻ công khai");
        if (!cluster.password) throw new Error("Cluster này không được bảo vệ bằng mật khẩu");

        const isOk = await compare(password, cluster.password);
        if (!isOk) throw new Error("Mật khẩu không chính xác");

        const hash = encryptData({ id, serial: cluster.serial });
        return { cluster: { ...cluster, password: true, hash } };
    } catch (error) {
        console.log(error);
        return { error: { message: error.message } };
    }
}
