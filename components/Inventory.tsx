import React, { useState } from 'react';
import { Product } from '../types';
import { ArrowUpDown, AlertCircle, Plus, X, Pencil, Trash2 } from 'lucide-react';

interface InventoryProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

type SortField = 'name' | 'profit' | 'stock' | 'price';

const Inventory: React.FC<InventoryProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [sortField, setSortField] = useState<SortField>('profit');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    unit: 'pcs'
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', price: '', cost: '', stock: '', minStock: '', unit: 'pcs' });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      cost: product.cost.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      unit: product.unit
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      onDeleteProduct(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      unit: formData.unit
    };

    if (editingId) {
      onUpdateProduct({ ...productData, id: editingId });
    } else {
      onAddProduct(productData);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const sortedProducts = [...products].sort((a, b) => {
    const profitA = a.price - a.cost;
    const profitB = b.price - b.cost;
    
    let valA: number | string = 0;
    let valB: number | string = 0;

    switch (sortField) {
      case 'name': valA = a.name; valB = b.name; break;
      case 'stock': valA = a.stock; valB = b.stock; break;
      case 'price': valA = a.price; valB = b.price; break;
      case 'profit': valA = profitA; valB = profitB; break;
    }

    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const TableHeader = ({ field, label }: { field: SortField, label: string }) => (
    <th 
      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={12} className={sortField === field ? 'text-amber-500' : 'text-slate-300'} />
      </div>
    </th>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Menu & Stock List</h3>
          <p className="text-sm text-slate-500">Manage your product offerings and inventory levels.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="w-full md:w-auto bg-slate-900 text-white px-5 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <TableHeader field="name" label="Product" />
                <TableHeader field="stock" label="Stock Level" />
                <TableHeader field="price" label="Price" />
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Cost</th>
                <TableHeader field="profit" label="Profit / Unit" />
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedProducts.map((product) => {
                const profit = product.price - product.cost;
                const margin = ((profit / product.price) * 100).toFixed(0);
                const isLowStock = product.stock <= product.minStock;

                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{product.name}</span>
                        <span className="text-xs text-slate-400">{product.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-mono text-sm ${isLowStock ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                        {product.stock}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">{product.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">₹{product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-slate-400 hidden md:table-cell">₹{product.cost.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-emerald-600">+₹{profit.toFixed(2)}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium hidden sm:inline-block">
                          {margin}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isLowStock ? (
                        <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
                          <AlertCircle size={14} />
                          <span className="text-xs font-medium hidden sm:inline">Low Stock</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                          <span className="text-xs hidden sm:inline">OK</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(product.id, product.name)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Masala Chai"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 bg-white"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Beverage"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 bg-white"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unit</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white text-slate-900"
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                  >
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="cups">Cups</option>
                    <option value="box">Box</option>
                  </select>
                </div>
                
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Selling Price (₹)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 bg-white"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cost Price (₹)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 bg-white"
                    value={formData.cost}
                    onChange={e => setFormData({...formData, cost: e.target.value})}
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Stock</label>
                  <input 
                    type="number" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 bg-white"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Alert Level</label>
                  <input 
                    type="number" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 bg-white"
                    value={formData.minStock}
                    onChange={e => setFormData({...formData, minStock: e.target.value})}
                  />
                </div>

                <div className="col-span-2 pt-4">
                  <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-md">
                    {editingId ? 'Update Item' : 'Add Item to Menu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;