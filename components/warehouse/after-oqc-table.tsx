'use client'

import { useState, Fragment } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Transaction {
  id: string
  createdAt: string
  okQty: number
  ngQty: number
  spareQty: number
  responsiblePerson: string | null
  afterOQC: {
    computerCode: string
    partNo: string
    productName: string
  }
}

interface Props {
  transactions: Transaction[]
}

export function AfterOQCTable({ transactions }: Props) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const grouped = Object.values(
    transactions.reduce((acc: any, row) => {
      const code = row.afterOQC.computerCode

      if (!acc[code]) {
        acc[code] = {
          id: code,
          computerCode: row.afterOQC.computerCode,
          partNo: row.afterOQC.partNo,
          productName: row.afterOQC.productName,
          history: [],
          after: 0,
          ng: 0,
          spare: 0
        }
      }

      acc[code].history.push(row)
      acc[code].after += row.okQty || 0
      acc[code].ng += row.ngQty || 0
      acc[code].spare += row.spareQty || 0

      return acc
    }, {})
  ).filter(
    (r: any) =>
      r.computerCode.toLowerCase().includes(search.toLowerCase()) ||
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.partNo.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Card className="p-6 border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">✅ QC History</h2>

        <Input
          placeholder="Search code / part / product..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-emerald-600 text-white">
              {['CODE','PART','PRODUCT','IN','OK','NG','SPARE','TOTAL STOCK'].map(h => (
                <th key={h} className="border px-3 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {grouped.map((row:any) => {
              const totalIn = row.after + row.ng + row.spare

              return (
                <Fragment key={row.id}>
                  <tr className="border-b hover:bg-emerald-50">
                    <td className="px-3 py-2 font-mono">{row.computerCode}</td>
                    <td className="px-3 py-2 font-mono">{row.partNo}</td>
                    <td className="px-3 py-2">{row.productName}</td>

                    <td className="px-3 py-2">{totalIn}</td>

                    <td className="px-3 py-2 text-green-600 font-semibold">
                      {row.after}
                    </td>

                    <td className="px-3 py-2 text-red-600 font-semibold">
                      {row.ng}
                    </td>

                    <td className="px-3 py-2">{row.spare}</td>

                    <td
                      className="px-3 py-2 font-bold text-blue-600 cursor-pointer hover:underline"
                      onClick={() => setOpen(open === row.id ? null : row.id)}
                    >
                      {row.after + row.spare}
                    </td>
                  </tr>

                  {open === row.id && (
                    <tr className="bg-slate-50">
                      <td colSpan={8} className="p-4">
                        <p className="font-semibold mb-2">Inspection History</p>

                        <table className="w-full text-xs border">
                          <thead className="bg-slate-200">
                            <tr>
                              {['DATE','IN','OK','NG','SPARE','QC BY'].map(h => (
                                <th key={h} className="border px-2 py-1">{h}</th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>
                            {row.history.map((h:any) => (
                              <tr key={h.id}>
                                <td className="border px-2 py-1">
                                  {new Date(h.createdAt).toLocaleString()}
                                </td>

                                <td className="border px-2 py-1">
                                  {h.okQty + h.ngQty + h.spareQty}
                                </td>

                                <td className="border px-2 py-1 text-green-600">{h.okQty}</td>
                                <td className="border px-2 py-1 text-red-600">{h.ngQty}</td>
                                <td className="border px-2 py-1">{h.spareQty}</td>
                                <td className="border px-2 py-1">{h.responsiblePerson}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
