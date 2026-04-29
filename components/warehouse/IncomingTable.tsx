"use client";

import { useEffect, useMemo, useState } from "react";

type Incoming = {
  id: string;
  date: string;
  qty: number;
  batch?: string;
  createdBy: string;
  ipqc?: string;
  remark?: string;
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

export default function IncomingTable({ type }: { type: "HT" | "HK" }) {
  const [data, setData] = useState<Incoming[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 🔥 PAGINATION STATE
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    productId: "",
    computerCode: "",
    qty: 0,
    createdBy: "",
    ipqc: "",
    remark: "",
    date: new Date().toISOString().split("T")[0],
  });

  // =====================
  // 🔥 DEBOUNCE
  // =====================
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // =====================
  // 🔥 FETCH (UPDATED)
  // =====================
  const fetchData = () => {
    setLoading(true);

    fetch(
      `/api/wip/incoming?type=${type}&page=${page}&limit=${limit}&search=${debouncedSearch}`
    )
      .then((res) => res.json())
      .then((res) => {
        // support lama + baru
        if (Array.isArray(res)) {
          setData(res);
          setTotal(res.length);
          setTotalPages(1);
        } else {
          setData(res.data);
          setTotal(res.pagination.total);
          setTotalPages(res.pagination.totalPages);
        }
      })
      .finally(() => setLoading(false));
  };

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
  }, [type, page, debouncedSearch]);

  // 🔥 RESET PAGE SAAT SEARCH
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, type]);

  // =====================
  // FILTER (TETAP ADA)
  // =====================
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
        .includes(debouncedSearch.toLowerCase())
    );
  }, [data, debouncedSearch]);

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

    setSubmitting(true);

    const res = await fetch("/api/wip/incoming", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        computerCode: form.computerCode,
        qty: form.qty,
        createdBy: form.createdBy,
        ipqc: form.ipqc,
        remark: form.remark,
        date: form.date,
        type,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.error);
      setSubmitting(false);
      return;
    }

    resetForm();
    fetchData();
    setSubmitting(false);
  };

  const resetForm = () => {
    setShowForm(false);
    setForm({
      productId: "",
      computerCode: "",
      qty: 0,
      createdBy: "",
      ipqc: "",
      remark: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="px-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Incoming List ({type})
          </h2>
          <p className="text-sm text-slate-500">
            Track all incoming product transactions
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow"
        >
          + Add Incoming
        </button>
      </div>

      {/* SEARCH */}
      <div className="px-4 flex items-center gap-4">
        <input
          placeholder="Search product, code, responsible..."
          className="border rounded-lg px-4 py-2.5 w-[260px] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <span className="text-xs text-slate-400">
          Showing {filteredData.length} of {total} items
        </span>
      </div>

      {/* TABLE */}
      <div className="px-4">
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="overflow-x-auto max-h-[65vh]">
            <table className="w-full text-sm">

              <thead className="bg-slate-100 text-slate-700 border-b sticky top-0 z-10">
                <tr>
                  {[
                    "Date",
                    "Code",
                    "Part No",
                    "Product",
                    "Qty",
                    "Responsible",
                    "IPQC",
                    "Remark",
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
                    <td colSpan={8} className="p-6">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-4 bg-slate-200 rounded animate-pulse mb-2" />
                      ))}
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400">
                      No data found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, i) => (
                    <tr
                      key={item.id}
                      className={`border-b transition hover:bg-slate-50 ${
                        i % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }`}
                    >
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

                      <td className="px-4 py-3 text-green-600 font-semibold">
                        +{item.qty}
                      </td>

                      <td className="px-4 py-3">
                        {item.createdBy}
                      </td>

                      <td className="px-4 py-3">
                        {item.ipqc || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {item.remark || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        </div>
      </div>

      {/* 🔥 PAGINATION UI */}
      <div className="px-4 flex justify-between items-center">
        <span className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* MODAL (SEMUA FIELD TETAP ADA 🔥) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[420px] space-y-5 shadow-xl">

            <div>
              <h3 className="font-semibold text-lg">Add Incoming</h3>
              <p className="text-sm text-slate-500">
                Input incoming product data
              </p>
            </div>

            <div className="space-y-4">

              <input
                type="date"
                className="border px-3 py-2 w-full rounded-lg"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />

              {/* COMPUTER CODE */}
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

              {/* AUTO INFO TETAP ADA */}
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
                placeholder="Quantity"
                className="border px-3 py-2 w-full rounded-lg"
                value={form.qty || ""}
                onChange={(e) =>
                  setForm({ ...form, qty: Number(e.target.value) })
                }
              />

              <input
                placeholder="Responsible"
                className="border px-3 py-2 w-full rounded-lg"
                value={form.createdBy}
                onChange={(e) =>
                  setForm({ ...form, createdBy: e.target.value })
                }
              />

              <input
                placeholder="IPQC PIC"
                className="border px-3 py-2 w-full rounded-lg"
                value={form.ipqc}
                onChange={(e) =>
                  setForm({ ...form, ipqc: e.target.value })
                }
              />

              <input
                placeholder="Remark"
                className="border px-3 py-2 w-full rounded-lg"
                value={form.remark}
                onChange={(e) =>
                  setForm({ ...form, remark: e.target.value })
                }
              />

            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Incoming"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}