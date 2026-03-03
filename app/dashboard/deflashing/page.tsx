'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { DeflashingIncomingForm } from '@/components/warehouse/deflashing-incoming-form'
import { DeflashingProcessForm } from '@/components/warehouse/deflashing-process-form'

export default function DeflashingPage() {
  const [pending, setPending] = useState<any[]>([])
  const [done, setDone] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="space-y-8">

      {/* INCOMING */}
      <DeflashingIncomingForm onSuccess={fetchData} />

      {/* QUEUE */}
      <Card className="p-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-5">
          🛠️ Deflashing Queue
        </h2>

        {!loading && pending.length === 0 && (
          <p className="text-sm text-slate-400">
            No pending deflashing jobs
          </p>
        )}

        <div className="space-y-4">
          {pending.map(item => {
            const remaining = item.qtyIn - item.processedQty
            const progress =
              (item.processedQty / item.qtyIn) * 100

            return (
              <div
                key={item.id}
                className="border rounded-lg p-4 hover:shadow transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      {item.computerCode}
                    </p>
                    <p className="text-xs text-slate-500">
  Batch: {item.batchNo ?? '-'}
</p>
                  </div>

                  <button
                    onClick={() => setSelected(item)}
                    className="bg-blue-600 text-white text-xs px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    Process
                  </button>
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <p>Total: {item.qtyIn}</p>
                  <p className="text-blue-600">
                    Processed: {item.processedQty}
                  </p>
                  <p className="text-orange-600 font-medium">
                    Remaining: {remaining}
                  </p>
                </div>

                <div className="w-full bg-slate-200 rounded h-2 mt-3">
                  <div
                    className="bg-blue-600 h-2 rounded"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* PROCESS PANEL */}
      {selected && (
        <Card className="p-6 border-l-4 border-blue-600 shadow-md">
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

      {/* HISTORY WITH PARTIAL DETAIL */}
      <Card className="p-6 shadow-sm">
        <h2 className="font-semibold text-lg mb-5">
          📦 Completed History
        </h2>

        {done.length === 0 && (
          <p className="text-sm text-slate-400">
            No completed records
          </p>
        )}

        <div className="space-y-6">
          {done.map(item => (
            <div
              key={item.id}
              className="border rounded-lg p-5 bg-green-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">
                    {item.computerCode}
                  </p>
                  <p className="text-xs text-slate-500">
                    Total Incoming: {item.qtyIn}
                  </p>
                </div>

                <span className="text-xs bg-green-200 text-green-700 px-3 py-1 rounded">
                  DONE
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {item.logs?.map((log: any, index: number) => (
                  <div
                    key={log.id}
                    className="flex justify-between items-center border-b pb-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        Step {index + 1}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(log.processedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p>
                        Qty: {log.qtyOut + log.ngQty}
                      </p>
                      <p className="text-xs text-slate-500">
                        By: {log.processedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 text-sm font-medium text-green-700">
                Total Processed: {item.processedQty}
              </div>

            </div>
          ))}
        </div>
      </Card>

    </div>
  )
}