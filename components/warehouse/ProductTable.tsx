"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  initialStock: number;
  incomingQty: number;
  outgoingQty: number;
  finalStock: number;
  product: {
    computerCode: string;
    partNo: string;
    productName: string;
    createdAt?: string;
  };
};

export default function ProductTable({ type }: { type: "HT" | "HK" }) {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    computerCode: "",
    partNo: "",
    productName: "",
    initialStock: 0,
  });

  // 🔥 Debounce (TAMBAHAN - TIDAK MENGHAPUS APAPUN)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  // 🔥 FETCH DATA
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wip/stock?type=${type}`);
      const json = await res.json();

      if (!json || !json.data) {
        setData([]);
        return;
      }

      setData(json.data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  // 🔥 FILTER + SORT (DITAMBAH LOG, TIDAK DIKURANGI)
  const filteredData = useMemo(() => {
    const result = data
      .filter((item) =>
        [
          item.product.productName,
          item.product.partNo,
          item.product.computerCode,
        ]
          .join(" ")
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase())
      )
      .sort(
        (a, b) =>
          new Date(a.product?.createdAt || 0).getTime() -
          new Date(b.product?.createdAt || 0).getTime()
      );

    return result;
  }, [data, debouncedSearch]);

  // 🔥 HANDLE SUBMIT
  const handleSubmit = async () => {
    if (!form.computerCode || !form.partNo || !form.productName) {
      alert("Please complete all fields!");
      return;
    }

    setSubmitting(true);

    try {
      const url = isEdit
        ? `/api/wip/stock/${editId}`
        : "/api/wip/product";

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, type }),
      });

      if (res.ok) {
        resetForm();
        fetchData();
      } else {
        console.error("Submit failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // 🔥 HANDLE EDIT
  const handleEdit = (item: Product) => {
    setIsEdit(true);
    setEditId(item.id);
    setShowForm(true);

    setForm({
      computerCode: item.product.computerCode,
      partNo: item.product.partNo,
      productName: item.product.productName,
      initialStock: item.initialStock,
    });
  };

  // 🔥 HANDLE DELETE
  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);

    try {
      const res = await fetch(`/api/wip/stock/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error("Delete failed");
      } else {
        await fetchData();
        setDeleteId(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  };

  // 🔥 RESET FORM
  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setEditId(null);

    setForm({
      computerCode: "",
      partNo: "",
      productName: "",
      initialStock: 0,
    });
  };

  // 🔥 COLOR LOGIC (TETAP + DIPERJELAS)
  const stockColor = (n: number) => {
    if (n <= 0) return "bg-red-100 text-red-700";
    if (n < 50) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="px-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Product List ({type})
          </h2>
          <p className="text-sm text-slate-500">
            Manage and monitor product stock
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow"
        >
          + Add Product
        </button>
      </div>

      {/* SEARCH */}
      <div className="px-4 flex items-center gap-4">
        <input
          placeholder="Search product, part number, or code..."
          className="border rounded-lg px-4 py-2.5 w-[260px] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* 🔥 TAMBAHAN INFO */}
        <span className="text-xs text-slate-400">
          Showing {filteredData.length} of {data.length} items
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
                    "Code",
                    "Part No",
                    "Product",
                    "Initial",
                    "Incoming",
                    "Outgoing",
                    "Final",
                    "Action",
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
                      No product found matching your search.
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
                          className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${stockColor(
                            item.finalStock
                          )}`}
                        >
                          {item.finalStock}
                        </span>
                      </td>

                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>

        </div>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[420px] space-y-5 shadow-xl">

            <h3 className="text-lg font-semibold">
              {isEdit ? "Edit Product" : "Add Product"}
            </h3>

            <div className="space-y-4">

              <div>
                <label className="text-sm font-medium">Computer Code</label>
                <input className="border px-3 py-2 w-full rounded-lg"
                  value={form.computerCode}
                  onChange={(e)=>setForm({...form,computerCode:e.target.value})}
                />
                <p className="text-xs text-slate-400">
                  Unique identifier for the product
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Part Number</label>
                <input className="border px-3 py-2 w-full rounded-lg"
                  value={form.partNo}
                  onChange={(e)=>setForm({...form,partNo:e.target.value})}
                />
                <p className="text-xs text-slate-400">
                  Official part number reference
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Product Name</label>
                <input className="border px-3 py-2 w-full rounded-lg"
                  value={form.productName}
                  onChange={(e)=>setForm({...form,productName:e.target.value})}
                />
                <p className="text-xs text-slate-400">
                  Name displayed in the system
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Initial Stock</label>
                <input type="number" className="border px-3 py-2 w-full rounded-lg"
                  value={form.initialStock}
                  onChange={(e)=>setForm({...form,initialStock:Number(e.target.value)})}
                />
                <p className="text-xs text-slate-400">
                  Starting quantity before transactions
                </p>
              </div>

            </div>

            <div className="flex justify-end gap-2">
              <button onClick={resetForm} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {submitting ? "Saving..." : isEdit ? "Update" : "Save"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[360px] space-y-4 shadow-xl">

            <h3 className="text-lg font-semibold">
              Delete Product
            </h3>

            <p className="text-sm text-slate-500">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button onClick={()=>setDeleteId(null)} className="px-4 py-2 border rounded-lg">
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}