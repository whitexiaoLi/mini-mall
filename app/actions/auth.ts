"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { setSession, clearSession } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "请输入用户名"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少 6 位"),
});

const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

export async function register(formData: FormData) {
  const result = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const { name, email, password } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: { email: ["该邮箱已被注册"] } };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "USER" },
  });

  await setSession({ userId: user.id, email: user.email, role: user.role });
  return { success: true };
}

export async function login(formData: FormData) {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: { email: ["邮箱或密码错误"] } };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: { email: ["邮箱或密码错误"] } };
  }

  await setSession({ userId: user.id, email: user.email, role: user.role });
  return { success: true };
}

export async function logout() {
  await clearSession();
}
