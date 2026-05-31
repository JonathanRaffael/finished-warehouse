"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type Material = {
  id: string;

  materialCode: string;

  materialName: string;
};

type RawMaterialBatch = {
  id: string;

  incomingDate: string;

  lotNo: string;

  incomingQty: number;

  incomingWeight: number;

  spq: number;

  balanceQty: number;

  balanceWeight: number;

  warehouse: string;

  expDate: string;

  status: string;

  rawMaterial: {
    materialCode: string;

    materialName: string;
  };

  usages: {
    qtyUsed: number;
  }[];
};

export default function RawMaterialIncoming() {

  const [data, setData] =
    useState<
      RawMaterialBatch[]
    >([]);

  const [materials, setMaterials] =
    useState<Material[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [spq, setSpq] =
    useState(0);

  const [form, setForm] =
    useState({
      rawMaterialId: "",

      incomingDate: "",

      lotNo: "",

      incomingQty: "",

      incomingWeight: "",

      warehouse: "W1",

      expDate: "",

      createdBy: "",
    });

  /* ================= DEBOUNCE ================= */

  useEffect(() => {

    const timeout =
      setTimeout(() => {
        setDebouncedSearch(
          search
        );
      }, 300);

    return () =>
      clearTimeout(timeout);

  }, [search]);

  /* ================= AUTO SPQ ================= */

  useEffect(() => {

    const qty =
      Number(form.incomingQty);

    const weight =
      Number(
        form.incomingWeight
      );

    if (
      qty > 0 &&
      weight > 0
    ) {

      setSpq(
        Number(
          (
            weight / qty
          ).toFixed(2)
        )
      );

    } else {

      setSpq(0);
    }

  }, [
    form.incomingQty,
    form.incomingWeight,
  ]);

  /* ================= FETCH DATA ================= */

  const fetchData =
    async () => {

      try {

        setLoading(true);

        const response =
          await fetch(
            "/api/raw-material"
          );

        const result =
          await response.json();

        setData(result);

      } catch (error) {

        console.error(
          "[FETCH_RAW_MATERIAL_BATCH_ERROR]",
          error
        );

      } finally {

        setLoading(false);
      }
    };

  /* ================= FETCH MATERIALS ================= */

  const fetchMaterials =
    async () => {

      try {

        const response =
          await fetch(
            "/api/raw-material/master/list"
          );

        const result =
          await response.json();

        setMaterials(result);

      } catch (error) {

        console.error(
          "[FETCH_RAW_MATERIAL_OPTIONS_ERROR]",
          error
        );
      }
    };

  useEffect(() => {

    fetchData();

    fetchMaterials();

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

  /* ================= RESET ================= */

  const resetForm = () => {

    setForm({
      rawMaterialId: "",

      incomingDate: "",

      lotNo: "",

      incomingQty: "",

      incomingWeight: "",

      warehouse: "W1",

      expDate: "",

      createdBy: "",
    });

    setSpq(0);

    setShowForm(false);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault();

      try {

        setLoading(true);

        const response =
          await fetch(
            "/api/raw-material/incoming",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                ...form,

                incomingQty:
                  Number(
                    form.incomingQty
                  ),

                incomingWeight:
                  Number(
                    form.incomingWeight
                  ),

                spq,
              }),
            }
          );

        if (!response.ok) {

          throw new Error(
            "Failed to create batch"
          );
        }

        await fetchData();

        resetForm();

      } catch (error) {

        console.error(
          "[CREATE_RAW_MATERIAL_BATCH_ERROR]",
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
            item.rawMaterial
              .materialName,

            item.rawMaterial
              .materialCode,

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
      <div className="px-1 flex items-center justify-between">

        <div>

          <h2 className="text-xl font-semibold">
            Incoming Material
          </h2>

          <p className="text-sm text-slate-500">
            Continue incoming stock
            from existing material
          </p>

        </div>

        <button
          onClick={() =>
            setShowForm(true)
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow"
        >
          + Add Incoming
        </button>

      </div>

      {/* SEARCH */}
      <div className="px-1 flex items-center gap-4">

        <input
          placeholder="Search material, lot no, warehouse..."
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
      <div className="px-1">

        <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-slate-100 text-slate-700 border-b">

              <tr>

                <th className="px-4 py-3 text-left">
                  No
                </th>

                <th className="px-4 py-3 text-left">
                  Material Name
                </th>

                <th className="px-4 py-3 text-left">
                  Incoming Date
                </th>

                <th className="px-4 py-3 text-left">
                  Lot No
                </th>

                <th className="px-4 py-3 text-left">
                  Incoming Qty
                </th>

                <th className="px-4 py-3 text-left">
                  Incoming Weight
                </th>

                <th className="px-4 py-3 text-left">
                  SPQ
                </th>

                <th className="px-4 py-3 text-left">
                  Exp Date
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>

                <th className="px-4 py-3 text-left">
                  Warehouse
                </th>

                <th className="px-4 py-3 text-left">
                  Total Out
                </th>

                <th className="px-4 py-3 text-left">
                  Stock Balance
                </th>

                <th className="px-4 py-3 text-left">
                  Stock Weight
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredData.map(
                (
                  item,
                  index
                ) => {

                  const totalOut =
                    item.usages.reduce(
                      (
                        acc,
                        usage
                      ) =>
                        acc +
                        usage.qtyUsed,
                      0
                    );

                  return (

                    <tr
                      key={item.id}
                      className="border-b hover:bg-slate-50"
                    >

                      <td className="px-4 py-3">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 font-semibold text-red-600">
                        {
                          item
                            .rawMaterial
                            .materialName
                        }
                      </td>

                      <td className="px-4 py-3">
                        {new Date(
                          item.incomingDate
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3">
                        {item.lotNo}
                      </td>

                      <td className="px-4 py-3">
                        {
                          item.incomingQty
                        } Box
                      </td>

                      <td className="px-4 py-3 text-red-600">
                        {
                          item.incomingWeight
                        } Kg
                      </td>

                      <td className="px-4 py-3">
                        {item.spq} Kg
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
                            "EXPIRED"
                              ? "bg-red-100 text-red-700"
                              : item.status ===
                                "EMPTY"
                              ? "bg-slate-200 text-slate-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.status}
                        </span>

                      </td>

                      <td className="px-4 py-3 text-red-600">
                        {
                          item.warehouse
                        }
                      </td>

                      <td className="px-4 py-3 text-red-600">
                        {totalOut} Box
                      </td>

                      <td className="px-4 py-3">
                        {
                          item.balanceQty
                        } Box
                      </td>

                      <td className="px-4 py-3">
                        {
                          item.balanceWeight
                        } Kg
                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL */}
      {showForm && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">

          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl">

            {/* HEADER */}
            <div className="border-b px-6 py-4 flex items-center justify-between">

              <div>

                <h3 className="text-lg font-semibold">
                  Add Incoming Material
                </h3>

                <p className="text-sm text-slate-500">
                  Fill all required fields
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* MATERIAL */}
                <div className="space-y-2">

                  <label className="text-sm font-medium">
                    Material
                  </label>

                  <select
                    name="rawMaterialId"
                    value={
                      form.rawMaterialId
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >

                    <option value="">
                      Select Material
                    </option>

                    {materials.map(
                      (item) => (

                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {
                            item.materialCode
                          }
                          {" - "}
                          {
                            item.materialName
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* INCOMING DATE */}
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

                {/* LOT */}
                <div className="space-y-2">

                  <label className="text-sm font-medium">
                    Lot No
                  </label>

                  <input
                    type="text"
                    name="lotNo"
                    value={form.lotNo}
                    onChange={
                      handleChange
                    }
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  />

                </div>

                {/* QTY */}
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
                    min={1}
                    className="w-full border rounded-lg px-3 py-2"
                  />

                </div>

                {/* WEIGHT */}
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
                    min={0}
                    className="w-full border rounded-lg px-3 py-2"
                  />

                </div>

                {/* SPQ */}
                <div className="space-y-2">

                  <label className="text-sm font-medium">
                    SPQ
                  </label>

                  <input
                    type="number"
                    value={spq}
                    readOnly
                    className="w-full border rounded-lg px-3 py-2 bg-slate-100"
                  />

                </div>

                {/* WAREHOUSE */}
                <div className="space-y-2">

                  <label className="text-sm font-medium">
                    Warehouse
                  </label>

                  <select
                    name="warehouse"
                    value={
                      form.warehouse
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >

                    <option value="W1">
                      W1
                    </option>

                    <option value="W2">
                      W2
                    </option>

                    <option value="W3">
                      W3
                    </option>

                  </select>

                </div>

                {/* EXP DATE */}
                <div className="space-y-2">

                  <label className="text-sm font-medium">
                    Exp Date
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

                {/* CREATED BY */}
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

              </div>

              {/* BUTTON */}
              <div className="flex justify-end gap-2 pt-4">

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
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : "Save Incoming"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}