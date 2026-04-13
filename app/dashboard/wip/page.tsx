"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import WipTabs from "@/components/warehouse/WipTabs";
import WipTypeFilter from "@/components/warehouse/WipTypeFilter";
import ProductTable from "@/components/warehouse/ProductTable";
import IncomingTable from "@/components/warehouse/IncomingTable";
import OutgoingTable from "@/components/warehouse/OutgoingTable";

type Stats = {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  totalIncomingToday: number;
  totalOutgoingToday: number;
};

export default function WipPage() {
  const [view, setView] = useState<"product" | "incoming" | "outgoing">("product");
  const [type, setType] = useState<"HT" | "HK">("HT");

  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`/api/wip/stats?type=${type}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [type]);

  return (
    <div className="space-y-6">

      {/* 🔷 HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            WIP Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Work In Progress monitoring (HT / HK)
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchStats}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* 🔥 SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Products</p>
          <h2 className="text-2xl font-bold mt-1">
            {loadingStats ? "..." : stats?.totalProducts ?? 0}
          </h2>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-slate-500">Low Stock</p>
          <h2 className="text-2xl font-bold text-orange-600 mt-1">
            {loadingStats ? "..." : stats?.lowStock ?? 0}
          </h2>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-slate-500">Out of Stock</p>
          <h2 className="text-2xl font-bold text-red-600 mt-1">
            {loadingStats ? "..." : stats?.outOfStock ?? 0}
          </h2>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-slate-500">Incoming Today</p>
          <h2 className="text-2xl font-bold text-green-600 mt-1">
            {loadingStats ? "..." : stats?.totalIncomingToday ?? 0}
          </h2>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-slate-500">Outgoing Today</p>
          <h2 className="text-2xl font-bold text-red-500 mt-1">
            {loadingStats ? "..." : stats?.totalOutgoingToday ?? 0}
          </h2>
        </Card>

      </div>

      {/* 🔷 CONTROL PANEL */}
      <Card className="p-4 flex flex-col gap-4 border shadow-sm">

        <div className="flex flex-wrap gap-3 items-center justify-between">

          <WipTabs view={view} setView={setView} />

          <div className="flex gap-3 items-center">

            <WipTypeFilter type={type} setType={setType} />

            <input
              placeholder="Quick search..."
              className="border px-3 py-2 rounded-lg text-sm w-[200px] focus:ring-2 focus:ring-blue-500 outline-none"
            />

          </div>

        </div>

      </Card>

      {/* 🔷 TABLE */}
      <Card className="border shadow-sm overflow-hidden">

        <div className="overflow-x-auto max-h-[70vh]">

          {view === "product" && <ProductTable type={type} />}
          {view === "incoming" && <IncomingTable type={type} />}
          {view === "outgoing" && <OutgoingTable type={type} />}

        </div>

      </Card>

    </div>
  );
}