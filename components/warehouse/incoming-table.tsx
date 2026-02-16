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

  const filtered = transactions.filter(tx =>
    `${tx.computerCode || ''}${tx.partNo || ''}${tx.productName || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <Card className="border p-6 space-y-4">

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
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-xs">

          <thead className="bg-slate-100">
            <tr className="text-center">
              <th className="py-2">DATE</th>
              <th>CODE</th>
              <th>PART</th>
              <th>PRODUCT</th>
              <th>IN</th>
              <th>REM</th>
              <th>STATUS</th>

              {!hideAction && <th>OUT</th>}
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={hideAction ? 7 : 8} className="py-10 text-center text-slate-400">
                  No incoming
                </td>
              </tr>
            ) : (
              filtered.map(tx => {
                const percent =
                  tx.incomingQty > 0
                    ? (tx.remainingQty / tx.incomingQty) * 100
                    : 0

                return (
                  <Fragment key={tx.id}>
                    <tr className="border-b hover:bg-slate-50 text-center">

                      <td>{new Date(tx.date).toLocaleDateString('id-ID')}</td>

                      <td className="font-mono text-blue-700">
                        {tx.computerCode}
                      </td>

                      <td>{tx.partNo}</td>

                      <td>{tx.productName}</td>

                      <td className="font-bold text-green-600">
                        {tx.incomingQty}
                      </td>

                      <td className="font-bold text-orange-600">
                        {tx.remainingQty}
                        <div className="h-1 bg-slate-200 rounded mt-1 mx-3">
                          <div
                            className="h-1 bg-orange-500 rounded"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>

                      <td>
                        <span
                          className={`inline-block px-2 py-1 text-[10px] rounded ${
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
                          <div className="flex justify-center gap-1">
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
                                setExpandedId(expandedId === tx.id ? null : tx.id)
                              }
                            >
                              History
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>

                    {expandedId === tx.id && (
                      <tr>
                        <td colSpan={hideAction ? 7 : 8} className="bg-slate-50 px-12 py-4">

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
                                    className="flex justify-between items-center bg-white rounded-lg border px-4 py-2 shadow-sm"
                                  >
                                    <div className="space-y-0.5">
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

      <p className="text-xs text-slate-500">
        Showing {filtered.length} record(s)
      </p>

    </Card>
  )
}
