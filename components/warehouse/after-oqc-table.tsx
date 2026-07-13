'use client'

import { useState, Fragment } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Transaction {
  id: string
  createdAt: string
  okQty: number
  ngQty: number
  looseQty?: number
  bufferQty: number
  otherQty?: number
  responsiblePerson: string | null
  afterOQC: {
    id: string
    computerCode: string
    partNo: string
    productName: string
    batch?: number | string
    source?: 'INCOMING' | 'DEFLASHING'
    incoming?: {
      batch?: number
    }
  }
}

interface Props {
  transactions: Transaction[]
  title?: string
}

export function AfterOQCTable({ transactions, title }: Props) {

  const [search, setSearch] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const limit = 10

  /* ================= HELPER ================= */

  const getSource = (s?: string) => (s || 'INCOMING').toUpperCase()

  /* ================= SORT ================= */

  const sortedTransactions = [...transactions].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime()
  )

  /* ================= GROUP ================= */

  const grouped = Object.values(
    sortedTransactions.reduce((acc: any, row) => {

      const source = getSource(row.afterOQC.source)

      const batchValue =
        row.afterOQC.batch ??
        row.afterOQC.incoming?.batch ??
        '-'

      const queueId = `${row.afterOQC.id}-${source}-${batchValue}`

      if (!acc[queueId]) {
        acc[queueId] = {
          id: queueId,
          computerCode: row.afterOQC.computerCode,
          partNo: row.afterOQC.partNo,
          productName: row.afterOQC.productName,
          batch: batchValue,
          source,
          history: [],
          after: 0,
          ng: 0,
          loose: 0,
          buffer: 0,
          other: 0
        }
      }

      acc[queueId].history.push(row)

      acc[queueId].after += row.okQty || 0
      acc[queueId].ng += row.ngQty || 0
      acc[queueId].loose += row.looseQty || 0
      acc[queueId].buffer += row.bufferQty || 0
      acc[queueId].other += row.otherQty || 0

      return acc

    }, {})
  )
  .map((group: any) => {

    group.history.sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    )

    return group

  })
  .filter(
    (r: any) =>
      r.computerCode.toLowerCase().includes(search.toLowerCase()) ||
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.partNo.toLowerCase().includes(search.toLowerCase())
  )

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(grouped.length / limit)

  const paginated = grouped.slice(
    (page - 1) * limit,
    page * limit
  )

  return (

    <Card className="border p-6 space-y-4">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-bold">
          {title || 'QC History'}
        </h2>

        <Input
          placeholder="Search code / part / product..."
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-sm"
        />

      </div>

      {/* TABLE */}

      <div className="overflow-x-auto border rounded-lg">

        <table className="w-full text-sm">

          <thead className="bg-slate-100">

            <tr className="text-center">
              <th className="py-3 px-4">CODE</th>
              <th className="px-4">PART</th>
              <th className="px-4">PRODUCT</th>
              <th className="px-4">BATCH</th>
              <th className="px-4">SOURCE</th>
              <th className="px-4">IN</th>
              <th className="px-4">OK</th>
              <th className="px-4">NG</th>
              <th className="px-4">LOOSE</th>
              <th className="px-4">BUFFER</th>
              <th className="px-4">OTHER</th>
              <th className="px-4">STOCK</th>
            </tr>

          </thead>

          <tbody>

            {paginated.length === 0 ? (

              <tr>
                <td colSpan={12} className="text-center py-10 text-slate-400">
                  No QC history
                </td>
              </tr>

            ) : (

              paginated.map((row: any) => {

                const totalIn =
  row.after +
  row.ng +
  row.loose +
  row.buffer +
  row.other
                const isDeflashing = row.source === 'DEFLASHING'

                return (

                  <Fragment key={row.id}>

                    <tr className={`border-b text-center hover:bg-slate-50 ${isDeflashing ? 'bg-orange-50' : ''}`}>

                      <td className="px-4 py-2 font-mono text-blue-600">
                        {row.computerCode}
                      </td>

                      <td className="px-4 py-2">
                        {row.partNo}
                      </td>

                      <td className="px-4 py-2 text-slate-700">
                        {row.productName}
                      </td>

                      <td className="px-4 py-2 font-semibold text-purple-600">
                        {row.batch}
                      </td>

                      <td className="px-4 py-2 text-xs">
                        {isDeflashing ? '🔧 DEFLASHING' : '📦 INCOMING'}
                      </td>

                      <td className="px-4 py-2">
                        {totalIn}
                      </td>

                      <td className="px-4 py-2 font-bold text-green-600">
                        {row.after}
                      </td>

                      <td className="px-4 py-2 font-bold text-red-600">
                        {row.ng}
                      </td>

                      <td className="px-4 py-2 font-bold text-orange-600">
                        {row.loose}
                      </td>

                      <td className="px-4 py-2">
                        {row.buffer}
                      </td>

                      <td className="px-4 py-2 font-bold text-purple-600">
                        {row.other}
                      </td>

                      <td
                        className="px-4 py-2 font-bold text-blue-600 cursor-pointer hover:underline"
                        onClick={() =>
                          setOpen(open === row.id ? null : row.id)
                        }
                      >
                        {row.after + row.buffer + row.other}
                      </td>

                    </tr>

                    {open === row.id && (

                      <tr>

                        <td colSpan={12} className="bg-slate-50 px-8 py-4">

                          <p className="font-semibold mb-3 text-slate-600">
                            Inspection History
                          </p>

                          <table className="w-full text-xs border rounded">

                            <thead className="bg-slate-200">

                              <tr>
                                <th className="border px-3 py-2">DATE</th>
                                <th className="border px-3 py-2">IN</th>
                                <th className="border px-3 py-2">OK</th>
                                <th className="border px-3 py-2">NG</th>
                                <th className="border px-3 py-2">LOOSE</th>
                                <th className="border px-3 py-2">BUFFER</th>
                                <th className="border px-3 py-2">OTHER</th>
                                <th className="border px-3 py-2">QC BY</th>
                              </tr>

                            </thead>

                            <tbody>

                              {row.history.map((h: any) => (

                                <tr key={h.id} className="text-center">

                                  <td className="border px-3 py-2">
                                    {new Date(h.createdAt).toLocaleString()}
                                  </td>

                                  <td className="border px-3 py-2">
                                    {(h.okQty || 0) +
 (h.ngQty || 0) +
 (h.looseQty || 0) +
 (h.bufferQty || 0) +
 (h.otherQty || 0) }
                                  </td>

                                  <td className="border px-3 py-2 text-green-600">
                                    {h.okQty}
                                  </td>

                                  <td className="border px-3 py-2 text-red-600">
                                    {h.ngQty}
                                  </td>

                                  <td className="border px-3 py-2 text-orange-600">
                                    {h.looseQty || 0}
                                  </td>

                                  <td className="border px-3 py-2">
                                    {h.bufferQty}
                                  </td>

                                  <td className="border px-3 py-2 text-purple-600">
                                    {h.otherQty || 0}
                                  </td>

                                  <td className="border px-3 py-2">
                                    {h.responsiblePerson}
                                  </td>

                                </tr>

                              ))}

                            </tbody>

                          </table>

                        </td>

                      </tr>

                    )}

                  </Fragment>

                )

              })

            )}

          </tbody>

        </table>

      </div>

      {/* PAGINATION */}

      <div className="flex items-center justify-between pt-2">

        <p className="text-sm text-slate-500">
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