"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";

import RawMaterialTabs from "@/components/warehouse/RawMaterialTabs";

import RawMaterialTable from "@/components/warehouse/rawmaterial-table";

import RawMaterialIncoming from "@/components/warehouse/rawmaterial-incoming";

import RawMaterialMaster from "@/components/warehouse/rawmaterial-master";

import RawMaterialUsage from "@/components/warehouse/rawmaterial-usage";

type ViewType =
  | "monitoring"
  | "incoming"
  | "usage"
  | "master";

type Stats = {
  totalMaterials: number;

  totalBatches: number;

  lowStock: number;

  expired: number;

  nearExpired: number;

  incomingToday: number;

  emptyStock: number;

  totalUsageToday: number;
};

export default function RawMaterialPage() {

  const [view, setView] =
    useState<ViewType>(
      "monitoring"
    );

  const [stats, setStats] =
    useState<Stats | null>(
      null
    );

  const [loadingStats, setLoadingStats] =
    useState(false);

  /* ================= FETCH STATS ================= */

  const fetchStats =
    async () => {

      try {

        setLoadingStats(true);

        const response =
          await fetch(
            "/api/raw-material/stats"
          );

        if (!response.ok) {

          throw new Error(
            "Failed to fetch stats"
          );
        }

        const data =
          await response.json();

        setStats(data);

      } catch (error) {

        console.error(
          "[RAW_MATERIAL_STATS_ERROR]",
          error
        );

      } finally {

        setLoadingStats(false);
      }
    };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold text-slate-900">
            Raw Material Dashboard
          </h1>

          <p className="text-sm text-slate-500">
            Warehouse raw material
            monitoring & stock
            management system
          </p>

        </div>

        <button
          onClick={fetchStats}
          className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50 transition"
        >
          Refresh
        </button>

      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-8 gap-4">

        {/* TOTAL MATERIAL */}
        <Card className="p-4">

          <p className="text-sm text-slate-500">
            Total Materials
          </p>

          <h2 className="text-2xl font-bold mt-1">
            {loadingStats
              ? "..."
              : stats?.totalMaterials ?? 0}
          </h2>

        </Card>

        {/* TOTAL BATCH */}
        <Card className="p-4">

          <p className="text-sm text-slate-500">
            Total Batches
          </p>

          <h2 className="text-2xl font-bold mt-1">
            {loadingStats
              ? "..."
              : stats?.totalBatches ?? 0}
          </h2>

        </Card>

        {/* LOW STOCK */}
        <Card className="p-4">

          <p className="text-sm text-slate-500">
            Low Stock
          </p>

          <h2 className="text-2xl font-bold text-orange-600 mt-1">
            {loadingStats
              ? "..."
              : stats?.lowStock ?? 0}
          </h2>

        </Card>

        {/* EMPTY STOCK */}
        <Card className="p-4">

          <p className="text-sm text-slate-500">
            Empty Stock
          </p>

          <h2 className="text-2xl font-bold text-slate-700 mt-1">
            {loadingStats
              ? "..."
              : stats?.emptyStock ?? 0}
          </h2>

        </Card>

        {/* EXPIRED */}
        <Card className="p-4">

          <p className="text-sm text-slate-500">
            Expired
          </p>

          <h2 className="text-2xl font-bold text-red-600 mt-1">
            {loadingStats
              ? "..."
              : stats?.expired ?? 0}
          </h2>

        </Card>

        {/* NEAR EXPIRED */}
        <Card className="p-4">

          <p className="text-sm text-slate-500">
            Near Expired
          </p>

          <h2 className="text-2xl font-bold text-yellow-500 mt-1">
            {loadingStats
              ? "..."
              : stats?.nearExpired ?? 0}
          </h2>

        </Card>

        {/* INCOMING TODAY */}
        <Card className="p-4">

          <p className="text-sm text-slate-500">
            Incoming Today
          </p>

          <h2 className="text-2xl font-bold text-green-600 mt-1">
            {loadingStats
              ? "..."
              : stats?.incomingToday ?? 0}
          </h2>

        </Card>

        {/* USAGE TODAY */}
        <Card className="p-4">

          <p className="text-sm text-slate-500">
            Usage Today
          </p>

          <h2 className="text-2xl font-bold text-blue-600 mt-1">
            {loadingStats
              ? "..."
              : stats?.totalUsageToday ?? 0}
          </h2>

        </Card>

      </div>

      {/* ================= CONTROL PANEL ================= */}
      <Card className="p-4 border shadow-sm">

        <RawMaterialTabs
          view={view}
          setView={setView}
        />

      </Card>

      {/* ================= CONTENT ================= */}
      <Card className="border shadow-sm overflow-hidden">

        <div className="overflow-x-auto max-h-[80vh]">

          {/* MONITORING */}
          {view ===
            "monitoring" && (
            <RawMaterialTable />
          )}

          {/* MASTER MATERIAL */}
          {view ===
            "master" && (
            <div className="p-6">
              <RawMaterialMaster />
            </div>
          )}

          {/* INCOMING MATERIAL */}
          {view ===
            "incoming" && (
            <div className="p-6">
              <RawMaterialIncoming />
            </div>
          )}

          {/* MATERIAL USAGE */}
          {view ===
            "usage" && (
            <div className="p-6">
              <RawMaterialUsage />
            </div>
          )}

        </div>

      </Card>

    </div>
  );
}