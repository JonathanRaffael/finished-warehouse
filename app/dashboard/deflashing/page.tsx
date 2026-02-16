'use client'

import { useState, useEffect } from 'react'
import { DeflashingForm } from '../../../components/warehouse/deflashing-form'
import { DeflashingTable } from '../../../components/warehouse/deflashing-table'
import { Card } from '@/components/ui/card'

export default function DeflashingPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  /* ================= FETCH DEFLASHING HISTORY ================= */

  const fetchHistory = async () => {
    setLoadingHistory(true)

    try {
      const res = await fetch('/api/deflashing', {
        cache: 'no-store'
      })

      if (!res.ok) throw new Error()

      const data = await res.json()
      setHistory(data)
    } catch (e) {
      console.error('[DEFLASHING HISTORY ERROR]', e)
      setHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    fetchHistory()
  }, [])

  /* ================= ON SUBMIT SUCCESS ================= */

  const handleSuccess = () => {
    fetchHistory()
  }

  return (
    <div className="space-y-8">

      {/* FORM */}
      <DeflashingForm onSuccess={handleSuccess} />

      {/* DEFLASHING HISTORY */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold">🛠️ Deflashing History</h2>

          {!loadingHistory && history.length === 0 && (
            <span className="text-xs text-slate-400">
              No deflashing records yet
            </span>
          )}
        </div>

        {loadingHistory ? (
          <p className="text-xs text-slate-400">Loading history...</p>
        ) : (
          <DeflashingTable data={history} />
        )}
      </Card>

    </div>
  )
}
