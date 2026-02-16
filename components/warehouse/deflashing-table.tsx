'use client'

import React, { useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Deflashing {
  id: string
  date: string
  computerCode: string
  partNo: string
  productName: string
  productionType: 'HK' | 'HT' // ✅ FIX (dari backend)
  qtyIn: number
  qtyOut: number
  ngQty: number
  spareQty: number
  responsiblePerson: string
  remark?: string
}

interface Props {
  data: Deflashing[]
}

export function DeflashingTable({ data }: Props) {

  /* ================= STATE ================= */
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] =
    useState<'ALL' | 'HK' | 'HT'>('ALL')

  /* ================= FILTER LOGIC ================= */
  const filteredData = useMemo(() => {
    return data.filter(item => {

      const matchSearch =
        item.computerCode
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchType =
        filterType === 'ALL'
          ? true
          : item.productionType === filterType // ✅ FIX

      return matchSearch && matchType
    })
  }, [data, search, filterType])

  if (!data || data.length === 0) {
    return (
      <p className="text-xs text-slate-400">
        No deflashing data available
      </p>
    )
  }

  return (
    <div className="space-y-4">

      {/* ================= CONTROLS ================= */}
      <div className="flex flex-wrap gap-3 justify-between">

        {/* SEARCH */}
        <Input
          placeholder="Search Computer Code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />

        {/* FILTER HK / HT */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filterType === 'ALL' ? 'default' : 'outline'}
            onClick={() => setFilterType('ALL')}
          >
            All
          </Button>

          <Button
            size="sm"
            variant={filterType === 'HK' ? 'default' : 'outline'}
            onClick={() => setFilterType('HK')}
          >
            HK
          </Button>

          <Button
            size="sm"
            variant={filterType === 'HT' ? 'default' : 'outline'}
            onClick={() => setFilterType('HT')}
          >
            HT
          </Button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Computer Code</TableHead>
              <TableHead>Part No</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Qty In</TableHead>
              <TableHead className="text-right">Qty Out</TableHead>
              <TableHead className="text-right">NG</TableHead>
              <TableHead className="text-right">Spare</TableHead>
              <TableHead>PIC</TableHead>
              <TableHead>Remark</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.map(item => (
              <TableRow key={item.id}>

                <TableCell>
                  {new Date(item.date).toLocaleDateString()}
                </TableCell>

                {/* ✅ HK / HT BADGE FIX */}
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded font-semibold ${
                      item.productionType === 'HK'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {item.productionType}
                  </span>
                </TableCell>

                <TableCell className="font-mono">
                  {item.computerCode}
                </TableCell>

                <TableCell>{item.partNo}</TableCell>
                <TableCell>{item.productName}</TableCell>

                <TableCell className="text-right">
                  {item.qtyIn}
                </TableCell>

                <TableCell className="text-right text-green-600 font-medium">
                  {item.qtyOut}
                </TableCell>

                <TableCell className="text-right text-red-600">
                  {item.ngQty}
                </TableCell>

                <TableCell className="text-right">
                  {item.spareQty}
                </TableCell>

                <TableCell>{item.responsiblePerson}</TableCell>

                <TableCell className="max-w-[200px] truncate">
                  {item.remark || '-'}
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* EMPTY RESULT */}
      {filteredData.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-4">
          No matching data found
        </p>
      )}
    </div>
  )
}
