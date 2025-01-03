"use server";
import { getServerSession } from "next-auth";

import prisma from "@/libs/prisma";
import { Unauthorized } from "@/libs/error";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const defaultSelect = {
    id: true,
    name: true,
    createdAt: true,
    updatedAt: true,
};

export async function getLogos({
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
        let logoList = [];

        if (search !== "") {
            const results = await prisma.logo.textSearch({ where: { text: search }, select });
            total = results.total;
            logoList = results.data;
        } else {
            const where = { userId: session.user.id };
            total = await prisma.logo.count({ where });
            logoList = await prisma.logo.findMany({ where, select, take, skip, orderBy: { [orderBy]: order } });
        }

        return { logoList, take, page, total, orderBy, order };
    } catch (error) {
        return { error: { message: error.message } };
    }
}
