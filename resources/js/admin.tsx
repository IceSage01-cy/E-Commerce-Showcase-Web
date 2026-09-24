import './bootstrap';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import AdminPage from './pages/AdminPage';
import type { Banner, BannerFormData } from './components/BannersTab';
import { products as initialProducts } from './data/products';
import type { Product } from './data/products';

let nextId = initialProducts.length + 1;

function AdminRoot() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    axios.get('/admin/api/banners').then((res) => setBanners(res.data));
  }, []);

  function handleAddProduct(data: Omit<Product, 'id'>) {
    const id = `p${String(nextId++).padStart(3, '0')}`;
    setProducts((prev) => [{ id, ...data }, ...prev]);
  }

  function handleEditProduct(updated: Product) {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function handleDeleteProduct(id: string) {
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
