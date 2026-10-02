import './bootstrap';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import AdminPage from './pages/AdminPage';
import type { Banner, BannerFormData } from './components/BannersTab';
import type { Product } from './data/products';

/** Pull the most useful message out of a Laravel error response (validation errors first). */
function apiError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const errors = err.response?.data?.errors as Record<string, string[]> | undefined;
    if (errors) return Object.values(errors).flat().join('\n');
    if (err.response?.data?.message) return String(err.response.data.message);
  }
  return fallback;
}

function AdminRoot() {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    axios.get('/admin/api/banners').then((res) => setBanners(res.data));
    axios.get('/admin/api/products').then((res) => setProducts(res.data));
  }, []);

  async function handleAddProduct(data: Omit<Product, 'id'>) {
    try {
      const res = await axios.post('/admin/api/products', data);
      setProducts((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error('Failed to add product', err);
      alert(apiError(err, 'Could not save the product. Please check the form and try again.'));
    }
  }

  async function handleEditProduct(updated: Product) {
    const { id, ...data } = updated;
    try {
      const res = await axios.put(`/admin/api/products/${id}`, data);
      setProducts((prev) => prev.map((p) => (p.id === id ? res.data : p)));
    } catch (err) {
      console.error('Failed to update product', err);
      alert(apiError(err, 'Could not save the product. Please check the form and try again.'));
    }
  }

  async function handleDeleteProduct(id: string) {
    try {
      await axios.delete(`/admin/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product', err);
      alert(apiError(err, 'Could not delete the product. Please try again.'));
    }
  }

  // Optimistic: flip the badge instantly, tell the server, roll back if it fails.
  async function handleToggleStock(id: string, inStock: boolean) {
    const setFlag = (value: boolean) =>
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, inStock: value } : p)));

    setFlag(inStock);
    try {
      await axios.patch(`/admin/api/products/${id}/stock`, { inStock });
    } catch (err) {
      setFlag(!inStock);
      console.error('Failed to update stock status', err);
      alert(apiError(err, 'Could not update stock status. Please try again.'));
    }
  }

  async function handleAddBanner(data: BannerFormData) {
    const res = await axios.post('/admin/api/banners', data);
    setBanners((prev) => [...prev, res.data]);
  }

  async function handleEditBanner(id: string, data: BannerFormData) {
    const res = await axios.put(`/admin/api/banners/${id}`, data);
    setBanners((prev) => prev.map((b) => (b.id === id ? res.data : b)));
  }

  async function handleDeleteBanner(id: string) {
    await axios.delete(`/admin/api/banners/${id}`);
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <AdminPage
      products={products}
      onAdd={handleAddProduct}
      onEdit={handleEditProduct}
      onDelete={handleDeleteProduct}
      onToggleStock={handleToggleStock}
      banners={banners}
      onAddBanner={handleAddBanner}
      onEditBanner={handleEditBanner}
      onDeleteBanner={handleDeleteBanner}
      onNavigate={(page) => {
        if (page === 'home') window.location.href = '/';
      }}
    />
  );
}

ReactDOM.createRoot(document.getElementById('admin-root')!).render(
  <React.StrictMode>
    <AdminRoot />
  </React.StrictMode>,
);
