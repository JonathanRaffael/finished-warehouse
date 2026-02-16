'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface Deflashing {
  id: string
  date: string
  computerCode: string
  partNo: string
  productName: string
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
  if (!data || data.length === 0) {
    return (
      <p className="text-xs text-slate-400">
        No deflashing data available
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
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
          {data.map(item => (
            <TableRow key={item.id}>
              <TableCell>
                {new Date(item.date).toLocaleDateString()}
              </TableCell>
              <TableCell>{item.computerCode}</TableCell>
              <TableCell>{item.partNo}</TableCell>
              <TableCell>{item.productName}</TableCell>

              <TableCell className="text-right">
                {item.qtyIn}
              </TableCell>
              <TableCell className="text-right">
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
  )
}
