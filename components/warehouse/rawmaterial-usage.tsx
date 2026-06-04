"use client";

import { useEffect, useState } from "react";

type Batch = {
  id: string;
  lotNo: string;
  balanceQty: number;
  balanceWeight: number;

  rawMaterial: {
    materialName: string;
  };
};

type UsageHistory = {
  id: string;

  usageDate: string;

  qtyUsed: number;
  weightUsed: number;

  balanceQtyBefore: number;
  balanceQtyAfter: number;

  balanceWeightBefore: number;
  balanceWeightAfter: number;

  remark: string | null;

  createdBy: string;

  batch: {
    lotNo: string;

    rawMaterial: {
      materialName: string;
    };
  };
};

export default function RawMaterialUsage() {
  const [batches, setBatches] =
    useState<Batch[]>([]);

  const [history, setHistory] =
    useState<UsageHistory[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [form, setForm] = useState({
    batchId: "",
    qtyUsed: "",
    weightUsed: "",
    remark: "",
    createdBy: "",
    usageDate: new Date()
      .toISOString()
      .split("T")[0],
    usageTime: new Date()
      .toTimeString()
      .slice(0, 5),
  });

  /* ================= FETCH ================= */

  const fetchBatches = async () => {
    try {
      const response =
        await fetch("/api/raw-material");

      const result =
        await response.json();

      setBatches(result);
    } catch (error) {
      console.error(
        "[FETCH_BATCHES_ERROR]",
        error
      );
    }
  };

  const fetchHistory = async () => {
  try {
    const response =
      await fetch(
        "/api/raw-material/usage"
      );

    const result =
      await response.json();

    setHistory(result);
  } catch (error) {
    console.error(
      "[FETCH_HISTORY_ERROR]",
      error
    );
  }
};

  useEffect(() => {
  fetchBatches();
  fetchHistory();
}, []);
  /* ================= CHANGE ================= */

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  /* ================= RESET ================= */

  const resetForm = () => {
    setForm({
      batchId: "",
      qtyUsed: "",
      weightUsed: "",
      remark: "",
      createdBy: "",
      usageDate: new Date()
        .toISOString()
        .split("T")[0],
      usageTime: new Date()
        .toTimeString()
        .slice(0, 5),
    });

    setShowForm(false);
  };

  /* ================= SELECTED BATCH ================= */

  const selectedBatch =
    batches.find(
      (item) =>
        item.id === form.batchId
    );

  /* ================= SUBMIT ================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response =
        await fetch(
          "/api/raw-material/usage",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              ...form,

              qtyUsed: Number(
                form.qtyUsed
              ),

              weightUsed:
                Number(
                  form.weightUsed
                ),
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to create usage"
        );
      }

      alert(
        "Material usage saved successfully"
      );

      fetchBatches();
      fetchHistory();

      resetForm();
    } catch (error) {
      console.error(
        "[CREATE_USAGE_ERROR]",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="px-1 flex items-center justify-between">

        <div>

          <h2 className="text-xl font-semibold">
            Raw Material Usage
          </h2>

          <p className="text-sm text-slate-500">
            Record raw material
            consumption
          </p>

        </div>

        <button
          onClick={() =>
            setShowForm(true)
          }
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm shadow"
        >
          + Add Usage
        </button>

      </div>

      {/* MODAL */}
      {showForm && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">

          <div className="bg-white rounded-2xl w-full max-w-6xl shadow-xl">

            {/* HEADER */}
            <div className="border-b px-6 py-4 flex items-center justify-between">

              <div>

                <h3 className="text-lg font-semibold">
                  Add Material Usage
                </h3>

                <p className="text-sm text-slate-500">
                  Fill all required
                  fields
                </p>

              </div>

              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ×
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6"
            >

              {/* BATCH INFO */}
              {selectedBatch && (
                <div className="grid md:grid-cols-3 gap-4">

                  <div className="rounded-xl border bg-slate-50 p-4">

                    <p className="text-xs text-slate-500">
                      Material Name
                    </p>

                    <p className="font-semibold">
                      {
                        selectedBatch
                          .rawMaterial
                          .materialName
                      }
                    </p>

                  </div>

                  <div className="rounded-xl border bg-green-50 p-4">

                    <p className="text-xs text-green-700">
                      Available Qty
                    </p>

                    <p className="text-xl font-bold text-green-600">
                      {
                        selectedBatch.balanceQty
                      }
                    </p>

                  </div>

                  <div className="rounded-xl border bg-blue-50 p-4">

                    <p className="text-xs text-blue-700">
                      Available Weight
                    </p>

                    <p className="text-xl font-bold text-blue-600">
                      {
                        selectedBatch.balanceWeight
                      }{" "}
                      kg
                    </p>

                  </div>

                </div>
              )}

              {/* GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                <div className="space-y-2">

                  <label className="text-sm font-medium">
                    Material Batch
                  </label>

                  <select
                    name="batchId"
                    value={form.batchId}
                    onChange={
                      handleChange
                    }
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >

                    <option value="">
                      Select Batch
                    </option>

                    {batches.map(
                      (item) => (
                        <option
                          key={item.id}
                          value={
                            item.id
                          }
                        >
                          {
                            item
                              .rawMaterial
                              .materialName
                          }
                          {" - "}
                          {
                            item.lotNo
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="space-y-2">

                  <label className="text-sm font-medium">
                    Qty Used
                  </label>

                  <input
                    type="number"
                    name="qtyUsed"
                    value={
                      form.qtyUsed
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />

                </div>

                <div className="space-y-2">

                  <label className="text-sm font-medium">
                    Weight Used
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    name="weightUsed"
                    value={
                      form.weightUsed
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />

                </div>

                <div className="space-y-2">

                  <label className="text-sm font-medium">
                    Created By
                  </label>

                  <input
                    type="text"
                    name="createdBy"
                    value={
                      form.createdBy
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />

                </div>

                <div className="space-y-2">

                  <label className="text-sm font-medium">
                    Usage Date
                  </label>

                  <input
                    type="date"
                    name="usageDate"
                    value={
                      form.usageDate
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />

                </div>

                <div className="space-y-2">

                  <label className="text-sm font-medium">
                    Usage Time
                  </label>

                  <input
                    type="time"
                    name="usageTime"
                    value={
                      form.usageTime
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />

                </div>

                <div className="space-y-2 lg:col-span-2">

                  <label className="text-sm font-medium">
                    Remark
                  </label>

                  <textarea
                    rows={3}
                    name="remark"
                    value={form.remark}
                    onChange={
                      handleChange
                    }
                    placeholder="Usage reason, production order, machine number..."
                    className="w-full border rounded-lg px-3 py-2 resize-none"
                  />

                </div>

              </div>

              {/* SUMMARY */}
              <div className="rounded-xl border bg-slate-50 p-5">

                <h3 className="font-semibold mb-4">
                  Usage Summary
                </h3>

                <div className="grid md:grid-cols-4 gap-4 text-sm">

                  <div>

                    <p className="text-slate-500">
                      Qty Used
                    </p>

                    <p className="font-semibold">
                      {form.qtyUsed || 0}
                    </p>

                  </div>

                  <div>

                    <p className="text-slate-500">
                      Weight Used
                    </p>

                    <p className="font-semibold">
                      {form.weightUsed || 0} kg
                    </p>

                  </div>

                  <div>

                    <p className="text-slate-500">
                      Date
                    </p>

                    <p className="font-semibold">
                      {form.usageDate}
                    </p>

                  </div>

                  <div>

                    <p className="text-slate-500">
                      Time
                    </p>

                    <p className="font-semibold">
                      {form.usageTime}
                    </p>

                  </div>

                </div>

              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-2">

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : "Save Usage"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}
      <div className="bg-white rounded-xl border shadow-sm">

  <div className="p-4 border-b">

    <h3 className="font-semibold">
      Material Usage History
    </h3>

    <p className="text-sm text-slate-500">
      Full Material Traceability
    </p>

  </div>

  <div className="overflow-x-auto">

    <table className="min-w-full text-sm">

      <thead className="bg-slate-50">

        <tr>

          <th className="px-4 py-3 text-left">
            Date
          </th>

          <th className="px-4 py-3 text-left">
            Material
          </th>

          <th className="px-4 py-3 text-left">
            Lot No
          </th>

          <th className="px-4 py-3 text-right">
            Qty Before
          </th>

          <th className="px-4 py-3 text-right">
            Qty Used
          </th>

          <th className="px-4 py-3 text-right">
            Qty After
          </th>

          <th className="px-4 py-3 text-right">
            Weight Before
          </th>

          <th className="px-4 py-3 text-right">
            Weight Used
          </th>

          <th className="px-4 py-3 text-right">
            Weight After
          </th>

          <th className="px-4 py-3 text-left">
            Operator
          </th>

          <th className="px-4 py-3 text-left">
            Remark
          </th>

        </tr>

      </thead>

      <tbody>

        {history.length === 0 && (

          <tr>

            <td
              colSpan={11}
              className="text-center py-10 text-slate-400"
            >
              No usage history
            </td>

          </tr>

        )}

        {history.map((item) => (

          <tr
            key={item.id}
            className="border-t hover:bg-slate-50"
          >

            <td className="px-4 py-3">
              {new Date(
                item.usageDate
              ).toLocaleDateString()}
            </td>

            <td className="px-4 py-3">
              {
                item.batch
                  .rawMaterial
                  .materialName
              }
            </td>

            <td className="px-4 py-3">
              {item.batch.lotNo}
            </td>

            <td className="px-4 py-3 text-right">
              {item.balanceQtyBefore}
            </td>

            <td className="px-4 py-3 text-right text-red-600 font-medium">
              {item.qtyUsed}
            </td>

            <td className="px-4 py-3 text-right">
              {item.balanceQtyAfter}
            </td>

            <td className="px-4 py-3 text-right">
              {item.balanceWeightBefore.toFixed(
                2
              )}
            </td>

            <td className="px-4 py-3 text-right text-red-600 font-medium">
              {item.weightUsed.toFixed(
                2
              )}
            </td>

            <td className="px-4 py-3 text-right">
              {item.balanceWeightAfter.toFixed(
                2
              )}
            </td>

            <td className="px-4 py-3">
              {item.createdBy}
            </td>

            <td className="px-4 py-3">
              {item.remark || "-"}
            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

</div>

    </div>
  );
}