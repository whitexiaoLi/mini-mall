"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/app/generated/prisma/client";
import Image from "next/image";

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: {
    id?: number;
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    stock?: number;
    imageUrl?: string | null;
    categoryId?: number;
    isActive?: boolean;
  };
  categories: Category[];
  action: (formData: FormData) => Promise<{ success?: boolean; error?: string | Record<string, string[]> }>;
}

export default function ProductForm({
  mode,
  initialData,
  categories,
  action,
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setImageUrl(data.url);
      }
    } catch {
      setError("上传失败");
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    if (imageUrl) {
      formData.set("imageUrl", imageUrl);
    }

    const result = await action(formData);

    if (result.error) {
      // Handle both structured { field: [msgs] } and flat { error: "msg" } formats
      if (typeof result.error === "object") {
        const msgs = Object.values(result.error as Record<string, string[]>).flat();
        setError(msgs.join("；"));
      } else {
        setError(String(result.error));
      }
      setLoading(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-semibold">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="form-label">商品名称 *</label>
          <input
            type="text"
            name="name"
            defaultValue={initialData?.name}
            className="input-field"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label className="form-label">URL Slug *</label>
          <input
            type="text"
            name="slug"
            defaultValue={initialData?.slug}
            className="input-field"
            required
            pattern="[a-z0-9-]+"
            placeholder="example-product-slug"
          />
        </div>

        {/* Category */}
        <div>
          <label className="form-label">分类 *</label>
          <select
            name="categoryId"
            defaultValue={initialData?.categoryId}
            className="input-field"
            required
          >
            <option value="">选择分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">价格 *</label>
            <input
              type="number"
              name="price"
              defaultValue={initialData?.price}
              className="input-field"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div>
            <label className="form-label">库存 *</label>
            <input
              type="number"
              name="stock"
              defaultValue={initialData?.stock}
              className="input-field"
              min="0"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="form-label">商品描述 *</label>
          <textarea
            name="description"
            defaultValue={initialData?.description}
            className="input-field min-h-[120px]"
            required
          />
        </div>

        {/* Image */}
        <div>
          <label className="form-label">商品图片</label>
          <div className="flex items-start gap-4">
            {imageUrl && (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-sm"
              />
              {uploading && <p className="text-sm text-muted mt-1">上传中...</p>}
              <input type="hidden" name="imageUrl" value={imageUrl} />
            </div>
          </div>
        </div>

        {/* Active toggle (edit only) */}
        {mode === "edit" && (
          <div className="flex items-center gap-3">
            <label className="form-label !mb-0">上架状态</label>
            <select
              name="isActive"
              defaultValue={initialData?.isActive ? "true" : "false"}
              className="input-field !w-auto"
            >
              <option value="true">上架</option>
              <option value="false">下架</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || uploading}
            className="btn-primary"
          >
            {loading
              ? "保存中..."
              : mode === "create"
              ? "创建商品"
              : "保存修改"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-outline"
          >
            取消
          </button>
        </div>
      </div>
    </form>
  );
}
