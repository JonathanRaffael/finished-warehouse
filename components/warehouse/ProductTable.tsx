"use client";

import { useEffect, useMemo, useState } from "react";

export default function ProductTable({ type }: { type: "HT" | "HK" }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    computerCode: "",
    partNo: "",
    productName: "",
    initialStock: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wip/stock?type=${type}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const filteredData = useMemo(() => {
  return data
    .filter((item) =>
      [item.product.productName, item.product.partNo, item.product.computerCode]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(a.product?.createdAt || 0).getTime() -
        new Date(b.product?.createdAt || 0).getTime()
    );
}, [data, search]);

  const handleSubmit = async () => {
    if (!form.computerCode || !form.partNo || !form.productName) {
      alert("Lengkapi data!");
      return;
    }

    const res = await fetch("/api/wip/product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...form, type }),
    });

    if (res.ok) {
      setShowForm(false);
      setForm({
        computerCode: "",
        partNo: "",
        productName: "",
        initialStock: 0,
      });
      fetchData();
    }
  };

  const stockColor = (n: number) => {
    if (n <= 0) return "bg-red-100 text-red-700";
    if (n < 50) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="space-y-5">

      {/* 🔷 HEADER */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">

  <div>
    <h2 className="text-lg font-semibold">
      Product List ({type})
    </h2>
    <p className="text-sm text-slate-500">
      Manage and monitor product stock
    </p>
  </div>

  <button
    onClick={() => setShowForm(true)}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow"
  >
    + Add Product
  </button>

</div>

      {/* 🔍 SEARCH */}
      <div className="flex items-center gap-3">
        <input
          placeholder="Search product, part no, code..."
          className="border rounded-lg px-4 py-2 w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 📊 TABLE CARD */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b text-slate-600">
            <tr>
              {[
                "Code",
                "Part No",
                "Product",
                "Initial",
                "Incoming",
                "Outgoing",
                "Final",
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
                <td colSpan={7} className="text-center py-10 text-slate-400">
                  Loading data...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400">
                  No product found
                </td>
              </tr>
            ) : (
              filteredData.map((item, i) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-slate-50 transition"
                >
                  <td className="px-4 py-3 font-mono text-blue-600">
                    {item.product.computerCode}
                  </td>

                  <td className="px-4 py-3">
                    {item.product.partNo}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {item.product.productName}
                  </td>

                  <td className="px-4 py-3">
                    {item.initialStock}
                  </td>

                  <td className="px-4 py-3 text-green-600 font-medium">
                    +{item.incomingQty}
                  </td>

                  <td className="px-4 py-3 text-red-600 font-medium">
                    -{item.outgoingQty}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${stockColor(
                        item.finalStock
                      )}`}
                    >
                      {item.finalStock}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🧾 MODAL FORM */}
      {showForm && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-[420px] space-y-5 shadow-xl">

      {/* HEADER */}
      <div>
        <h3 className="font-semibold text-lg">Add Product</h3>
        <p className="text-sm text-slate-500">
          Fill in product details to create new item
        </p>
      </div>

      {/* FORM */}
      <div className="space-y-4">

        {/* COMPUTER CODE */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Computer Code</label>
          <input
            placeholder="e.g. RRU17450201D5T"
            className="border px-3 py-2 w-full rounded-lg"
            value={form.computerCode}
            onChange={(e) =>
              setForm({ ...form, computerCode: e.target.value })
            }
          />
        </div>

        {/* PART NO */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Part Number</label>
          <input
            placeholder="e.g. D25797-5T"
            className="border px-3 py-2 w-full rounded-lg"
            value={form.partNo}
            onChange={(e) =>
              setForm({ ...form, partNo: e.target.value })
            }
          />
        </div>

        {/* PRODUCT NAME */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Product Name</label>
          <input
            placeholder="e.g. Upper Sealing Strip"
            className="border px-3 py-2 w-full rounded-lg"
            value={form.productName}
            onChange={(e) =>
              setForm({ ...form, productName: e.target.value })
            }
          />
        </div>

        {/* INITIAL STOCK */}
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Initial Stock
          </label>

          <input
            type="number"
            placeholder="Enter starting stock (default 0)"
            className="border px-3 py-2 w-full rounded-lg"
            value={form.initialStock || ""}
            onChange={(e) =>
              setForm({
                ...form,
                initialStock: Number(e.target.value),
              })
            }
          />

          <p className="text-xs text-slate-500">
            This is the starting quantity before any incoming or outgoing transactions.
          </p>
        </div>

      </div>

      {/* ACTION */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={() => setShowForm(false)}
          className="px-4 py-2 text-sm rounded-lg border hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Save Product
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}