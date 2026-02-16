'use client';

import React from "react"

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Product {
  computerCode: string;
  partNo: string;
  productName: string;
}

interface OutgoingFormProps {
  onSuccess: () => void;
}

export function OutgoingForm({ onSuccess }: OutgoingFormProps) {
  const [computerCode, setComputerCode] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [qtyOut, setQtyOut] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const searchProduct = async () => {
    if (!computerCode.trim()) {
      setError('Please enter Computer Code');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const response = await fetch(
        `/api/products/lookup?computerCode=${computerCode.trim().toUpperCase()}`
      );
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        setQtyOut('');
      } else {
        setError('Product not found');
        setProduct(null);
      }
    } catch (err) {
      setError('Error searching product');
      console.log('[v0] Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!product) {
      setError('Please search for a product first');
      return;
    }

    if (!responsiblePerson.trim()) {
      setError('Please enter Responsible Person');
      return;
    }

    if (!qtyOut) {
      setError('Please enter Qty Out');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/transactions/outgoing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          computerCode: product.computerCode,
          partNo: product.partNo,
          productName: product.productName,
          qtyOut: parseInt(qtyOut),
          responsiblePerson,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Outgoing transaction recorded',
        });
        // Reset form
        setComputerCode('');
        setProduct(null);
        setQtyOut('');
        setResponsiblePerson('');
        setDate(new Date().toISOString().split('T')[0]);
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.message || 'Error submitting transaction');
      }
    } catch (err) {
      setError('Error submitting transaction');
      console.log('[v0] Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-6">
        Record Outgoing Transaction
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Lookup */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-900">
            Computer Code *
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g., RRU1561..."
              value={computerCode}
              onChange={(e) => setComputerCode(e.target.value)}
              className="border-slate-300 flex-1"
            />
            <Button
              type="button"
              onClick={searchProduct}
              disabled={searching || !computerCode.trim()}
              className="bg-slate-600 hover:bg-slate-700 text-white"
            >
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Product Details Display */}
        {product && (
          <>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600">Part No</p>
                  <p className="font-mono text-sm font-semibold text-slate-900">
                    {product.partNo}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Product Name</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {product.productName}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">
                Qty Out *
              </label>
              <Input
                type="number"
                placeholder="0"
                value={qtyOut}
                onChange={(e) => setQtyOut(e.target.value)}
                className="border-slate-300 font-bold text-red-600"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">
                Responsible Person *
              </label>
              <Input
                type="text"
                placeholder="Name / ID"
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">
                Date *
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-slate-300"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {loading ? 'Saving...' : 'Submit Outgoing Transaction'}
            </Button>
          </>
        )}
      </form>
    </Card>
  );
}
