"use client";

import { useEffect, useMemo, useState } from "react";

type RawMaterialBatch = {
  id: string;

  materialCode: string;

  materialName: string;

  incomingDate: string;

  lotNo: string;

  incomingQty: number;

  incomingWeight: number;

  spq: number;

  balanceQty: number;

  balanceWeight: number;

  warehouse: string;

  expDate: string;

  status:
    | "ACTIVE"
    | "EMPTY"
    | "EXPIRED";
};

export default function RawMaterialMaster() {

  const [data, setData] = useState<
    RawMaterialBatch[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [form, setForm] = useState({
    materialCode: "",

    materialName: "",

    incomingDate: "",

    lotNo: "",

    incomingQty: "",

    incomingWeight: "",

    spq: "",

    warehouse: "",

    expDate: "",
  });

  /* ================= DEBOUNCE ================= */

  useEffect(() => {

    const timeout = setTimeout(
      () => {
        setDebouncedSearch(
          search
        );
      },
      300
    );

    return () =>
      clearTimeout(timeout);

  }, [search]);

  /* ================= AUTO SPQ ================= */

  useEffect(() => {

    const qty =
      Number(form.incomingQty);

    const weight =
      Number(form.incomingWeight);

    if (
      qty > 0 &&
      weight > 0
    ) {

      const spq =
        weight / qty;

      setForm((prev) => ({
        ...prev,

        spq:
          spq.toFixed(2),
      }));
    }

  }, [
    form.incomingQty,
    form.incomingWeight,
  ]);

  /* ================= FETCH ================= */

  const fetchMaterials =
    async () => {

      try {

        setLoading(true);

        const response =
          await fetch(
            "/api/raw-material/master"
          );

        const result =
          await response.json();

        setData(result);

      } catch (error) {

        console.error(
          "[FETCH_RAW_MATERIAL_ERROR]",
          error
        );

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {
    fetchMaterials();
  }, []);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
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
      materialCode: "",

      materialName: "",

      incomingDate: "",

      lotNo: "",

      incomingQty: "",

      incomingWeight: "",

      spq: "",

      warehouse: "",

      expDate: "",
    });

    setShowForm(false);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      setLoading(true);

      const response =
        await fetch(
          "/api/raw-material/master/create",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              materialCode:
                form.materialCode,

              materialName:
                form.materialName,

              incomingDate:
                form.incomingDate,

              lotNo:
                form.lotNo,

              incomingQty:
                Number(
                  form.incomingQty
                ),

              incomingWeight:
                Number(
                  form.incomingWeight
                ),

              spq:
                Number(
                  form.spq
                ),

              warehouse:
                form.warehouse,

              expDate:
                form.expDate,
            }),
          }
        );

      if (!response.ok) {

        throw new Error(
          "Failed to save material"
        );
      }

      await fetchMaterials();

      resetForm();

    } catch (error) {

      console.error(
        "[SAVE_RAW_MATERIAL_ERROR]",
        error
      );

    } finally {

      setLoading(false);
    }
  };

  /* ================= FILTER ================= */

  const filteredData =
    useMemo(() => {

      return data.filter(
        (item) =>
          [
            item.materialCode,

            item.materialName,

            item.lotNo,

            item.warehouse,
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              debouncedSearch.toLowerCase()
            )
      );

    }, [
      data,
      debouncedSearch,
    ]);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-semibold">
            Master Material
          </h2>

          <p className="text-sm text-slate-500">
            Raw material batch
            management
          </p>

        </div>

        <button
          onClick={() =>
            setShowForm(true)
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow"
        >
          + Add Batch
        </button>

      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-4">

        <input
          placeholder="Search material..."
          className="border rounded-lg px-4 py-2.5 w-[320px] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <span className="text-xs text-slate-400">
          Showing{" "}
          {filteredData.length} of{" "}
          {data.length} items
        </span>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-slate-100 text-slate-700 border-b">

            <tr>

              <th className="px-4 py-3 text-left">
                No
              </th>

              <th className="px-4 py-3 text-left">
                Material
              </th>

              <th className="px-4 py-3 text-left">
                Lot No
              </th>

              <th className="px-4 py-3 text-left">
                Incoming
              </th>

              <th className="px-4 py-3 text-left">
                Balance
              </th>

              <th className="px-4 py-3 text-left">
                Weight
              </th>

              <th className="px-4 py-3 text-left">
                Warehouse
              </th>

              <th className="px-4 py-3 text-left">
                Expired
              </th>

              <th className="px-4 py-3 text-left">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredData.map(
              (
                item,
                index
              ) => (

                <tr
                  key={item.id}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="px-4 py-3">
                    {index + 1}
                  </td>

                  <td className="px-4 py-3">

                    <div className="font-medium">
                      {
                        item.materialName
                      }
                    </div>

                    <div className="text-xs text-slate-500 font-mono">
                      {
                        item.materialCode
                      }
                    </div>

                  </td>

                  <td className="px-4 py-3 font-mono">
                    {item.lotNo}
                  </td>

                  <td className="px-4 py-3">
                    {item.incomingQty} Box
                  </td>

                  <td className="px-4 py-3">
                    {item.balanceQty} Box
                  </td>

                  <td className="px-4 py-3">

                    <div>
                      {item.balanceWeight} Kg
                    </div>

                    <div className="text-xs text-slate-400">
                      SPQ:
                      {" "}
                      {item.spq} Kg
                    </div>

                  </td>

                  <td className="px-4 py-3">
                    {item.warehouse}
                  </td>

                  <td className="px-4 py-3">
                    {new Date(
                      item.expDate
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status ===
                        "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : item.status ===
                            "EMPTY"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

      {/* MODAL */}
      {showForm && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">

          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl">

            {/* HEADER */}
            <div className="border-b px-6 py-4 flex items-center justify-between">

              <div>

                <h3 className="text-lg font-semibold">
                  Add Material Batch
                </h3>

                <p className="text-sm text-slate-500">
                  Raw material
                  incoming batch
                </p>

              </div>

              <button
                onClick={
                  resetForm
                }
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ×
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={
                handleSubmit
              }
              className="p-6 grid grid-cols-2 gap-5"
            >

              <div className="space-y-2">

                <label className="text-sm font-medium">
                  Material Code
                </label>

                <input
                  type="text"
                  name="materialCode"
                  value={
                    form.materialCode
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
                  Material Name
                </label>

                <input
                  type="text"
                  name="materialName"
                  value={
                    form.materialName
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
                  Incoming Date
                </label>

                <input
                  type="date"
                  name="incomingDate"
                  value={
                    form.incomingDate
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
                  Lot No
                </label>

                <input
                  type="text"
                  name="lotNo"
                  value={
                    form.lotNo
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
                  Incoming Qty
                </label>

                <input
                  type="number"
                  name="incomingQty"
                  value={
                    form.incomingQty
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
                  Incoming Weight
                </label>

                <input
                  type="number"
                  step="0.01"
                  name="incomingWeight"
                  value={
                    form.incomingWeight
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
                  SPQ
                </label>

                <input
                  type="number"
                  value={form.spq}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 bg-slate-100"
                />

              </div>

              <div className="space-y-2">

                <label className="text-sm font-medium">
                  Warehouse
                </label>

                <input
                  type="text"
                  name="warehouse"
                  value={
                    form.warehouse
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />

              </div>

              <div className="space-y-2 col-span-2">

                <label className="text-sm font-medium">
                  Expired Date
                </label>

                <input
                  type="date"
                  name="expDate"
                  value={
                    form.expDate
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />

              </div>

              <div className="col-span-2 flex justify-end gap-2 pt-4">

                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white"
                >
                  {loading
                    ? "Saving..."
                    : "Save Batch"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

