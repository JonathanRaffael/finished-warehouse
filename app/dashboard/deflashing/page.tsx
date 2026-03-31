'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

      <Card className="p-6 space-y-4 border">

        <h2 className="text-lg font-bold">
          🛠️ Deflashing Queue
        </h2>

        <div className="overflow-x-auto border rounded-lg">

          <table className="w-full text-sm">

            <thead className="bg-slate-100">

              <tr className="text-center">
                <th className="py-3 px-4">CODE</th>
                <th className="px-4">BATCH</th>
                <th className="px-4">TOTAL</th>
                <th className="px-4">PROCESSED</th>
                <th className="px-4">REMAINING</th>
                <th className="px-4">ACTION</th>
              </tr>

            </thead>

            <tbody>

              {!loading && pending.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No pending deflashing jobs
                  </td>
                </tr>
              )}

              {pending.map(item => {

                const remaining = item.qtyIn - item.processedQty

                return (

                  <tr
                    key={item.id}
                    className="border-b hover:bg-slate-50 text-center"
                  >

                    <td className="px-4 py-2 font-mono text-blue-600">
                      {item.computerCode}
                    </td>

                    <td className="px-4 py-2">
                      {item.batchNo ?? '-'}
                    </td>

                    <td className="px-4 py-2">
                      {item.qtyIn}
                    </td>

                    <td className="px-4 py-2 text-blue-600 font-semibold">
                      {item.processedQty}
                    </td>

                    <td className="px-4 py-2 text-orange-600 font-bold">
                      {remaining}
                    </td>

                    <td className="px-4 py-2">

                      <Button
                        size="sm"
                        onClick={() => setSelected(item)}
                      >
                        Process
                      </Button>

                    </td>

                  </tr>

                )

              })}

            </tbody>

          </table>

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

      {/* HISTORY */}

<Card className="p-6 space-y-4 border">

  <h2 className="text-lg font-bold">
    📦 Deflashing History
  </h2>

  <div className="overflow-x-auto border rounded-lg">

    <table className="w-full text-sm">

      <thead className="bg-slate-100">

        <tr className="text-center">
          <th className="py-3 px-4">DATE</th>
          <th className="px-4">TIME</th>
          <th className="px-4">CODE</th>
          <th className="px-4">BATCH</th>
          <th className="px-4 text-green-600">OK</th>
          <th className="px-4 text-red-600">NG</th>
          <th className="px-4">TOTAL</th>
          <th className="px-4">NG %</th>
          <th className="px-4">OPERATOR</th>
        </tr>

      </thead>

      <tbody>

        {done.length === 0 && (
          <tr>
            <td colSpan={9} className="text-center py-10 text-slate-400">
              No history
            </td>
          </tr>
        )}

        {done.map((log: any) => {

          const ok = log.qtyOut
          const ng = log.ngQty
          const total = ok + ng

          const ngRate =
            total > 0 ? ((ng / total) * 100).toFixed(1) : "0"

          const date = new Date(log.processedAt)

          return (

            <tr
              key={log.id}
              className="border-b hover:bg-slate-50 text-center"
            >

              <td className="px-4 py-2">
                {date.toLocaleDateString()}
              </td>

              <td className="px-4 py-2 text-xs text-slate-500">
                {date.toLocaleTimeString()}
              </td>

              <td className="px-4 py-2 font-mono text-blue-600">
                {log.computerCode}
              </td>

              <td className="px-4 py-2">
                {log.batchNo ?? '-'}
              </td>

              <td className="px-4 py-2 text-green-600 font-bold">
                {ok}
              </td>

              <td className="px-4 py-2 text-red-600 font-bold">
                {ng}
              </td>

              <td className="px-4 py-2 font-semibold">
                {total}
              </td>

              <td className="px-4 py-2">

                <span
                  className={`px-2 py-1 rounded text-xs font-semibold
                  ${
                    Number(ngRate) > 5
                      ? "bg-red-200 text-red-700"
                      : Number(ngRate) > 2
                      ? "bg-yellow-200 text-yellow-700"
                      : "bg-green-200 text-green-700"
                  }`}
                >
                  {ngRate} %
                </span>

              </td>

              <td className="px-4 py-2 text-xs text-slate-600">
                {log.processedBy}
              </td>

            </tr>

          )

        })}

      </tbody>

    </table>

  </div>

</Card>

    </div>

  )

}