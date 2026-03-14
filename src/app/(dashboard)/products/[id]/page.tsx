"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Product, NavbarCategory, Category } from "@/types";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [navCategories, setNavCategories] = useState<NavbarCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Product>(`/api/admin/products/${id}/`),
      api.get("/api/admin/navbar-categories/"),
      api.get("/api/admin/categories/"),
    ])
      .then(([prodRes, navRes, catRes]) => {
        setProduct(prodRes.data);
        setNavCategories(navRes.data.results ?? navRes.data);
        setCategories(catRes.data.results ?? catRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const filteredSubCategories = categories.filter(
    (c) => String(c.navbar_category) === String(product?.category)
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("brand", product.brand);
    formData.append("price", product.price);
    if (product.original_price) formData.append("original_price", product.original_price);
    formData.append("category", String(product.category));
    if (product.sub_category) formData.append("sub_category", String(product.sub_category));
    formData.append("description", product.description || "");
    formData.append("stock", String(product.stock));
    if (product.badge) formData.append("badge", product.badge);
    formData.append("is_featured", String(product.is_featured));
    formData.append("is_active", String(product.is_active));
    if (imageFile) formData.append("image", imageFile);

    try {
      const { data } = await api.patch(`/api/admin/products/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProduct(data);
      router.push("/products");
    } catch {
      setError("Failed to update product.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!product) return <p className="text-gray-500">Product not found.</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <Field label="Name" required>
          <input
            type="text"
            required
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="input"
          />
        </Field>

        <Field label="Brand" required>
          <input
            type="text"
            required
            value={product.brand}
            onChange={(e) => setProduct({ ...product, brand: e.target.value })}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price" required>
            <input
              type="number"
              step="0.01"
              required
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Original Price">
            <input
              type="number"
              step="0.01"
              value={product.original_price || ""}
              onChange={(e) => setProduct({ ...product, original_price: e.target.value || null })}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category" required>
            <select
              required
              value={product.category}
              onChange={(e) => setProduct({ ...product, category: Number(e.target.value), sub_category: null })}
              className="input"
            >
              <option value="">Select...</option>
              {navCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Subcategory">
            <select
              value={product.sub_category || ""}
              onChange={(e) => setProduct({ ...product, sub_category: e.target.value ? Number(e.target.value) : null })}
              className="input"
            >
              <option value="">Select...</option>
              {filteredSubCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Image">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="input"
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={4}
            value={product.description || ""}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Stock">
            <input
              type="number"
              value={product.stock}
              onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Badge">
            <select
              value={product.badge || ""}
              onChange={(e) => setProduct({ ...product, badge: e.target.value || null })}
              className="input"
            >
              <option value="">None</option>
              <option value="sale">Sale</option>
              <option value="new">New</option>
              <option value="hot">Hot</option>
            </select>
          </Field>
          <div className="flex items-end gap-4 pb-1">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={product.is_featured}
                onChange={(e) => setProduct({ ...product, is_featured: e.target.checked })}
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={product.is_active}
                onChange={(e) => setProduct({ ...product, is_active: e.target.checked })}
              />
              Active
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
