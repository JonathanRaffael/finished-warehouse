'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DeflashingIncomingForm } from '@/components/warehouse/deflashing-incoming-form'
import { DeflashingProcessForm } from '@/components/warehouse/deflashing-process-form'

const ITEMS_PER_PAGE = 10

export default function DeflashingPage() {

  const [pending, setPending] = useState<any[]>([])
  const [done, setDone] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  const [searchQueue, setSearchQueue] = useState('')
  const [searchHistory, setSearchHistory] = useState('')

  const [queuePage, setQueuePage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/deflashing', { cache: 'no-store' })
      const data = await res.json()

      setPending(data.pending || [])
      setDone(data.done || [])

    } catch (error) {
      console.error('[FETCH DEFLASHING ERROR]', error)
      setPending([])
      setDone([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ================= FILTER =================

  const filteredQueue = useMemo(() => {
    return pending.filter(item =>
      item.computerCode?.toLowerCase().includes(searchQueue.toLowerCase()) ||
      item.batchNo?.toLowerCase().includes(searchQueue.toLowerCase()) ||
      item.partNo?.toLowerCase().includes(searchQueue.toLowerCase()) ||
      item.productName?.toLowerCase().includes(searchQueue.toLowerCase())
    )
  }, [pending, searchQueue])

  const filteredHistory = useMemo(() => {
  return done.filter(log =>
    log.deflashing?.computerCode?.toLowerCase().includes(searchHistory.toLowerCase()) ||
    log.deflashing?.partNo?.toLowerCase().includes(searchHistory.toLowerCase()) ||
    log.deflashing?.productName?.toLowerCase().includes(searchHistory.toLowerCase()) ||
    log.batchNo?.toLowerCase().includes(searchHistory.toLowerCase()) ||
    log.processedBy?.toLowerCase().includes(searchHistory.toLowerCase())
  )
}, [done, searchHistory])
  // ================= PAGINATION =================

  const paginatedQueue = useMemo(() => {
    const start = (queuePage - 1) * ITEMS_PER_PAGE
    return filteredQueue.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredQueue, queuePage])

  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * ITEMS_PER_PAGE
    return filteredHistory.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredHistory, historyPage])

  const totalQueuePages = Math.ceil(filteredQueue.length / ITEMS_PER_PAGE)
  const totalHistoryPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE)

  return (
    <div className="space-y-8">

      {/* INCOMING */}
      <DeflashingIncomingForm onSuccess={fetchData} />

      {/* ================= QUEUE ================= */}
      <Card className="p-6 space-y-4 border">

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">🛠️ Deflashing Queue</h2>

          <Input
            placeholder="Search code / part / product..."
            className="w-64"
            value={searchQueue}
            onChange={(e) => {
              setSearchQueue(e.target.value)
              setQueuePage(1)
            }}
          />
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">

            <thead className="bg-slate-100">
              <tr className="text-center">
                <th className="py-3 px-4">CODE</th>
                <th className="px-4">PART NO</th>
                <th className="px-4">PRODUCT NAME</th>
                <th className="px-4">BATCH</th>
                <th className="px-4">TOTAL</th>
                <th className="px-4">PROCESSED</th>
                <th className="px-4">REMAINING</th>
                <th className="px-4">ACTION</th>
              </tr>
            </thead>

            <tbody>

              {!loading && paginatedQueue.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No pending deflashing jobs
                  </td>
                </tr>
              )}

              {paginatedQueue.map(item => {

                const remaining = item.qtyIn - item.processedQty

                return (
                  <tr key={item.id} className="border-b hover:bg-slate-50 text-center">

                    <td className="px-4 py-2 font-mono text-blue-600">
                      {item.computerCode}
                    </td>

                    <td className="px-4 py-2">
                      {item.partNo}
                    </td>

                    <td className="px-4 py-2">
                      {item.productName}
                    </td>

                    <td className="px-4 py-2">
                      {item.batchNo ?? '-'}
                    </td>

                    <td className="px-4 py-2">{item.qtyIn}</td>

                    <td className="px-4 py-2 text-blue-600 font-semibold">
                      {item.processedQty}
                    </td>

                    <td className="px-4 py-2 text-orange-600 font-bold">
                      {remaining}
                    </td>

                    <td className="px-4 py-2">
                      <Button size="sm" onClick={() => setSelected(item)}>
                        Process
                      </Button>
                    </td>

                  </tr>
                )
              })}

            </tbody>

          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">
            Page {queuePage} of {totalQueuePages || 1}
          </span>

          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={queuePage === 1}
              onClick={() => setQueuePage(prev => prev - 1)}
            >
              Previous
            </Button>

            <Button
              size="sm"
              disabled={queuePage === totalQueuePages}
              onClick={() => setQueuePage(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>

      </Card>

      {/* PROCESS PANEL */}
      {selected && (
        <Card className="p-6 border-l-4 border-blue-600">
          <h2 className="text-lg font-semibold mb-4">
            ⚙️ Processing Panel
          </h2>

          <DeflashingProcessForm
            data={selected}
            onSuccess={() => {
              setSelected(null)
              fetchData()
            }}
          />
        </Card>
      )}

      {/* ================= HISTORY ================= */}
      <Card className="p-6 space-y-4 border">

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">📦 Deflashing History</h2>

          <Input
            placeholder="Search anything..."
            className="w-64"
            value={searchHistory}
            onChange={(e) => {
              setSearchHistory(e.target.value)
              setHistoryPage(1)
            }}
          />
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">

            <thead className="bg-slate-100">
              <tr className="text-center">
                <th className="py-3 px-4">DATE</th>
                <th className="px-4">TIME</th>
                <th className="px-4">CODE</th>
                <th className="px-4">PART NO</th>
                <th className="px-4">PRODUCT</th>
                <th className="px-4">BATCH</th>
                <th className="px-4 text-green-600">OK</th>
                <th className="px-4 text-red-600">NG</th>
                <th className="px-4">TOTAL</th>
                <th className="px-4">NG %</th>
                <th className="px-4">OPERATOR</th>
              </tr>
            </thead>

            <tbody>

              {paginatedHistory.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-slate-400">
                    No history
                  </td>
                </tr>
              )}

              {paginatedHistory.map((log: any) => {

                const ok = log.qtyOut
                const ng = log.ngQty
                const total = ok + ng
                const ngRate = total > 0 ? ((ng / total) * 100).toFixed(1) : "0"

                const date = new Date(log.processedAt)

                return (
                  <tr key={log.id} className="border-b hover:bg-slate-50 text-center">

  <td>{date.toLocaleDateString()}</td>

  <td className="text-xs text-slate-500">
    {date.toLocaleTimeString()}
  </td>

  <td className="font-mono text-blue-600">
    {log.deflashing?.computerCode}
  </td>

  <td>
    {log.deflashing?.partNo}
  </td>

  <td>
    {log.deflashing?.productName}
  </td>

  <td>
    {log.batchNo ?? '-'}
  </td>

  <td className="text-green-600 font-bold">
    {ok}
  </td>

  <td className="text-red-600 font-bold">
    {ng}
  </td>

  <td className="font-semibold">
    {total}
  </td>

                    <td>
                      <span className={`px-2 py-1 rounded text-xs font-semibold
                        ${Number(ngRate) > 5
                          ? "bg-red-200 text-red-700"
                          : Number(ngRate) > 2
                          ? "bg-yellow-200 text-yellow-700"
                          : "bg-green-200 text-green-700"
                        }`}>
                        {ngRate} %
                      </span>
                    </td>

                    <td className="text-xs text-slate-600">
                      {log.processedBy}
                    </td>

                  </tr>
                )
              })}

            </tbody>

          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">
            Page {historyPage} of {totalHistoryPages || 1}
          </span>

          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={historyPage === 1}
              onClick={() => setHistoryPage(prev => prev - 1)}
            >
              Previous
            </Button>

            <Button
              size="sm"
              disabled={historyPage === totalHistoryPages}
              onClick={() => setHistoryPage(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>

      </Card>

    </div>
  )
}