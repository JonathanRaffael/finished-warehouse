'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const limit = 10

  const filtered = queues.filter(q =>
    `${q.computerCode}${q.partNo}${q.productName}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / limit)

  const paginated = filtered.slice(
    (page - 1) * limit,
    page * limit
  )

  return (
    <Card className="border p-6 space-y-4">

      <div className="flex items-center justify-between">

        <h2 className="text-lg font-bold">
          🧪 QC Queue
        </h2>

        <Input
          className="max-w-sm"
          placeholder="Search code / part / product"
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />

      </div>

      <div className="overflow-x-auto border rounded-lg">

        <table className="w-full text-xs">

          <thead className="bg-slate-100">
            <tr className="text-center">
              <th className="py-3">CODE</th>
              <th>PART</th>
              <th>PRODUCT</th>
              <th>REMAINING</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>

            {paginated.length === 0 ? (

              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400">
                  No QC Queue
                </td>
              </tr>

            ) : (

              paginated.map(q => {

                const remaining =
                  q.beforeQty -
                  (q.afterQty + q.ngQty)

                return (

                  <tr
                    key={q.id}
                    className="border-b hover:bg-slate-50 text-center"
                  >

                    <td className="font-mono text-blue-600">
                      {q.computerCode}
                    </td>

                    <td>
                      {q.partNo}
                    </td>

                    <td className="text-slate-700">
                      {q.productName}
                    </td>

                    <td className="font-bold text-orange-600">

                      {remaining}

                      <div className="h-1 bg-slate-200 rounded mt-1 mx-4">

                        <div
                          className="h-1 bg-orange-500 rounded transition-all"
                          style={{
                            width: `${
                              q.beforeQty > 0
                                ? (remaining / q.beforeQty) * 100
                                : 0
                            }%`
                          }}
                        />

                      </div>

                    </td>

                    <td>

                      <Button
                        size="sm"
                        disabled={remaining <= 0}
                        onClick={() =>
                          onSelect({
                            ...q,
                            beforeQty: remaining
                          })
                        }
                      >
                        Use
                      </Button>

                    </td>

                  </tr>

                )
              })

            )}

          </tbody>

        </table>

      </div>

      {/* Pagination */}

      <div className="flex items-center justify-between pt-2">

        <p className="text-xs text-slate-500">
          Page {page} of {totalPages || 1}
        </p>

        <div className="flex gap-2">

          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>

        </div>

      </div>

    </Card>
  )
}