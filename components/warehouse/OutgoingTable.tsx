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
  createdAt?: string;
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
    date: new Date().toISOString().split("T")[0],
  });

  // =====================
  // FETCH DATA
  // =====================
  const fetchData = () => {
    setLoading(true);

    fetch(`/api/wip/outgoing?type=${type}`)
      .then((res) => res.json())
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  };

  // =====================
  // FETCH PRODUCT (SORT TERBARU)
  // =====================
  const fetchProducts = async () => {
    const res = await fetch(`/api/wip/product?type=${type}`);
    const data = await res.json();

    const sorted = data.sort(
      (a: Product, b: Product) =>
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime()
    );

    setProducts(sorted);
  };

  useEffect(() => {
    fetchData();
    fetchProducts();
  }, [type]);

  // =====================
  // FILTER + SORT TABLE
  // =====================
  const filteredData = useMemo(() => {
    return data
      .filter((item) =>
        [
          item.product.productName,
          item.product.partNo,
          item.product.computerCode,
          item.createdBy,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      ); // 🔥 lama → baru
  }, [data, search]);

  // =====================
  // SUBMIT
  // =====================
  const handleSubmit = async () => {
    if (!form.computerCode || !form.qty || !form.createdBy) {
      alert("Lengkapi data!");
      return;
    }

    if (!form.productId) {
      alert("Computer Code tidak valid / produk tidak ditemukan!");
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
        date: form.date,
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
      date: new Date().toISOString().split("T")[0],
    });

    fetchData();
  };

  return (
    <div className="space-y-5">

      {/* HEADER */}
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

      {/* SEARCH */}
      <div className="flex items-center gap-3">
        <input
          placeholder="Search product, code, responsible..."
          className="border rounded-lg px-4 py-2 w-full text-sm focus:ring-2 focus:ring-red-500 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
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
                <tr key={item.id} className="border-b hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    {new Date(item.date).toLocaleDateString("id-ID")}
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

      {/* MODAL */}
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

              {/* DATE */}
              <input
                type="date"
                className="border px-3 py-2 w-full rounded-lg"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />

              {/* COMPUTER CODE INPUT */}
              <div className="space-y-1">
                <input
                  placeholder="Type Computer Code (e.g: ABC123...)"
                  className="border px-3 py-2 w-full rounded-lg"
                  value={form.computerCode}
                  onChange={(e) => {
                    const code = e.target.value;

                    const found = products.find((p) =>
                      p.computerCode
                        .toLowerCase()
                        .startsWith(code.toLowerCase())
                    );

                    setForm({
                      ...form,
                      computerCode: code,
                      productId: found?.id || "",
                    });
                  }}
                />

                <p className="text-xs text-slate-500">
                  Ketik computer code produk, sistem akan otomatis mengisi data produk.
                </p>
              </div>

              {/* AUTO INFO */}
              <div className="bg-slate-50 border rounded-lg p-3 text-sm">
                {form.productId ? (
                  (() => {
                    const selected = products.find(
                      (p) => p.id === form.productId
                    );
                    return (
                      <div className="space-y-1">
                        <p>
                          <span className="text-slate-500">Part No:</span>{" "}
                          <span className="font-medium">
                            {selected?.partNo}
                          </span>
                        </p>
                        <p>
                          <span className="text-slate-500">Product:</span>{" "}
                          <span className="font-medium">
                            {selected?.productName}
                          </span>
                        </p>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-red-500 text-xs">
                    Product tidak ditemukan. Pastikan computer code benar.
                  </p>
                )}
              </div>

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