'use client';

import { useState, useEffect } from 'react';
import { OutgoingForm } from '../../../components/warehouse/outgoing-form';
import { OutgoingTable } from '../../../components/warehouse/outgoing-table';

interface Transaction {
  id: string;
  date: string;
  computerCode: string;
  partNo: string;
  productName: string;
  qtyOut: number;
  responsiblePerson: string;
}

export default function OutgoingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/transactions/outgoing');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (err) {
      console.log('[v0] Fetch transactions error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-8">
      {/* Form */}
      <OutgoingForm onSuccess={fetchTransactions} />

      {/* Table */}
      {!loading && <OutgoingTable transactions={transactions} />}
    </div>
  );
}
