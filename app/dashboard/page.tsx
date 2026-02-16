'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type ProductionType = 'HT' | 'HK';

interface DashboardItem {
  computerCode: string;
  partNo: string;
  productName: string;
  productionType: ProductionType;
  location?: string;

  initialStock: number;

  totalIncoming: number;
  totalAfterOQC: number;
  totalOutgoing: number;

  // ✅ Updated field
  totalDeflashing: number;
  totalDeflashingQty: number;
  totalDeflashingNG: number;

  finalStock: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [prodFilter, setProdFilter] = useState<'ALL' | ProductionType>('ALL');

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setData([]);
      }
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    return data.filter((i) => {
      const s =
        i.computerCode.toLowerCase().includes(search.toLowerCase()) ||
        i.partNo.toLowerCase().includes(search.toLowerCase()) ||
        i.productName.toLowerCase().includes(search.toLowerCase());

      const p = prodFilter === 'ALL' || i.productionType === prodFilter;

      return s && p;
    });
  }, [data, search, prodFilter]);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    return {
      sku: filtered.length,
      incoming: filtered.reduce(
        (a, b) => a + (b.totalIncoming || 0),
        0
      ),
      afterOqc: filtered.reduce(
        (a, b) => a + (b.totalAfterOQC || 0),
        0
      ),
      deflashing: filtered.reduce(
        (a, b) => a + (b.totalDeflashingQty || 0),
        0
      ),
      outgoing: filtered.reduce(
        (a, b) => a + (b.totalOutgoing || 0),
        0
      ),
    };
  }, [filtered]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Inventory Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          PT Hang Tong Manufactory · Real-time stock monitoring
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

        <Card className="p-4">
          <p className="text-xs text-slate-500">Total SKU</p>
          <h2 className="text-2xl font-bold">{stats.sku}</h2>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-slate-500">Incoming</p>
          <h2 className="text-2xl font-bold text-green-600">
            {stats.incoming}
          </h2>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-slate-500">After OQC</p>
          <h2 className="text-2xl font-bold text-yellow-600">
            {stats.afterOqc}
          </h2>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-slate-500">Deflashing</p>
          <h2 className="text-2xl font-bold text-blue-600">
            {stats.deflashing}
          </h2>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-slate-500">Outgoing</p>
          <h2 className="text-2xl font-bold text-red-600">
            {stats.outgoing}
          </h2>
        </Card>

      </div>

      {/* Controls */}
      <Card className="p-4 flex flex-wrap gap-4 items-center border">

        <Input
          placeholder="Search code / part / product"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <select
          value={prodFilter}
          onChange={(e) => setProdFilter(e.target.value as any)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="ALL">ALL</option>
          <option value="HT">HT</option>
          <option value="HK">HK</option>
        </select>

        <span className="text-xs text-slate-500 ml-auto">
          {filtered.length} items
        </span>

      </Card>

      {/* Table */}
      <Card className="border overflow-hidden shadow-sm">

        <div className="overflow-x-auto max-h-[70vh]">

          <table className="w-full text-xs border-collapse">

            <thead className="sticky top-0 bg-slate-100 border-b">
              <tr>
                {[
                  'COMPUTER CODE',
                  'PART NO',
                  'PRODUCT NAME',
                  'PROD',
                  'LOC',
                  'INITIAL',
                  'INCOMING',
                  'AFTER OQC',
                  'DEFLASHING',
                  'OUTGOING',
                  'FINAL STOCK',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left uppercase tracking-wide text-[11px] text-slate-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-500">
                    Loading dashboard...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400">
                    No data found
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr
                    key={r.computerCode}
                    className={`border-b hover:bg-blue-50 transition ${
                      i % 2 ? 'bg-slate-50/50' : ''
                    }`}
                  >
                    <td className="px-3 py-2 font-mono text-blue-700">
                      {r.computerCode}
                    </td>

                    <td className="px-3 py-2">{r.partNo}</td>

                    <td className="px-3 py-2">{r.productName}</td>

                    <td className="px-3 py-2">
                      <span className="px-2 py-[2px] rounded bg-blue-100 text-blue-700 text-[10px] font-semibold">
                        {r.productionType}
                      </span>
                    </td>

                    <td className="px-3 py-2">{r.location || '-'}</td>

                    <td className="px-3 py-2 tabular-nums">
                      {r.initialStock}
                    </td>

                    <td className="px-3 py-2 tabular-nums text-green-700">
                      {r.totalIncoming}
                    </td>

                    <td className="px-3 py-2 tabular-nums bg-yellow-100">
                      {r.totalAfterOQC}
                    </td>

                    <td className="px-3 py-2 tabular-nums bg-blue-100 text-blue-700">
                      {r.totalDeflashingQty}
                    </td>

                    <td className="px-3 py-2 tabular-nums text-red-600">
                      {r.totalOutgoing}
                    </td>

                    <td className="px-3 py-2 tabular-nums font-bold bg-green-100">
                      {r.finalStock}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>

        </div>

      </Card>

    </div>
  );
}
