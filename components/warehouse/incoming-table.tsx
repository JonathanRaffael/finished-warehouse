'use client'

import { useState, Fragment } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface OutgoingHistory {
  id: string
  qtyOut: number
  createdAt: string
  responsiblePerson: string
}

interface Transaction {
  id: string
  date: string
  computerCode: string
  partNo: string
  productName: string
  incomingQty: number
  remainingQty: number
  responsiblePerson: string
  batch: number
  status: string
  outgoingTransactions?: OutgoingHistory[]
}

interface IncomingTableProps {
  transactions: Transaction[]
  onSelect?: (tx: Transaction) => void
  hideAction?: boolean
}

export function IncomingTable({
  transactions,
  onSelect,
  hideAction = false
}: IncomingTableProps) {

  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQty, setEditQty] = useState<number>(0)

  const [page, setPage] = useState(1)
  const limit = 10

  const startEdit = (tx: Transaction) => {
    setEditingId(tx.id)
    setEditQty(tx.incomingQty)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = (tx: Transaction) => {
    console.log('Update Incoming Qty', {
      id: tx.id,
      newQty: editQty
    })

    setEditingId(null)
  }

  const filtered = [...transactions]
    .sort((a, b) => a.id.localeCompare(b.id))
    .filter(tx =>
      `${tx.computerCode}${tx.partNo}${tx.productName}`
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

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-bold">
            {hideAction ? '📦 Incoming History' : '📥 Incoming Queue'}
          </h2>

          {!hideAction && (
            <p className="text-xs text-slate-500">
              Click OUT to release stock → QC
            </p>
          )}
        </div>

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

      {/* TABLE */}

      <div className="overflow-x-auto border rounded-lg">

        <table className="w-full text-xs">

          <thead className="bg-slate-100">

            <tr className="text-center">

              <th className="py-3">DATE</th>
              <th>CODE</th>
              <th>PART</th>
              <th>PRODUCT</th>
              <th>BATCH</th>
              <th>IN</th>
              <th>REM</th>
              <th>STATUS</th>

              {!hideAction && <th>ACTION</th>}

            </tr>

          </thead>

          <tbody>

            {paginated.length === 0 ? (

              <tr>
                <td
                  colSpan={hideAction ? 8 : 9}
                  className="py-10 text-center text-slate-400"
                >
                  No incoming data
                </td>
              </tr>

            ) : (

              paginated.map(tx => {

                const percent =
                  tx.incomingQty > 0
                    ? (tx.remainingQty / tx.incomingQty) * 100
                    : 0

                return (

                  <Fragment key={tx.id}>

                    <tr className="border-b hover:bg-slate-50 text-center">

                      <td>
                        {new Date(tx.date).toLocaleDateString('id-ID')}
                      </td>

                      <td className="font-mono text-blue-600">
                        {tx.computerCode}
                      </td>

                      <td>{tx.partNo}</td>

                      <td className="text-slate-700">
                        {tx.productName}
                      </td>

                      <td className="font-semibold text-purple-600">
                        {tx.batch || '-'}
                      </td>

                      <td className="font-bold text-green-600">

                        {editingId === tx.id ? (

                          <Input
                            type="number"
                            value={editQty}
                            onChange={e => setEditQty(Number(e.target.value))}
                            className="w-20 mx-auto text-center"
                          />

                        ) : (
                          tx.incomingQty
                        )}

                      </td>

                      <td className="font-bold text-orange-600">

                        {tx.remainingQty}

                        <div className="h-1 bg-slate-200 rounded mt-1 mx-4">
                          <div
                            className="h-1 bg-orange-500 rounded transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                      </td>

                      <td>

                        <span
                          className={`px-2 py-1 text-[10px] rounded ${
                            tx.status === 'OPEN'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {tx.status}
                        </span>

                      </td>

                      {!hideAction && (

                        <td>

                          <div className="flex justify-center gap-2">

                            {editingId === tx.id ? (

                              <>
                                <Button size="sm" onClick={() => saveEdit(tx)}>
                                  Save
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEdit}
                                >
                                  Cancel
                                </Button>
                              </>

                            ) : (

                              <>
                                <Button
                                  size="sm"
                                  disabled={tx.remainingQty <= 0}
                                  onClick={() => onSelect?.(tx)}
                                >
                                  OUT
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setExpandedId(
                                      expandedId === tx.id ? null : tx.id
                                    )
                                  }
                                >
                                  History
                                </Button>

                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => startEdit(tx)}
                                >
                                  Edit
                                </Button>
                              </>

                            )}

                          </div>

                        </td>

                      )}

                    </tr>

                    {/* OUTGOING HISTORY */}

                    {expandedId === tx.id && (

                      <tr>

                        <td
                          colSpan={hideAction ? 8 : 9}
                          className="bg-slate-50 px-12 py-4"
                        >

                          <div className="space-y-3">

                            <div className="flex justify-between items-center">

                              <p className="text-xs font-semibold text-slate-600">
                                📤 Outgoing History
                              </p>

                              <span className="text-xs text-slate-400">
                                Total OUT:{' '}
                                {tx.outgoingTransactions?.reduce(
                                  (sum, h) => sum + h.qtyOut,
                                  0
                                ) || 0}
                              </span>

                            </div>

                            {tx.outgoingTransactions?.length ? (

                              <div className="space-y-2">

                                {tx.outgoingTransactions.map(h => (

                                  <div
                                    key={h.id}
                                    className="flex justify-between items-center bg-white rounded border px-4 py-2"
                                  >

                                    <div>

                                      <p className="text-xs text-slate-500">
                                        {new Date(h.createdAt).toLocaleString()}
                                      </p>

                                      <p className="text-xs font-medium">
                                        Operator: {h.responsiblePerson}
                                      </p>

                                    </div>

                                    <span className="text-sm font-bold text-red-600">
                                      -{h.qtyOut}
                                    </span>

                                  </div>

                                ))}

                              </div>

                            ) : (

                              <p className="text-xs text-slate-400 italic">
                                No outgoing history
                              </p>

                            )}

                          </div>

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