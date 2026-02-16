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

  const filteredTransactions = transactions.filter(tx => {
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
    <Card className="border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Outgoing Transactions
        </h2>

        <Input
          type="text"
          placeholder="Search by Computer Code, Product Name, or Part No..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-slate-300"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-teal-600 text-white">
              <th className="border px-4 py-3 text-left text-sm font-semibold">DATE</th>
              <th className="border px-4 py-3 text-left text-sm font-semibold">COMPUTER CODE</th>
              <th className="border px-4 py-3 text-left text-sm font-semibold">PART NO</th>
              <th className="border px-4 py-3 text-left text-sm font-semibold">PRODUCT NAME</th>
              <th className="border px-4 py-3 text-center text-sm font-semibold bg-red-600">QTY OUT</th>
              <th className="border px-4 py-3 text-left text-sm font-semibold">RESPONSIBLE</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx, index) => (
                <tr
                  key={tx.id}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-red-50`}
                >
                  <td className="border px-4 py-3 text-sm">
                    {new Date(tx.date).toLocaleDateString('id-ID')}
                  </td>

                  <td className="border px-4 py-3 text-sm font-mono font-semibold">
                    {tx.computerCode || '-'}
                  </td>

                  <td className="border px-4 py-3 text-sm font-mono">
                    {tx.partNo || '-'}
                  </td>

                  <td className="border px-4 py-3 text-sm">
                    {tx.productName || '-'}
                  </td>

                  <td className="border px-4 py-3 text-center text-sm font-bold text-red-600 bg-red-50">
                    -{tx.qtyOut}
                  </td>

                  <td className="border px-4 py-3 text-sm">
                    {tx.responsiblePerson}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-slate-600">
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </div>
    </Card>
  )
}
