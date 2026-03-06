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
          📦 Completed History
        </h2>

        <div className="overflow-x-auto border rounded-lg">

          <table className="w-full text-sm">

            <thead className="bg-slate-100">

              <tr className="text-center">
                <th className="py-3 px-4">CODE</th>
                <th className="px-4">TOTAL</th>
                <th className="px-4">PROCESSED</th>
                <th className="px-4">STATUS</th>
              </tr>

            </thead>

            <tbody>

              {done.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400">
                    No completed records
                  </td>
                </tr>
              )}

              {done.map(item => (

                <tr
                  key={item.id}
                  className="border-b hover:bg-slate-50 text-center"
                >

                  <td className="px-4 py-2 font-mono text-blue-600">
                    {item.computerCode}
                  </td>

                  <td className="px-4 py-2">
                    {item.qtyIn}
                  </td>

                  <td className="px-4 py-2 text-green-600 font-bold">
                    {item.processedQty}
                  </td>

                  <td className="px-4 py-2">

                    <span className="text-xs bg-green-200 text-green-700 px-3 py-1 rounded">
                      DONE
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </Card>

    </div>

  )

}