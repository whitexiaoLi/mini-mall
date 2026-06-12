import { NextResponse } from "next/server";
import { saveFile, ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/upload";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "未选择文件" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "不支持的文件类型，仅支持 JPG/PNG/GIF/WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "文件大小不能超过 5MB" },
        { status: 400 }
      );
    }

    const url = await saveFile(file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "服务器错误，上传失败" }, { status: 500 });
  }
}
