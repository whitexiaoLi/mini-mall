import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { setSession } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

// 防撞库：无论用户不存在还是密码错误，统一返回相同错误
const LOGIN_ERROR = "邮箱或密码错误";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: LOGIN_ERROR }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: LOGIN_ERROR }, { status: 401 });
    }

    await setSession({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
    }
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
