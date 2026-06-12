import { getCategories } from "@/app/actions/admin/categories";
import CategoryManager from "./CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">分类管理</h1>
      </div>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
