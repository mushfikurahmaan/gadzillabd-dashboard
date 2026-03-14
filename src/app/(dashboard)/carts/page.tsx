"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import type { Cart, CartItem, PaginatedResponse } from "@/types";

export default function CartsPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get<PaginatedResponse<Cart>>("/api/admin/carts/", {
        params: { page },
      })
      .then((res) => {
        setCarts(res.data.results);
        setCount(res.data.count);
        setHasNext(!!res.data.next);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const allItems = useMemo(
    () =>
      carts.flatMap((cart) =>
        cart.items.map((item) => ({ ...item, cartId: cart.id }))
      ),
    [carts]
  );

  const totalItems = allItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Cart Items ({totalItems})
      </h1>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : allItems.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
          No cart items found
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Size
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Added
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allItems.map((item) => (
                  <tr key={`${item.cartId}-${item.id}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.product_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.size || "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <button
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
