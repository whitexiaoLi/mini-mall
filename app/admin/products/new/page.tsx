import { createProduct } from "@/app/actions/admin/products";
import { getCategories } from "@/app/actions/admin/categories";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">新增商品</h1>
      <ProductForm mode="create" categories={categories} action={createProduct} />
    </div>
  );
}
