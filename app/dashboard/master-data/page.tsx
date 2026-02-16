'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type ProductionType = 'HT' | 'HK';

interface Product {
  id: string;
  computerCode: string;
  partNo: string;
  productName: string;
  productionType: ProductionType;
  location?: string;
  initialStock: number;
  createdAt: string;
}

export default function MasterDataPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // ➕ delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [computerCode, setComputerCode] = useState('');
  const [partNo, setPartNo] = useState('');
  const [productName, setProductName] = useState('');
  const [productionType, setProductionType] = useState<ProductionType>('HT');
  const [location, setLocation] = useState('');
  const [initialStock, setInitialStock] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const result = await response.json();
        setProducts(result);
      }
    } catch (err) {
      console.log('[v0] Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setComputerCode('');
    setPartNo('');
    setProductName('');
    setProductionType('HT');
    setLocation('');
    setInitialStock('');
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setComputerCode(product.computerCode);
    setPartNo(product.partNo);
    setProductName(product.productName);
    setProductionType(product.productionType);
    setLocation(product.location || '');
    setInitialStock(product.initialStock.toString());
  };

  // ➕ DELETE HANDLER
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure want to delete this product?')) return;

    try {
      setDeletingId(id);

      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });

      fetchProducts();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!computerCode.trim() || !partNo.trim() || !productName.trim()) {
      setError('Computer Code, Part No, and Product Name are required');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        editingId ? `/api/products/${editingId}` : '/api/products',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            computerCode: computerCode.trim().toUpperCase(),
            partNo: partNo.trim(),
            productName: productName.trim(),
            productionType,
            location: location.trim(),
            initialStock: parseInt(initialStock) || 0,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: editingId
            ? 'Product updated successfully'
            : 'Product added to master data',
        });

        resetForm();
        fetchProducts();
      } else {
        const data = await response.json();
        setError(data.message || 'Error saving product');
      }
    } catch (err) {
      setError('Error submitting product');
      console.log('[v0] Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.computerCode.toLowerCase().includes(search.toLowerCase()) ||
      p.partNo.toLowerCase().includes(search.toLowerCase()) ||
      p.productName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Master Data</h1>
        <p className="text-slate-600">Manage product master information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Add Product Form */}
        <Card className="lg:col-span-1 border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3">

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Computer Code *
              </label>
              <Input
                value={computerCode}
                onChange={(e) => setComputerCode(e.target.value.toUpperCase())}
                disabled={submitting || !!editingId}
                className="border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Part No *
              </label>
              <Input
                value={partNo}
                onChange={(e) => setPartNo(e.target.value)}
                disabled={submitting}
                className="border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Product Name *
              </label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={submitting}
                className="border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Production *
              </label>
              <select
                value={productionType}
                onChange={(e) => setProductionType(e.target.value as ProductionType)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              >
                <option value="HT">HT</option>
                <option value="HK">HK</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Location
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={submitting}
                className="border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Initial Stock
              </label>
              <Input
                type="number"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                disabled={submitting}
                className="border-slate-300 text-sm"
              />
            </div>

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                {error}
              </div>
            )}

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
              {editingId ? 'Update Product' : 'Add Product'}
            </Button>

            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm} className="w-full text-sm">
                Cancel Edit
              </Button>
            )}
          </form>
        </Card>

        {/* Products List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200 p-4">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-slate-300"
            />
          </Card>

          <Card className="border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left">Computer Code</th>
                    <th className="px-4 py-3 text-left">Part No</th>
                    <th className="px-4 py-3 text-left">Product Name</th>
                    <th className="px-4 py-3 text-left">PROD</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-right">Initial Stock</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500">
                        Loading products...
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-blue-600 text-xs">
                          {product.computerCode}
                        </td>
                        <td className="px-4 py-3">{product.partNo}</td>
                        <td className="px-4 py-3">{product.productName}</td>
                        <td className="px-4 py-3 font-semibold">{product.productionType}</td>
                        <td className="px-4 py-3">{product.location || '-'}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {product.initialStock}
                        </td>
                        <td className="px-4 py-3 text-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={deletingId === product.id}
                            onClick={() => handleDelete(product.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
