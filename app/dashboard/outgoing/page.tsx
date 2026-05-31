'use client';

import { useState, useEffect } from 'react';

import { OutgoingForm } from '../../../components/warehouse/outgoing-form';
import { OutgoingTable } from '../../../components/warehouse/outgoing-table';

export interface Transaction {
  id: string;

  date: string;
  createdAt: string;

  computerCode: string;
  partNo: string;
  productName: string;

  qtyOut: number;

  responsiblePerson: string;

  remark: string | null;
}

export default function OutgoingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/transactions/outgoing');

      if (!response.ok) {
        throw new Error('Failed to fetch outgoing transactions');
      }

      const data = await response.json();

      setTransactions(data);
    } catch (err) {
      console.log('[OUTGOING_FETCH_ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-8">
      {/* OUTGOING FORM */}
      <OutgoingForm onSuccess={fetchTransactions} />

      {/* OUTGOING TABLE */}
      {!loading && (
        <OutgoingTable
          transactions={transactions}
        />
      )}
    </div>
  );
}