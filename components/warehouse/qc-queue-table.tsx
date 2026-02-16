'use client'

import { Card } from '@/components/ui/card'

interface QueueItem {
  id: string
  computerCode: string
  partNo: string
  productName: string
  beforeQty: number
  afterQty: number
  ngQty: number
  spareQty: number
}

export function QCQueueTable({
  queues,
  onSelect
}: {
  queues: QueueItem[]
  onSelect: (q: QueueItem) => void
}) {
  return (
    <Card className="border p-4">
      <h2 className="font-bold mb-3">QC Queue</h2>

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-slate-100">
            <th className="border px-2 py-1">CODE</th>
            <th className="border px-2 py-1">PART</th>
            <th className="border px-2 py-1">PRODUCT</th>
            <th className="border px-2 py-1">REMAINING</th>
            <th className="border px-2 py-1"></th>
          </tr>
        </thead>

        <tbody>
          {queues.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-6 text-slate-400">
                No QC Queue
              </td>
            </tr>
          ) : (
            queues.map(q => {
              // remaining = before - OK - NG (spare tidak habiskan queue)
              const remaining =
                q.beforeQty -
                (q.afterQty + q.ngQty)

              return (
                <tr key={q.id}>
                  <td className="border px-2 py-1 font-mono">{q.computerCode}</td>
                  <td className="border px-2 py-1">{q.partNo}</td>
                  <td className="border px-2 py-1">{q.productName}</td>

                  <td className="border px-2 py-1 font-bold text-orange-600">
                    {remaining}
                  </td>

                  <td className="border px-2 py-1">
                    <button
                      disabled={remaining <= 0}
                      onClick={() => {
                        // override beforeQty jadi remaining
                        onSelect({
                          ...q,
                          beforeQty: remaining
                        })
                      }}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
                    >
                      Use
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </Card>
  )
}