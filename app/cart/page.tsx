import { getCart } from "@/app/actions/cart";
import { getSession } from "@/lib/auth";
import CartItemRow from "@/components/cart/CartItemRow";
import CartSummary from "@/components/cart/CartSummary";
import Link from "next/link";

export default async function CartPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <svg className="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h2 className="mt-4 text-xl font-bold text-gray-900">请先登录</h2>
        <p className="mt-2 text-muted">登录后才能查看购物车</p>
        <Link href="/auth/login" className="btn-primary mt-6">
          去登录
        </Link>
      </div>
    );
  }

  const { items, total } = await getCart();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">购物车</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-gray-900">购物车空空如也</h2>
          <p className="mt-2 text-muted">去逛逛，发现你的心仪好物</p>
          <Link href="/products" className="btn-primary mt-6">
            去购物
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card p-6">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>
          <div>
            <CartSummary total={total} />
          </div>
        </div>
      )}
    </div>
  );
}
