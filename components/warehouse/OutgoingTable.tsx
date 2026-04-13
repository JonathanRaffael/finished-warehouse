"use client";

import { useEffect, useMemo, useState } from "react";

type Outgoing = {
  id: string;
  date: string;
  qty: number;
  createdBy: string;
  product: {
    computerCode: string;
    partNo: string;
    productName: string;
  };
};

type Product = {
  id: string;
  computerCode: string;
  partNo: string;
  productName: string;
};

export default function OutgoingTable({ type }: { type: "HT" | "HK" }) {
  const [data, setData] = useState<Outgoing[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    productId: "",
    computerCode: "",
    qty: 0,
    createdBy: "",
  });

  // 🔥 FETCH DATA
  const fetchData = () => {
    setLoading(true);

    fetch(`/api/wip/outgoing?type=${type}`)
      .then((res) => res.json())
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  };

  // 🔥 FETCH PRODUCT
  const fetchProducts = () => {
    fetch(`/api/wip/product?type=${type}`)
      .then((res) => res.json())
      .then((res) => setProducts(res));
  };

  useEffect(() => {
    fetchData();
    fetchProducts();
  }, [type]);

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      [
        item.product.productName,
        item.product.partNo,
        item.product.computerCode,
        item.createdBy,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search]);

  const handleSubmit = async () => {
    if (!form.computerCode || !form.qty || !form.createdBy) {
      alert("Lengkapi data!");
      return;
    }

    const res = await fetch("/api/wip/outgoing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        computerCode: form.computerCode,
        qty: form.qty,
        createdBy: form.createdBy,
        type,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.error);
      return;
    }

    setShowForm(false);
    setForm({
      productId: "",
      computerCode: "",
      qty: 0,
      createdBy: "",
    });

    fetchData();
  };

  return (
    <div className="space-y-5">

      {/* 🔷 HEADER */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Outgoing List ({type})
          </h2>
          <p className="text-sm text-slate-500">
            Track outgoing product transactions
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm shadow"
        >
          + Add Outgoing
        </button>
      </div>

      {/* 🔍 SEARCH */}
      <div className="flex items-center gap-3">
        <input
          placeholder="Search product, code, responsible..."
          className="border rounded-lg px-4 py-2 w-full text-sm focus:ring-2 focus:ring-red-500 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 📊 TABLE */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b text-slate-600">
            <tr>
              {[
                "Date",
                "Code",
                "Part No",
                "Product",
                "Qty Out",
                "Responsible",
              ].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  Loading data...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  No data found
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-slate-50 transition"
                >
                  <td className="px-4 py-3">
                    {new Date(item.date).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3 font-mono text-blue-600">
                    {item.product.computerCode}
                  </td>

                  <td className="px-4 py-3">
                    {item.product.partNo}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {item.product.productName}
                  </td>

                  <td className="px-4 py-3 text-red-600 font-semibold">
                    -{item.qty}
                  </td>

                  <td className="px-4 py-3">
                    {item.createdBy}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🧾 MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[420px] space-y-5 shadow-xl">

            <div>
              <h3 className="font-semibold text-lg">Add Outgoing</h3>
              <p className="text-sm text-slate-500">
                Input outgoing product data
              </p>
            </div>

            <div className="space-y-4">

              {/* 🔥 SELECT PRODUCT */}
              <select
                className="border px-3 py-2 w-full rounded-lg"
                value={form.productId}
                onChange={(e) => {
                  const selected = products.find(
                    (p) => p.id === e.target.value
                  );

                  setForm({
                    ...form,
                    productId: e.target.value,
                    computerCode: selected?.computerCode || "",
                  });
                }}
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productName} - {p.partNo} [{p.computerCode}]
                  </option>
                ))}
              </select>

              {/* AUTO CODE */}
              <input
                disabled
                value={form.computerCode}
                className="border px-3 py-2 w-full rounded-lg bg-slate-100"
              />

              <input
                type="number"
                placeholder="Quantity Out"
                className="border px-3 py-2 w-full rounded-lg"
                value={form.qty || ""}
                onChange={(e) =>
                  setForm({ ...form, qty: Number(e.target.value) })
                }
              />

              <input
                placeholder="Responsible Person"
                className="border px-3 py-2 w-full rounded-lg"
                value={form.createdBy}
                onChange={(e) =>
                  setForm({ ...form, createdBy: e.target.value })
                }
              />

            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Save Outgoing
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}