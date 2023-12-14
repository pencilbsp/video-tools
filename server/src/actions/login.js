"use server"

import { compare } from "bcryptjs"
// libs
import prisma from "@/libs/prisma"
import { loginSchema } from "@/libs/validate"

async function checkPassword(password, hash) {
  try {
    const res = await compare(password, hash)
    return res
  } catch (error) {
    return false
  }
}

export default async function login(email, password) {
  try {
    await loginSchema.validate({ email, password })

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) throw new Error("Email chưa được đăng ký")
    if (!user.password) throw new Error("Tài khoản đăng nhập qua mạng xã hội")

    const isOk = await checkPassword(password, user.password)
    if (!isOk) throw new Error("Mật khẩu không chính xác")

    return { id: user.id, email, image: user.image, name: user.name }
  } catch (error) {
    return { error: { message: error.message } }
  }
}
