'use client'

import { useState, useEffect } from 'react'
import { AfterOQCForm } from '../../../components/warehouse/after-oqc-form'
import { AfterOQCTable } from '../../../components/warehouse/after-oqc-table'
import { QCQueueTable } from '../../../components/warehouse/qc-queue-table'
import { Card } from '@/components/ui/card'

export default function AfterOQCPage() {

  const [qcQueue, setQcQueue] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [selectedQueue, setSelectedQueue] = useState<any>(null)

  const [loadingQueue, setLoadingQueue] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  /* ================= FETCH QC QUEUE ================= */

  const fetchQCQueue = async () => {

    setLoadingQueue(true)

    try {

      const res = await fetch('/api/qc-queue', {
        cache: 'no-store'
      })

      if (!res.ok) throw new Error()

      const data = await res.json()
      setQcQueue(data)

    } catch (e) {

      console.error('[QC QUEUE ERROR]', e)
      setQcQueue([])

    } finally {

      setLoadingQueue(false)

    }

  }

  /* ================= FETCH QC HISTORY ================= */

  const fetchHistory = async () => {

    setLoadingHistory(true)

    try {

      const res = await fetch('/api/transactions/after-oqc/history', {
        cache: 'no-store'
      })

      if (!res.ok) throw new Error()

      const data = await res.json()
      setHistory(data)

    } catch (e) {

      console.error('[QC HISTORY ERROR]', e)
      setHistory([])

    } finally {

      setLoadingHistory(false)

    }

  }

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {

    fetchQCQueue()
    fetchHistory()

  }, [])

  /* ================= QC SUCCESS ================= */

  const handleSuccess = () => {

    setSelectedQueue(null)

    fetchQCQueue()
    fetchHistory()

  }

  return (

    <div className="space-y-8">

      {/* ================= QC QUEUE ================= */}

      <Card className="p-6 space-y-4">

        <div className="flex justify-between items-center">

          <h2 className="text-lg font-bold">
            🧪 QC Queue
          </h2>

          {!loadingQueue && qcQueue.length === 0 && (
            <span className="text-xs text-slate-400">
              No pending QC
            </span>
          )}

        </div>

        {loadingQueue ? (

          <div className="text-xs text-slate-400">
            Loading QC Queue...
          </div>

        ) : (

          <QCQueueTable
            queues={qcQueue}
            onSelect={setSelectedQueue}
          />

        )}

      </Card>

      {/* ================= QC FORM ================= */}

      <AfterOQCForm
        selectedQueue={selectedQueue}
        onSuccess={handleSuccess}
      />

      {/* ================= QC HISTORY ================= */}

      <Card className="p-6 space-y-4">

        <div className="flex justify-between items-center">

          <h2 className="text-lg font-bold">
            📦 QC History
          </h2>

          {!loadingHistory && history.length === 0 && (
            <span className="text-xs text-slate-400">
              No QC records yet
            </span>
          )}

        </div>

        {loadingHistory ? (

          <div className="text-xs text-slate-400">
            Loading history...
          </div>

        ) : (

          <AfterOQCTable transactions={history} />

        )}

      </Card>

    </div>

  )
}