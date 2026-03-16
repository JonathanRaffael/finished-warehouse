'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Transaction {
  id: string
  date: string
  createdAt: string
  computerCode: string | null
  partNo: string | null
  productName: string | null
  qtyOut: number
  responsiblePerson: string
  remark: string | null
}

interface OutgoingTableProps {
  transactions?: Transaction[]
}

export function OutgoingTable({ transactions = [] }: OutgoingTableProps) {

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [sortField, setSortField] = useState<
    'createdAt' | 'computerCode' | 'partNo' | 'productName' | 'qtyOut'
  >('createdAt')

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const pageSize = 10

  /* HANDLE SORT */

  const handleSort = (field: typeof sortField) => {

    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }

  }

  /* SORT */

  const sorted = useMemo(() => {

    if (!Array.isArray(transactions)) return []

    return [...transactions].sort((a, b) => {

      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
      }

      if (aValue === null) return 1
      if (bValue === null) return -1

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      }

      return aValue < bValue ? 1 : -1

    })

  }, [transactions, sortField, sortDirection])

  /* FILTER */

  const filtered = useMemo(() => {

    const s = search.toLowerCase()

    return sorted.filter(tx => {

      const code = tx.computerCode || ''
      const part = tx.partNo || ''
      const product = tx.productName || ''
      const remark = tx.remark || ''

      return (
        code.toLowerCase().includes(s) ||
        product.toLowerCase().includes(s) ||
        part.toLowerCase().includes(s) ||
        remark.toLowerCase().includes(s)
      )

    })

  }, [search, sorted])

  /* PAGINATION */

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  const paginated = useMemo(() => {

    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)

  }, [filtered, page])

  return (

    <Card className="p-6 border space-y-4">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

        <h2 className="text-lg font-bold">
          📤 Outgoing Transactions
        </h2>

        <Input
          placeholder="Search code / part / product / remark..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-sm"
        />

      </div>

      {/* TABLE */}

      <div className="overflow-x-auto border rounded-lg max-h-[500px]">

        <table className="min-w-full text-sm">

          <thead className="bg-slate-100 sticky top-0">

            <tr>

              <th
                onClick={() => handleSort('createdAt')}
                className="px-3 py-3 text-left cursor-pointer"
              >
                DATE
              </th>

              <th
                onClick={() => handleSort('computerCode')}
                className="px-3 text-left cursor-pointer"
              >
                CODE
              </th>

              <th
                onClick={() => handleSort('partNo')}
                className="px-3 text-left cursor-pointer"
              >
                PART
              </th>

              <th
                onClick={() => handleSort('productName')}
                className="px-3 text-left cursor-pointer"
              >
                PRODUCT
              </th>

              <th
                onClick={() => handleSort('qtyOut')}
                className="px-3 text-center text-red-600 cursor-pointer"
              >
                QTY OUT
              </th>

              <th className="px-3 text-left">
                RESPONSIBLE
              </th>

              <th className="px-3 text-left">
                REMARK
              </th>

            </tr>

          </thead>

          <tbody>

            {paginated.length === 0 ? (

              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400">
                  No outgoing transactions
                </td>
              </tr>

            ) : (

              paginated.map((tx, index) => (

                <tr
                  key={tx.id}
                  className={`border-b hover:bg-red-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  }`}
                >

                  <td className="px-3 py-3">
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

                  <td className="px-3 py-3 text-slate-500">
                    {tx.remark || '-'}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* FOOTER */}

      <div className="flex items-center justify-between pt-3">

        <div className="text-xs text-slate-500">
          Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} -
          {Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </div>

        <div className="flex gap-2">

          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Prev
          </Button>

          <span className="text-sm px-2 py-1">
            Page {page} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>

        </div>

      </div>

    </Card>

  )

}