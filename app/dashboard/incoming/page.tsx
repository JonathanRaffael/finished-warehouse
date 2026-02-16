'use client'

import { useState, useEffect } from 'react'
import { IncomingForm } from '../../../components/warehouse/incoming-form'
import { IncomingTable } from '../../../components/warehouse/incoming-table'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
}

export default function IncomingPage() {
  const [incomingQueue, setIncomingQueue] = useState<Transaction[]>([])
  const [incomingHistory, setIncomingHistory] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const [selected, setSelected] = useState<Transaction | null>(null)
  const [qty, setQty] = useState<number | ''>('')
  const [person, setPerson] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchIncomingQueue = async () => {
    const res = await fetch('/api/transactions/incoming')
    if (res.ok) setIncomingQueue(await res.json())
  }

  const fetchIncomingHistory = async () => {
    const res = await fetch('/api/transactions/incoming/history')
    if (res.ok) setIncomingHistory(await res.json())
  }

  const refreshAll = async () => {
    setLoading(true)
    await Promise.all([fetchIncomingQueue(), fetchIncomingHistory()])
    setLoading(false)
  }

  useEffect(() => {
    refreshAll()
  }, [])

  // ======================
  // RELEASE TO QC (NOT SHIPMENT!)
  // ======================

  const submitToQC = async () => {
    if (!selected) return
    if (!qty || qty <= 0) return setError('Qty wajib diisi')
    if (qty > selected.remainingQty) return setError('Qty melebihi Remaining')
    if (!person) return setError('Responsible wajib diisi')

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/transactions/after-oqc/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomingId: selected.id,
          qty: Number(qty),
          responsiblePerson: person
        })
      })

      if (!res.ok) throw new Error()

      setSelected(null)
      setQty('')
      setPerson('')

      refreshAll()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-10">

      <IncomingForm onSuccess={refreshAll} />

      {!loading && (
        <>
          <h2 className="font-bold text-lg">📥 Incoming Queue</h2>

          <IncomingTable
            transactions={incomingQueue}
            onSelect={tx => setSelected(tx)}
          />

          <h2 className="font-bold text-lg pt-8">📦 Incoming History</h2>

          <IncomingTable
            transactions={incomingHistory}
            hideAction
          />
        </>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 space-y-5">

            <h3 className="text-lg font-bold">🧪 Release to QC</h3>

            <p>{selected.productName}</p>

            <div className="bg-slate-50 rounded p-3 text-sm">
              Remaining:
              <b className="ml-2 text-orange-600">{selected.remainingQty}</b>
            </div>

            <Input
              type="number"
              placeholder={`Max ${selected.remainingQty}`}
              value={qty}
              onChange={e => setQty(Number(e.target.value) || '')}
            />

            <Input
              placeholder="Responsible Person"
              value={person}
              onChange={e => setPerson(e.target.value)}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>
                Cancel
              </Button>

              <Button className="flex-1" disabled={submitting} onClick={submitToQC}>
                {submitting ? 'Saving...' : 'Release QC'}
              </Button>
            </div>

          </Card>
        </div>
      )}

    </div>
  )
}
