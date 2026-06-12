import { getAdminProduct, updateProduct } from "@/app/actions/admin/products";
import { getCategories } from "@/app/actions/admin/categories";
import ProductForm from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getAdminProduct(parseInt(id));
  if (!product) notFound();

  const categories = await getCategories();

  const updateAction = async (formData: FormData) => {
    "use server";
    return updateProduct(parseInt(id), formData);
  };

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">编辑商品</h1>
      <ProductForm
        mode="edit"
        initialData={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          stock: product.stock,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
          isActive: product.isActive,
        }}
        categories={categories}
        action={updateAction}
      />
    </div>
  );
}
