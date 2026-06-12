import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { setSession } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "请输入用户名"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少 6 位"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: { email: ["该邮箱已被注册"] } },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "USER" },
    });

    await setSession({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
    }
    console.error("POST /api/auth/register error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
