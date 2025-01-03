"use server";
import { genSalt, hash } from "bcryptjs";

import prisma from "@/libs/prisma";
import { signUpSchema } from "@/libs/validate";

export default async function signUp(data) {
    try {
        const { name, email, password } = await signUpSchema.validate(data, { stripUnknown: true });

        let user = await prisma.user.findUnique({ where: { email } });
        if (user) throw new Error("Email đã được đăng ký");

        const salt = await genSalt(8);
        const hashPassword = await hash(password, salt);

        user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword,
            },
        });

        return { message: "Đăng ký tài khoản thàng công" };
    } catch (error) {
        return { error: { message: error.message } };
    }
}
