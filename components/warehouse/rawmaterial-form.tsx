"use client";

import { useEffect, useState } from "react";

type RawMaterial = {
  id: string;

  materialCode: string;

  materialName: string;
};

export default function RawMaterialForm() {

  const [materials, setMaterials] = useState<
    RawMaterial[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [spq, setSpq] =
    useState(0);

  const [form, setForm] = useState({
    rawMaterialId: "",

    lotNo: "",

    incomingQty: "",

    incomingWeight: "",

    warehouse: "W1",

    expDate: "",

    createdBy: "",
  });

  /* ================= FETCH MATERIALS ================= */

  const fetchMaterials =
    async () => {

      try {

        const response =
          await fetch(
            "/api/raw-material/master/list"
          );

        const data =
          await response.json();

        setMaterials(data);

      } catch (error) {

        console.error(
          "[FETCH_RAW_MATERIAL_MASTER_ERROR]",
          error
        );
      }
    };

  useEffect(() => {
    fetchMaterials();
  }, []);

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

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  /* ================= RESET FORM ================= */

  const resetForm = () => {

    setForm({
      rawMaterialId: "",

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

  const handleSubmit = async (
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

        const errorData =
          await response.json();

        throw new Error(
          errorData.message ||
          "Failed to save raw material"
        );
      }

      alert(
        "Raw material incoming created successfully"
      );

      resetForm();

    } catch (error: any) {

      console.error(
        "[CREATE_RAW_MATERIAL_ERROR]",
        error
      );

      alert(
        error.message ||
        "Failed to create raw material"
      );

    } finally {

      setLoading(false);
    }
  };

  /* ================= FILTER ================= */

  const filteredMaterials =
    materials.filter((item) =>
      [
        item.materialCode,

        item.materialName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="px-1 flex items-center justify-between">

        <div>

          <h2 className="text-xl font-semibold">
            Raw Material Incoming
          </h2>

          <p className="text-sm text-slate-500">
            Create incoming raw material
            transaction
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

              {/* SEARCH */}
              <div className="space-y-2">

                <label className="text-sm font-medium">
                  Search Material
                </label>

                <input
                  type="text"
                  placeholder="Search material code or name..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />

              </div>

              {/* GRID */}
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

                    {filteredMaterials.map(
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
                    placeholder="Input lot number"
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
                    placeholder="Input qty"
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
                    placeholder="Input weight"
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
                    placeholder="Input PIC"
                    className="w-full border rounded-lg px-3 py-2"
                  />

                </div>

              </div>

              {/* BUTTON */}
              <div className="flex justify-end gap-2 pt-2">

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

