import './bootstrap';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import AdminPage from './pages/AdminPage';
import type { Banner, BannerFormData } from './components/BannersTab';
import type { Product, CategoryInfo, BulkAction } from './data/products';
import type { CategoryFormData } from './components/CategoriesTab';

/** Pull the most useful message out of a Laravel error response (validation errors first). */
function apiError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const errors = err.response?.data?.errors as Record<string, string[]> | undefined;
    if (errors) return Object.values(errors).flat().join('\n');
    if (err.response?.data?.message) return String(err.response.data.message);
  }
  return fallback;
}

/** Put one product at the top of the list (the server sorts the same way: last changed first). */
const moveToTop = (list: Product[], updated: Product) => [updated, ...list.filter((p) => p.id !== updated.id)];

function AdminRoot() {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);

  useEffect(() => {
    axios.get('/admin/api/banners').then((res) => setBanners(res.data));
    axios.get('/admin/api/products').then((res) => setProducts(res.data));
    axios.get('/admin/api/categories').then((res) => setCategories(res.data));
  }, []);

  // Save handlers resolve to true/false so the form can stay open (with what you typed) when the server says no.
  // Resolve to null when saved, or to the message the form should show (no browser alert).
  async function handleAddProduct(data: Omit<Product, 'id'>): Promise<string | null> {
    try {
      const res = await axios.post('/admin/api/products', data);
      setProducts((prev) => [res.data, ...prev]);
      return null;
    } catch (err) {
      console.error('Failed to add product', err);
      return apiError(err, 'Could not save the product. Please check the form and try again.');
    }
  }

  async function handleEditProduct(updated: Product): Promise<string | null> {
    const { id, ...data } = updated;
    try {
      const res = await axios.put(`/admin/api/products/${id}`, data);
      setProducts((prev) => moveToTop(prev, res.data));
      return null;
    } catch (err) {
      console.error('Failed to update product', err);
      return apiError(err, 'Could not save the product. Please check the form and try again.');
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

  // One-click switches. Optimistic: flip it (and move the row to the top) instantly,
  // tell the server, flip back if it fails.
  async function quickToggle(id: string, field: 'inStock' | 'isFeatured', value: boolean, url: string, failMsg: string) {
    setProducts((prev) => {
      const current = prev.find((p) => p.id === id);
      return current ? moveToTop(prev, { ...current, [field]: value }) : prev;
    });
    try {
      await axios.patch(url, { [field]: value });
    } catch (err) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: !value } : p)));
      console.error(failMsg, err);
      alert(apiError(err, `${failMsg}. Please try again.`));
    }
  }

  const handleToggleStock = (id: string, inStock: boolean) =>
    quickToggle(id, 'inStock', inStock, `/admin/api/products/${id}/stock`, 'Could not update stock status');

  const handleToggleFeatured = (id: string, isFeatured: boolean) =>
    quickToggle(id, 'isFeatured', isFeatured, `/admin/api/products/${id}/featured`, 'Could not update Japan New Arrivals');

  // Many products, one request.
  async function handleBulk(ids: string[], action: BulkAction): Promise<boolean> {
    try {
      const res = await axios.post('/admin/api/products/bulk', { ids: ids.map(Number), action });
      if (action === 'delete') {
        const gone = new Set<string>(res.data.deleted);
        setProducts((prev) => prev.filter((p) => !gone.has(p.id)));
      } else {
        const changed: Product[] = res.data.products;
        const changedIds = new Set(changed.map((p) => p.id));
        setProducts((prev) => [...changed, ...prev.filter((p) => !changedIds.has(p.id))]);
      }
      return true;
    } catch (err) {
      console.error('Bulk update failed', err);
      alert(apiError(err, 'Could not update the selected products. Please try again.'));
      return false;
    }
  }

  async function handleEditCategory(id: string, data: CategoryFormData): Promise<boolean> {
    try {
      const res = await axios.put(`/admin/api/categories/${id}`, data);
      setCategories((prev) => prev.map((c) => (c.id === id ? res.data : c)));
      return true;
    } catch (err) {
      console.error('Failed to update category', err);
      alert(apiError(err, 'Could not save the category. Please try again.'));
      return false;
    }
  }

  async function handleAddCategory(data: CategoryFormData): Promise<boolean> {
    try {
      const res = await axios.post('/admin/api/categories', data);
      setCategories((prev) => [...prev, res.data]);
      return true;
    } catch (err) {
      console.error('Failed to add category', err);
      alert(apiError(err, 'Could not add the category. Please check the form and try again.'));
      return false;
    }
  }

  // Products filed under a deleted category are moved server-side; mirror that here so the list is right without a reload.
  async function handleDeleteCategory(id: string, moveTo?: string): Promise<boolean> {
    const gone = categories.find((c) => c.id === id);
    try {
      await axios.delete(`/admin/api/categories/${id}`, { data: { moveTo } });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (gone && moveTo) {
        setProducts((prev) => prev.map((p) => (p.collection === gone.slug ? { ...p, collection: moveTo } : p)));
      }
      return true;
    } catch (err) {
      console.error('Failed to delete category', err);
      alert(apiError(err, 'Could not delete the category. Please try again.'));
      return false;
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
      onToggleFeatured={handleToggleFeatured}
      onBulk={handleBulk}
      categories={categories}
      onAddCategory={handleAddCategory}
      onEditCategory={handleEditCategory}
      onDeleteCategory={handleDeleteCategory}
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
