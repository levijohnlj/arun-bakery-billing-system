import React, { useState, useEffect } from 'react';
import {
  signIn as supabaseSignIn,
  signOut as supabaseSignOut,
  supabase,
  getUser,
  getProducts,
  getSales,
  getCustomers,
  addProduct as apiAddProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
  addCustomer as apiAddCustomer,
  createSale as apiCreateSale
} from './services/supabaseService';
import { ViewState, Product, SaleRecord, CartItem, Customer, DailyStat } from './types';
import { MOCK_DAILY_STATS } from './constants';
import { Analytics } from '@vercel/analytics/react';

import Dashboard from './components/Dashboard';
import Billing from './components/Billing';
import Inventory from './components/Inventory';
import Customers from './components/Customers';
import Layout from "./components/Layout";

import { Lock, User, Loader2 } from 'lucide-react';

// Login Component
const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!supabase) {
        setError('Database connection not configured. Please check environment variables.');
        setLoading(false);
        return;
      }

      const { error } = await supabaseSignIn(username, password);
      if (error) {
        setError(error.message || 'Authentication failed.');
        setLoading(false);
        return;
      }
      onLogin();

    } catch (err: any) {
      setError(err?.message || 'Unexpected error during authentication.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-amber-500 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-amber-200">
            <Lock className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-1">Secure Admin Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
              <input
                type="email"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-slate-900 bg-white placeholder-slate-300"
                placeholder="Enter email"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-slate-900 bg-white placeholder-slate-300"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Dynamic stats derived from interactions
  const [notificationCount, setNotificationCount] = useState(0);

  // Check Auth on Mount
  useEffect(() => {
    getUser().then(({ data }) => {
      if (data.user) {
        setIsLoggedIn(true);
      }
    });
  }, []);

  // Fetch Data when Logged In
  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [prods, sls, custs] = await Promise.all([
        getProducts(),
        getSales(),
        getCustomers()
      ]);
      setProducts(prods);
      setSales(sls);
      setCustomers(custs);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Calculate notifications based on low stock
    const lowStock = products.filter(p => p.stock <= p.minStock).length;
    setNotificationCount(lowStock);
  }, [products]);

  const handleCompleteSale = async (items: CartItem[], total: number, customerId?: string, pointsRedeemed: number = 0, discountAmount: number = 0) => {
    try {
      const pointsEarned = Math.floor(total);

      const newSale: SaleRecord = {
        id: '', // Will be generated by DB
        timestamp: new Date(),
        items,
        total,
        customerId,
        pointsEarned,
        pointsRedeemed,
        discountAmount
      };

      await apiCreateSale(newSale);

      // Refresh Data to ensure consistency
      await fetchData();

    } catch (error) {
      console.error("Sale failed:", error);
      alert("Failed to process sale. Please try again.");
    }
  };

  const handleAddCustomer = async (customerData: Omit<Customer, 'id' | 'joinDate' | 'loyaltyPoints' | 'totalSpent'>) => {
    try {
      await apiAddCustomer(customerData);
      await fetchData();
    } catch (error) {
      console.error("Failed to add customer:", error);
      alert("Failed to add customer.");
    }
  };

  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      await apiAddProduct(productData);
      await fetchData();
    } catch (error: any) {
      console.error("Failed to add product:", error);
      const msg = error?.message || error?.error_description || JSON.stringify(error);
      alert(`Failed to add product.\n\nError: ${msg}\n\nCheck the browser console (F12) for details.`);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      await apiUpdateProduct(updatedProduct);
      await fetchData();
    } catch (error: any) {
      console.error("Failed to update product:", error);
      const msg = error?.message || error?.error_description || JSON.stringify(error);
      alert(`Failed to update product.\n\nError: ${msg}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await apiDeleteProduct(productId);
      await fetchData();
    } catch (error: any) {
      console.error("Failed to delete product:", error);
      const msg = error?.message || error?.error_description || JSON.stringify(error);
      alert(`Failed to delete product.\n\nError: ${msg}`);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  if (isLoadingData && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-amber-500" size={48} />
          <p className="text-slate-500 font-medium">Loading Bakery Data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Layout
        currentView={currentView}
        onChangeView={setCurrentView}
        onLogout={async () => {
          try {
            if (supabase) await supabaseSignOut();
          } catch (err) {
            console.warn('Supabase sign-out failed:', err);
          }
          setIsLoggedIn(false);
        }}
        notificationCount={notificationCount}
      >
        {currentView === ViewState.DASHBOARD && (
          <Dashboard sales={sales} products={products} dailyStats={MOCK_DAILY_STATS} />
        )}
        {currentView === ViewState.BILLING && (
          <Billing
            products={products}
            customers={customers}
            onCompleteSale={handleCompleteSale}
          />
        )}
        {currentView === ViewState.CUSTOMERS && (
          <Customers
            customers={customers}
            sales={sales}
            onAddCustomer={handleAddCustomer}
          />
        )}
        {currentView === ViewState.INVENTORY && (
          <Inventory
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
      </Layout>
      <Analytics />
    </>
  );
};

export default App;