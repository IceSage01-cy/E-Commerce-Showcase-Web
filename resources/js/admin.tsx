import './bootstrap';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import AdminPage from './pages/AdminPage';
import type { Banner, BannerFormData } from './components/BannersTab';
import type { Product } from './data/products';

function AdminRoot() {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    axios.get('/admin/api/banners').then((res) => setBanners(res.data));
    axios.get('/admin/api/products').then((res) => setProducts(res.data));
  }, []);

  async function handleAddProduct(data: Omit<Product, 'id'>) {
    const res = await axios.post('/admin/api/products', data);
    setProducts((prev) => [res.data, ...prev]);
  }

  async function handleEditProduct(updated: Product) {
    const { id, ...data } = updated;
    const res = await axios.put(`/admin/api/products/${id}`, data);
    setProducts((prev) => prev.map((p) => (p.id === id ? res.data : p)));
  }

  async function handleDeleteProduct(id: string) {
    await axios.delete(`/admin/api/products/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
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
