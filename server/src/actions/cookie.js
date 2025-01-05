"use server";

import { getServerSession } from "next-auth";

import prisma from "@/libs/prisma";
import { Forbidden, NotFound, Unauthorized } from "@/libs/error";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getCookies({ take = 10, page = 0, orderBy = "updatedAt", order = "desc" } = {}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) throw new Unauthorized();

        const skip = take * page;
        const where = { userId: session.user.id };
        const total = await prisma.cookie.count({ where });
        const cookieList = await prisma.cookie.findMany({
            where,
            select: {
                id: true,
                name: true,
                site: true,
                createdAt: true,
                updatedAt: true,
            },
            take,
            skip,
            orderBy: { [orderBy]: order },
        });

        return { cookieList, take, page, total, orderBy, order };
    } catch (error) {
        return { error: { message: error.message } };
    }
}

export async function createCookie(data) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) throw new Unauthorized();

        const name = data.name;
        const values = data.cookie.filter((c) => c.name && c.value && c.domain);

        let site = values[0].domain;
        if (site.startsWith(".www")) site = site.replace(".www", "");
        if (site.startsWith(".")) site = site.replace(".", "");

        if (data.id) {
            const cookie = await prisma.cookie.findUnique({ where: { id: data.id } });
            if (!cookie) throw new NotFound("Cookie không tồn tại hoặc đã bị xoá");
            if (cookie.userId !== session.user.id) throw new Forbidden();

            await prisma.cookie.update({ where: { id: data.id }, data: { name, values, site } });
            return {};
        } else {
            const cookie = await prisma.cookie.create({
                data: {
                    name: name,
                    site: site,
                    values: values,
                    userId: session.user.id,
                },
            });
            return cookie;
        }
    } catch (error) {
        return { error: { message: error.message } };
    }
}

export async function deleteCookies(cookieIds) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) throw new Unauthorized();

        for (const id of cookieIds) {
            const cookie = await prisma.cookie.findUnique({
                where: { id },
                select: { userId: true },
            });
            if (cookie.userId !== session.user.id) throw new Forbidden();
            await prisma.cookie.delete({ where: { id } });
        }

        return {};
    } catch (error) {
        return { error: { message: error.message } };
    }
}

export async function getCookie(id) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) throw new Unauthorized();

        const cookie = await prisma.cookie.findUnique({ where: { id } });

        if (!cookie) throw new NotFound("Cookie không tồn tại hoặc đã bị xoá");
        if (cookie.userId !== session.user.id) throw new Forbidden();

        return cookie;
    } catch (error) {
        return { error: { message: error.message } };
    }
}
