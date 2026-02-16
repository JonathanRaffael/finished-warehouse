'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Product {
  computerCode: string
  partNo: string
  productName: string
}

interface IncomingFormProps {
  onSuccess: () => void
}

export function IncomingForm({ onSuccess }: IncomingFormProps) {
  const { toast } = useToast()

  const [computerCode, setComputerCode] = useState('')
  const [product, setProduct] = useState<Product | null>(null)

  const [incomingQty, setIncomingQty] = useState<number | ''>('')
  const [batch, setBatch] = useState<number | ''>('')

  const [responsiblePerson, setResponsiblePerson] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  /* ================= SEARCH PRODUCT ================= */

  const searchProduct = async () => {
    if (!computerCode.trim()) return

    setSearching(true)
    setError('')

    try {
      const res = await fetch(`/api/products/lookup?computerCode=${computerCode.trim()}`)
      if (!res.ok) throw new Error()

      const data = await res.json()
      setProduct(data)
      setIncomingQty('')
      setBatch('')
    } catch {
      setError('❌ Product not found. Please check Computer Code.')
      setProduct(null)
    } finally {
      setSearching(false)
    }
  }

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product) return setError('Search product first.')
    if (!incomingQty) return setError('Incoming Qty is required.')
    if (!responsiblePerson) return setError('Responsible Person is required.')

    setLoading(true)

    try {
      const res = await fetch('/api/transactions/incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          computerCode: product.computerCode,
          partNo: product.partNo,
          productName: product.productName,
          incomingQty: Number(incomingQty),
          batch: Number(batch || 0),
          responsiblePerson
        })
      })

      if (!res.ok) throw new Error()

      toast({
        title: 'Incoming Saved',
        description: 'Stock added to Incoming Queue.'
      })

      setComputerCode('')
      setProduct(null)
      setIncomingQty('')
      setBatch('')
      setResponsiblePerson('')
      setDate(new Date().toISOString().split('T')[0])

      onSuccess()
    } catch {
      setError('❌ Failed to save incoming.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border p-6 space-y-6">

      <h2 className="text-xl font-bold">📦 Record Incoming</h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* STEP 1 */}
        <div>
          <p className="text-sm font-semibold mb-1">Step 1 — Scan / Enter Computer Code</p>
          <div className="flex gap-2">
            <Input
              placeholder="Example: RRU15913300D5T"
              value={computerCode}
              onChange={e => setComputerCode(e.target.value)}
            />
            <Button type="button" onClick={searchProduct}>
              {searching ? 'Checking...' : 'Search'}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Use barcode scanner or type computer code.
          </p>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* PRODUCT PREVIEW */}
        {product && (
          <div className="bg-slate-50 border rounded-lg p-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Part No</p>
              <p className="font-mono font-semibold">{product.partNo}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Product Name</p>
              <p className="font-semibold">{product.productName}</p>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {product && (
          <>
            <div>
              <p className="text-sm font-semibold mb-1">Step 2 — Incoming Quantity</p>
              <Input
                type="number"
                placeholder="Enter quantity received"
                value={incomingQty}
                onChange={e => setIncomingQty(Number(e.target.value) || '')}
                className="bg-green-50 font-bold"
              />
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Batch (optional)</p>
              <Input
                type="number"
                placeholder="Batch number"
                value={batch}
                onChange={e => setBatch(Number(e.target.value) || '')}
              />
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Responsible Person</p>
              <Input
                placeholder="Your name"
                value={responsiblePerson}
                onChange={e => setResponsiblePerson(e.target.value)}
              />
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Incoming Date</p>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <Button
              disabled={loading}
              className="w-full bg-blue-600 text-white"
            >
              {loading ? 'Saving...' : 'Submit Incoming'}
            </Button>
          </>
        )}

      </form>

    </Card>
  )
}
