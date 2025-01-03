"use server";

import { join } from "path";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import { getServerSession } from "next-auth";

import prisma from "@/libs/prisma";
import { Unauthorized } from "@/libs/error";
import { UPLOAD_DIR } from "@/libs/configs";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const defaultSelect = {
    id: true,
    name: true,
    createdAt: true,
    updatedAt: true,
};

export async function getStyles({
    page = 0,
    take = 10,
    search = "",
    order = "desc",
    orderBy = "updatedAt",
    select = defaultSelect,
} = {}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) throw new Unauthorized();

        const skip = take * page;

        let total = 0;
        let styleList = [];

        if (search !== "") {
            const results = await prisma.subtitle.textSearch({
                where: { text: search, userId: session.user.id, isStyle: true },
                select,
            });
            total = results.total;
            styleList = results.data;
        } else {
            const where = { userId: session.user.id, isStyle: true };
            total = await prisma.subtitle.count({ where });
            styleList = await prisma.subtitle.findMany({ where, select, take, skip, orderBy: { [orderBy]: order } });
        }

        return { styleList, take, page, total, orderBy, order };
    } catch (error) {
        return { error: { message: error.message } };
    }
}

export async function deleteStyles(styleIds) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) throw new Unauthorized();

        for (const id of styleIds) {
            const style = await prisma.subtitle.findUnique({
                where: { id },
                select: { userId: true, fileId: true },
            });
            if (style.userId !== session.user.id) throw new Forbidden();
            await prisma.subtitle.delete({ where: { id } });
            const file = await prisma.file.delete({ where: { id: style.fileId }, select: { path: true } });
            const filePath = join(UPLOAD_DIR, file.path);
            if (existsSync(filePath)) await unlink(filePath);
        }

        return {};
    } catch (error) {
        return { error: { message: error.message } };
    }
}

export async function getStyle(id) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) throw new Unauthorized();

        const style = await prisma.subtitle.findUnique({
            where: { id },
            select: { file: true, name: true, id: true, options: true, userId: true },
        });

        if (!style) throw new NotFound("Style không tồn tại hoặc đã bị xoá");
        if (style.userId !== session.user.id) throw new Forbidden();

        return style;
    } catch (error) {
        return { error: { message: error.message } };
    }
}
