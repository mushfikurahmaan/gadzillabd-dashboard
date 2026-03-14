"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { NavbarCategory, Category } from "@/types";

export default function NewProductPage() {
  const router = useRouter();
  const [navCategories, setNavCategories] = useState<NavbarCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: "",
    original_price: "",
    category: "",
    sub_category: "",
    description: "",
    stock: "0",
    badge: "",
    is_featured: false,
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/api/admin/navbar-categories/"),
      api.get("/api/admin/categories/"),
    ]).then(([navRes, catRes]) => {
      setNavCategories(navRes.data.results ?? navRes.data);
      setCategories(catRes.data.results ?? catRes.data);
    });
  }, []);

  const filteredSubCategories = categories.filter(
    (c) => String(c.navbar_category) === form.category
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("brand", form.brand);
    formData.append("price", form.price);
    if (form.original_price) formData.append("original_price", form.original_price);
    formData.append("category", form.category);
    if (form.sub_category) formData.append("sub_category", form.sub_category);
    formData.append("description", form.description);
    formData.append("stock", form.stock);
    if (form.badge) formData.append("badge", form.badge);
    formData.append("is_featured", String(form.is_featured));
    formData.append("is_active", String(form.is_active));
    if (imageFile) formData.append("image", imageFile);

    try {
      await api.post("/api/admin/products/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/products");
    } catch {
      setError("Failed to create product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">New Product</h1>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <Field label="Name" required>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
        </Field>

        <Field label="Brand" required>
          <input
            type="text"
            required
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price" required>
            <input
              type="number"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Original Price">
            <input
              type="number"
              step="0.01"
              value={form.original_price}
              onChange={(e) => setForm({ ...form, original_price: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category" required>
            <select
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value, sub_category: "" })}
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
              value={form.sub_category}
              onChange={(e) => setForm({ ...form, sub_category: e.target.value })}
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
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Stock">
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Badge">
            <select
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
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
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
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
            {saving ? "Creating..." : "Create Product"}
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
