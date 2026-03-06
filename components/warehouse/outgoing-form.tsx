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

interface OutgoingFormProps {
  onSuccess: () => void
}

export function OutgoingForm({ onSuccess }: OutgoingFormProps) {

  const { toast } = useToast()

  const [computerCode, setComputerCode] = useState('')
  const [product, setProduct] = useState<Product | null>(null)

  const [qtyOut, setQtyOut] = useState('')
  const [responsiblePerson, setResponsiblePerson] = useState('')
  const [remark, setRemark] = useState('')

  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  /* ================= SEARCH PRODUCT ================= */

  const searchProduct = async () => {

    if (!computerCode.trim()) {
      setError('Please enter Computer Code')
      return
    }

    setSearching(true)
    setError('')

    try {

      const res = await fetch(
        `/api/products/lookup?computerCode=${computerCode.trim().toUpperCase()}`
      )

      if (res.ok) {

        const data = await res.json()

        setProduct(data)
        setQtyOut('')
        setRemark('')

      } else {

        setProduct(null)
        setError('Product not found')

      }

    } catch {

      setError('Error searching product')

    } finally {

      setSearching(false)

    }

  }

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()
    setError('')

    if (!product) {
      setError('Please search for a product first')
      return
    }

    if (!responsiblePerson.trim()) {
      setError('Please enter Responsible Person')
      return
    }

    if (!qtyOut) {
      setError('Please enter Qty Out')
      return
    }

    setLoading(true)

    try {

      const res = await fetch('/api/transactions/outgoing', {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({

          date,

          computerCode: product.computerCode,
          partNo: product.partNo,
          productName: product.productName,

          qtyOut: parseInt(qtyOut),

          responsiblePerson,
          remark

        })

      })

      if (!res.ok) throw new Error()

      toast({
        title: 'Success',
        description: 'Outgoing transaction recorded'
      })

      /* RESET */

      setComputerCode('')
      setProduct(null)

      setQtyOut('')
      setResponsiblePerson('')
      setRemark('')

      setDate(new Date().toISOString().split('T')[0])

      onSuccess()

    } catch {

      setError('Error submitting transaction')

    } finally {

      setLoading(false)

    }

  }

  return (

    <Card className="p-6 space-y-6 border">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <h2 className="text-xl font-bold">
          📤 Outgoing Transaction
        </h2>

        <span className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded">
          STOCK OUT
        </span>

      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* PRODUCT SEARCH */}

        <div className="space-y-2">

          <label className="text-xs text-slate-500">
            Computer Code
          </label>

          <div className="flex gap-2">

            <Input
              placeholder="Enter Computer Code"
              value={computerCode}
              onChange={e => setComputerCode(e.target.value)}
              className="font-mono"
            />

            <Button
              type="button"
              onClick={searchProduct}
              disabled={searching || !computerCode.trim()}
              className="bg-slate-700 text-white"
            >
              {searching ? 'Searching...' : 'Search'}
            </Button>

          </div>

        </div>

        {/* ERROR */}

        {error && (

          <div className="bg-red-50 border border-red-200 rounded px-4 py-2 text-sm text-red-600">
            {error}
          </div>

        )}

        {/* PRODUCT INFO */}

        {product && (

          <div className="grid grid-cols-3 gap-4 bg-slate-50 border rounded p-4">

            <div>
              <p className="text-xs text-slate-500">
                Computer Code
              </p>

              <p className="font-mono font-semibold text-blue-600">
                {product.computerCode}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Part No
              </p>

              <p className="font-semibold">
                {product.partNo}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Product
              </p>

              <p className="font-semibold">
                {product.productName}
              </p>
            </div>

          </div>

        )}

        {/* INPUT SECTION */}

        {product && (

          <div className="grid grid-cols-4 gap-4">

            <div>

              <label className="text-xs text-slate-500">
                Qty Out
              </label>

              <Input
                type="number"
                placeholder="0"
                value={qtyOut}
                onChange={e => setQtyOut(e.target.value)}
                className="font-bold text-red-600"
              />

            </div>

            <div>

              <label className="text-xs text-slate-500">
                Responsible Person
              </label>

              <Input
                placeholder="Operator name"
                value={responsiblePerson}
                onChange={e => setResponsiblePerson(e.target.value)}
              />

            </div>

            <div>

              <label className="text-xs text-slate-500">
                Date
              </label>

              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />

            </div>

            <div>

              <label className="text-xs text-slate-500">
                Remark
              </label>

              <Input
                placeholder="Optional remark"
                value={remark}
                onChange={e => setRemark(e.target.value)}
              />

            </div>

          </div>

        )}

        {/* ACTION */}

        {product && (

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >

            {loading
              ? 'Saving...'
              : 'Submit Outgoing Transaction'}

          </Button>

        )}

      </form>

    </Card>

  )

}