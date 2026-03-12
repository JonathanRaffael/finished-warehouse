'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Transaction {
  id: string
  date: string
  computerCode: string | null
  partNo: string | null
  productName: string | null
  qtyOut: number
  responsiblePerson: string
}

interface OutgoingTableProps {
  transactions: Transaction[]
}

export function OutgoingTable({ transactions }: OutgoingTableProps) {

  const [search, setSearch] = useState('')

  /* SORT BY DATE (OLDEST FIRST) */

  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  /* FILTER SEARCH */

  const filteredTransactions = sortedTransactions.filter(tx => {

    const code = tx.computerCode || ''
    const part = tx.partNo || ''
    const product = tx.productName || ''

    return (
      code.toLowerCase().includes(search.toLowerCase()) ||
      product.toLowerCase().includes(search.toLowerCase()) ||
      part.toLowerCase().includes(search.toLowerCase())
    )

  })

  return (

    <Card className="p-6 border space-y-4">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <h2 className="text-lg font-bold">
          📤 Outgoing Transactions
        </h2>

        <Input
          placeholder="Search code / part / product..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />

      </div>

      {/* TABLE */}

      <div className="overflow-x-auto border rounded-lg">

        <table className="min-w-full text-sm">

          <thead className="bg-slate-100">

            <tr className="text-center">

              <th className="py-3 px-3 text-left">DATE</th>
              <th className="px-3 text-left">CODE</th>
              <th className="px-3 text-left">PART</th>
              <th className="px-3 text-left">PRODUCT</th>
              <th className="px-3 text-center text-red-600">QTY OUT</th>
              <th className="px-3 text-left">RESPONSIBLE</th>

            </tr>

          </thead>

          <tbody>

            {filteredTransactions.length === 0 ? (

              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  No outgoing transactions
                </td>
              </tr>

            ) : (

              filteredTransactions.map((tx, index) => (

                <tr
                  key={tx.id}
                  className={`border-b hover:bg-red-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  }`}
                >

                  <td className="px-3 py-3 text-sm">
                    {new Date(tx.date).toLocaleDateString('id-ID')}
                  </td>

                  <td className="px-3 py-3 font-mono font-semibold text-blue-600">
                    {tx.computerCode || '-'}
                  </td>

                  <td className="px-3 py-3 font-mono">
                    {tx.partNo || '-'}
                  </td>

                  <td className="px-3 py-3 text-slate-700">
                    {tx.productName || '-'}
                  </td>

                  <td className="px-3 py-3 text-center font-bold text-red-600">
                    -{tx.qtyOut}
                  </td>

                  <td className="px-3 py-3">
                    {tx.responsiblePerson}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* FOOTER */}

      <div className="flex justify-between text-xs text-slate-500 pt-2">

        <span>
          Total Records: {transactions.length}
        </span>

        <span>
          Showing: {filteredTransactions.length}
        </span>

      </div>

    </Card>

  )

}