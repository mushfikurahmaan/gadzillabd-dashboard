"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Order } from "@/types";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

const DELIVERY_OPTIONS = [
  { value: "inside", label: "Inside Dhaka City" },
  { value: "outside", label: "Outside Dhaka City" },
];

type EditForm = {
  shipping_name: string;
  phone: string;
  email: string;
  shipping_address: string;
  district: string;
  delivery_area: string;
  tracking_number: string;
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm>({
    shipping_name: "", phone: "", email: "",
    shipping_address: "", district: "", delivery_area: "inside",
    tracking_number: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<Order>(`/api/admin/orders/${id}/`)
      .then((res) => setOrder(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  function startEditing() {
    if (!order) return;
    setForm({
      shipping_name: order.shipping_name,
      phone: order.phone,
      email: order.email,
      shipping_address: order.shipping_address,
      district: order.district,
      delivery_area: order.delivery_area,
      tracking_number: order.tracking_number,
    });
    setEditing(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch<Order>(`/api/admin/orders/${id}/`, form);
      setOrder(data);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(status: string) {
    setUpdating(true);
    try {
      const { data } = await api.patch<Order>(
        `/api/admin/orders/${id}/status/`,
        { status }
      );
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this order permanently?")) return;
    try {
      await api.delete(`/api/admin/orders/${id}/`);
      router.push("/orders");
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!order) return <p className="text-gray-500">Order not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            &larr; Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Order {order.order_number}
          </h1>
        </div>
        <div className="flex gap-2">
          {!editing && (
            <button
              onClick={startEditing}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Edit Order
            </button>
          )}
          <button
            onClick={handleDelete}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 space-y-6">
          {/* Items (always read-only) */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-gray-900">Items</h2>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  {item.product_image && (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                  </div>
                  <p className="text-sm text-gray-500">x{item.quantity}</p>
                  <p className="font-medium text-gray-900">৳{Number(item.price).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping – read or edit mode */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-gray-900">Shipping &amp; Contact</h2>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Name</label>
                    <input value={form.shipping_name} onChange={(e) => setForm({ ...form, shipping_name: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Phone</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">District</label>
                    <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="input" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Address</label>
                  <textarea rows={2} value={form.shipping_address} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} className="input" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Delivery Area</label>
                    <select value={form.delivery_area} onChange={(e) => setForm({ ...form, delivery_area: e.target.value })} className="input">
                      {DELIVERY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Tracking Number</label>
                    <input value={form.tracking_number} onChange={(e) => setForm({ ...form, tracking_number: e.target.value })} className="input" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Name</dt>
                  <dd className="mt-1 font-medium text-gray-900">{order.shipping_name || "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Phone</dt>
                  <dd className="mt-1 font-medium text-gray-900">{order.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="mt-1 font-medium text-gray-900">{order.email || "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">District</dt>
                  <dd className="mt-1 font-medium text-gray-900">{order.district || "—"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-gray-500">Address</dt>
                  <dd className="mt-1 font-medium text-gray-900">{order.shipping_address || "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Delivery Area</dt>
                  <dd className="mt-1 font-medium text-gray-900">{order.delivery_area_label}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Tracking Number</dt>
                  <dd className="mt-1 font-medium text-gray-900">{order.tracking_number || "—"}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-gray-900">Summary</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Total</dt>
                <dd className="text-lg font-bold text-gray-900">৳{Number(order.total).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-700">{new Date(order.created_at).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Updated</dt>
                <dd className="text-gray-700">{new Date(order.updated_at).toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-semibold text-gray-900">Status</h2>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  disabled={updating || order.status === opt.value}
                  onClick={() => updateStatus(opt.value)}
                  className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition ${
                    order.status === opt.value
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
