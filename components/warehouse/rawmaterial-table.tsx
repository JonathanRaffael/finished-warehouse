"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

const days = Array.from(
  { length: 31 },
  (_, i) => i + 1
);

type RawMaterialData = {
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

  rawMaterial?: {
    materialName: string;

    materialCode: string;
  };

  usages: {
    usageDate: string;

    qtyUsed: number;
  }[];
};

export default function RawMaterialTable() {

  const [data, setData] =
    useState<
      RawMaterialData[]
    >([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

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

  /* ================= FETCH ================= */

  const fetchRawMaterials =
    async () => {

      setLoading(true);

      try {

        const response =
          await fetch(
            "/api/raw-material"
          );

        if (!response.ok) {

          throw new Error(
            "Failed to fetch raw materials"
          );
        }

        const result =
          await response.json();

        setData(result);

      } catch (error) {

        console.error(
          "[RAW_MATERIAL_FETCH_ERROR]",
          error
        );

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {
    fetchRawMaterials();
  }, []);

  /* ================= FILTER ================= */

  const filteredData =
    useMemo(() => {

      return data
        .filter((item) =>
          [
            item.rawMaterial
              ?.materialName || "",

            item.rawMaterial
              ?.materialCode || "",

            item.lotNo,

            item.warehouse,

            item.status,
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              debouncedSearch.toLowerCase()
            )
        )
        .sort(
          (a, b) =>
            new Date(
              a.incomingDate
            ).getTime() -
            new Date(
              b.incomingDate
            ).getTime()
        );

    }, [
      data,
      debouncedSearch,
    ]);

  /* ================= STATUS COLOR ================= */

  const statusColor = (
    status: string
  ) => {

    if (
      status === "EXPIRED"
    ) {

      return "bg-red-100 text-red-700";
    }

    if (
      status === "EMPTY"
    ) {

      return "bg-slate-100 text-slate-600";
    }

    return "bg-green-100 text-green-700";
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="px-4 flex items-center justify-between">

        <div>

          <h2 className="text-xl font-semibold">
            Raw Material List
          </h2>

          <p className="text-sm text-slate-500">
            Monitor incoming material stock and usage history
          </p>

        </div>

      </div>

      {/* SEARCH */}
      <div className="px-4 flex items-center gap-4">

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
          {
            filteredData.length
          }{" "}
          of {data.length} items
        </span>

      </div>

      {/* TABLE */}
      <div className="px-4">

        <div className="bg-white rounded-xl border shadow-sm">

          <div className="overflow-x-auto max-h-[75vh]">

            <table className="w-full text-sm border-collapse">

              {/* HEADER */}
              <thead className="sticky top-0 z-20">

                <tr className="bg-slate-100 text-slate-700 border-b">

                  <th className="border px-3 py-3 min-w-[60px]">
                    No
                  </th>

                  <th className="border px-3 py-3 min-w-[240px] text-left">
                    Material Name
                  </th>

                  <th className="border px-3 py-3 min-w-[160px]">
                    Material Code
                  </th>

                  <th className="border px-3 py-3 min-w-[140px]">
                    Incoming Date
                  </th>

                  <th className="border px-3 py-3 min-w-[140px]">
                    Lot No
                  </th>

                  <th className="border px-3 py-3 min-w-[120px]">
                    Incoming Qty
                  </th>

                  <th className="border px-3 py-3 min-w-[170px]">
                    Incoming Weight
                  </th>

                  <th className="border px-3 py-3 min-w-[100px]">
                    SPQ
                  </th>

                  <th className="border px-3 py-3 min-w-[140px]">
                    Exp Date
                  </th>

                  <th className="border px-3 py-3 min-w-[120px]">
                    Status
                  </th>

                  <th className="border px-3 py-3 min-w-[120px]">
                    Warehouse
                  </th>

                  <th className="border px-3 py-3 min-w-[100px]">
                    Total Out
                  </th>

                  <th className="border px-3 py-3 min-w-[140px]">
                    Stock Balance
                  </th>

                  <th className="border px-3 py-3 min-w-[140px]">
                    Stock Weight
                  </th>

                  {/* DAILY */}
                  {days.map(
                    (day) => (

                      <th
                        key={day}
                        className="border px-3 py-3 min-w-[70px] bg-sky-100 text-sky-700"
                      >
                        {day}
                      </th>
                    )
                  )}

                </tr>

              </thead>

              {/* BODY */}
              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={50}
                      className="p-6"
                    >

                      {[...Array(10)].map(
                        (_, i) => (

                          <div
                            key={i}
                            className="h-4 bg-slate-200 rounded animate-pulse mb-2"
                          />
                        )
                      )}

                    </td>

                  </tr>

                ) : filteredData.length === 0 ? (

                  <tr>

                    <td
                      colSpan={50}
                      className="text-center py-10 text-slate-400"
                    >
                      No raw material found matching your search.
                    </td>

                  </tr>

                ) : (

                  filteredData.map(
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
                          className={`border-b transition hover:bg-slate-50 ${
                            index % 2 === 0
                              ? "bg-white"
                              : "bg-slate-50/40"
                          }`}
                        >

                          <td className="border px-3 py-3 text-center">
                            {index + 1}
                          </td>

                          <td className="border px-3 py-3 font-semibold text-red-600">
                            {
                              item
                                .rawMaterial
                                ?.materialName || "-"
                            }
                          </td>

                          <td className="border px-3 py-3 text-center font-medium">
                            {
                              item
                                .rawMaterial
                                ?.materialCode || "-"
                            }
                          </td>

                          <td className="border px-3 py-3 text-center">
                            {new Date(
                              item.incomingDate
                            ).toLocaleDateString()}
                          </td>

                          <td className="border px-3 py-3 font-medium">
                            {
                              item.lotNo
                            }
                          </td>

                          <td className="border px-3 py-3 text-center">
                            {
                              item.incomingQty
                            } Box
                          </td>

                          <td className="border px-3 py-3 text-center text-red-600 font-medium">
                            {
                              item.incomingWeight
                            } Kg
                          </td>

                          <td className="border px-3 py-3 text-center text-red-600">
                            {
                              item.spq
                            } Kg
                          </td>

                          <td className="border px-3 py-3 text-center">
                            {new Date(
                              item.expDate
                            ).toLocaleDateString()}
                          </td>

                          <td className="border px-3 py-3 text-center">

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${statusColor(
                                item.status
                              )}`}
                            >
                              {
                                item.status
                              }
                            </span>

                          </td>

                          <td className="border px-3 py-3 text-center text-red-600 font-medium">
                            {
                              item.warehouse
                            }
                          </td>

                          <td className="border px-3 py-3 text-center text-red-600 font-medium">
                            {
                              totalOut
                            } Box
                          </td>

                          <td className="border px-3 py-3 text-center">
                            {
                              item.balanceQty
                            } Box
                          </td>

                          <td className="border px-3 py-3 text-center">
                            {
                              item.balanceWeight
                            } Kg
                          </td>

                          {/* DAILY USAGE */}
                          {days.map(
                            (day) => {

                              const usage =
                                item.usages.find(
                                  (
                                    u
                                  ) => {

                                    const usageDay =
                                      new Date(
                                        u.usageDate
                                      ).getDate();

                                    return (
                                      usageDay ===
                                      day
                                    );
                                  }
                                );

                              return (

                                <td
                                  key={day}
                                  className="border px-3 py-3 text-center"
                                >
                                  {
                                    usage?.qtyUsed ??
                                    ""
                                  }
                                </td>
                              );
                            }
                          )}

                        </tr>
                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

