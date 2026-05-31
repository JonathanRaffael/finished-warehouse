// components/warehouse/rawmaterial-usage.tsx

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

export default function RawMaterialUsage() {

  const [batches, setBatches] =
    useState<Batch[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] = useState({
    batchId: "",

    qtyUsed: "",

    weightUsed: "",

    remark: "",

    createdBy: "",
  });

  /* ================= FETCH BATCH ================= */

  const fetchBatches =
    async () => {

      try {

        const response =
          await fetch(
            "/api/raw-material"
          );

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

  useEffect(() => {
    fetchBatches();
  }, []);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      setLoading(true);

      const response = await fetch(
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

      if (!response.ok) {

        throw new Error(
          "Failed to create usage"
        );
      }

      alert(
        "Material usage saved successfully"
      );

      setForm({
        batchId: "",

        qtyUsed: "",

        weightUsed: "",

        remark: "",

        createdBy: "",
      });

      fetchBatches();

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
    <div className="bg-white border rounded-2xl shadow-sm p-6">

      <div className="mb-6">

        <h2 className="text-xl font-semibold">
          Raw Material Usage
        </h2>

        <p className="text-sm text-slate-500">
          Record material usage and
          automatically reduce stock
        </p>

      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >

        {/* BATCH */}
        <div className="space-y-2">

          <label className="text-sm font-medium">
            Material Batch
          </label>

          <select
            name="batchId"
            value={form.batchId}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2"
          >

            <option value="">
              Select Batch
            </option>

            {batches.map((item) => (

              <option
                key={item.id}
                value={item.id}
              >
                {
                  item.rawMaterial
                    .materialName
                }{" "}
                - {item.lotNo}
              </option>
            ))}

          </select>

        </div>

        {/* QTY USED */}
        <div className="space-y-2">

          <label className="text-sm font-medium">
            Qty Used
          </label>

          <input
            type="number"
            name="qtyUsed"
            value={form.qtyUsed}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2"
          />

        </div>

        {/* WEIGHT USED */}
        <div className="space-y-2">

          <label className="text-sm font-medium">
            Weight Used
          </label>

          <input
            type="number"
            step="0.01"
            name="weightUsed"
            value={form.weightUsed}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2"
          />

        </div>

        {/* REMARK */}
        <div className="space-y-2">

          <label className="text-sm font-medium">
            Remark
          </label>

          <input
            type="text"
            name="remark"
            value={form.remark}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

        </div>

        {/* CREATED BY */}
        <div className="space-y-2">

          <label className="text-sm font-medium">
            Created By
          </label>

          <input
            type="text"
            name="createdBy"
            value={form.createdBy}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2"
          />

        </div>

        {/* BUTTON */}
        <div className="flex items-end">

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : "Save Usage"}
          </button>

        </div>

      </form>

    </div>
  );
}