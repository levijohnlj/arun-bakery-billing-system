import { FC, useState, useMemo } from 'react';
import { Product, CartItem, Customer } from '../types';
import { Search, Plus, Minus, CreditCard, CheckCircle, ShoppingBag, User, X, Award, Smartphone, Banknote } from 'lucide-react';
import { SHOP_QR_CODE_URL } from '../constants';

interface BillingProps {
  products: Product[];
  customers: Customer[];
  onCompleteSale: (items: CartItem[], total: number, customerId?: string, pointsRedeemed?: number, discountAmount?: number) => void;
}

type PaymentMethod = 'CASH' | 'UPI' | null;

const Billing: FC<BillingProps> = ({ products, customers, onCompleteSale }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return [];
    return customers.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.phone.includes(customerSearch)
    );
  }, [customers, customerSearch]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Loyalty Logic: Redeem 50 points for ₹50 off.
  const canRedeem = selectedCustomer && selectedCustomer.loyaltyPoints >= 50;
  const discountAmount = isRedeeming && canRedeem ? Math.min(subtotal, 50) : 0;
  const pointsToRedeem = isRedeeming && canRedeem ? 50 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleProceedToPayment = () => {
    if (cart.length === 0) return;
    setCheckoutStep('payment');
  };

  const handleConfirmPayment = () => {
    onCompleteSale(cart, finalTotal, selectedCustomer?.id, pointsToRedeem, discountAmount);
    setCheckoutStep('success');
    setTimeout(() => {
      setCart([]);
      setSelectedCustomer(null);
      setIsRedeeming(false);
      setCustomerSearch('');
      setCheckoutStep('cart');
      setPaymentMethod(null);
    }, 2500);
  };

  if (checkoutStep === 'success') {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-in text-center p-8">
        <div className="bg-emerald-100 p-6 rounded-full text-emerald-600 mb-6 animate-scale-up">
          <CheckCircle size={64} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
        <p className="text-slate-500 mb-4">Transaction recorded securely.</p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 max-w-xs w-full">
            <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-bold text-slate-800">₹{finalTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-slate-500">Method</span>
                <span className="font-medium text-slate-800">{paymentMethod === 'UPI' ? 'UPI / GPay' : 'Cash'}</span>
            </div>
        </div>
      </div>
    );
  }

  // Payment Selection Screen
  if (checkoutStep === 'payment') {
      return (
          <div className="h-full flex flex-col items-center justify-center animate-fade-in p-4">
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-slate-800">Select Payment Method</h2>
                      <button onClick={() => setCheckoutStep('cart')} className="text-slate-400 hover:text-slate-600">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="text-center mb-8">
                      <p className="text-slate-500 text-sm mb-1">Total Payable Amount</p>
                      <h1 className="text-4xl font-bold text-slate-900">₹{finalTotal.toFixed(2)}</h1>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                      <button 
                          onClick={() => setPaymentMethod('CASH')}
                          className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                              paymentMethod === 'CASH' ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                          }`}
                      >
                          <Banknote size={32} />
                          <span className="font-semibold">Cash</span>
                      </button>
                      <button 
                          onClick={() => setPaymentMethod('UPI')}
                          className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                              paymentMethod === 'UPI' ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                          }`}
                      >
                          <Smartphone size={32} />
                          <span className="font-semibold">UPI / GPay</span>
                      </button>
                  </div>

                  {paymentMethod === 'UPI' && (
                      <div className="mb-8 text-center bg-slate-50 p-6 rounded-xl border border-slate-200 animate-fade-in">
                          <p className="text-sm text-slate-500 mb-4">Scan QR to Pay</p>
                          <div className="w-40 h-40 bg-white p-2 rounded-lg shadow-sm mx-auto mb-4">
                              <img src={SHOP_QR_CODE_URL} alt="Shop UPI QR" className="w-full h-full object-contain" />
                          </div>
                          <p className="text-xs text-slate-400">Accepted: GPay, Paytm, PhonePe</p>
                      </div>
                  )}

                  <button 
                      onClick={handleConfirmPayment}
                      disabled={!paymentMethod}
                      className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                      {paymentMethod === 'UPI' ? 'Confirm Payment Received' : 'Complete Cash Sale'}
                  </button>
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6 md:gap-8 pb-20 md:pb-0">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="mb-4 md:mb-6 relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 overflow-y-auto pr-1 pb-2">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`p-3 md:p-4 rounded-xl border text-left transition-all relative group ${
                product.stock <= 0 
                  ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed' 
                  : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-sm active:scale-[0.98]'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{product.category}</span>
                <span className="font-bold text-slate-700">₹{product.price.toFixed(2)}</span>
              </div>
              <h4 className="font-medium text-slate-800 mb-1 truncate text-sm md:text-base">{product.name}</h4>
              <p className={`text-xs ${product.stock < 10 ? 'text-red-500' : 'text-slate-400'}`}>
                {product.stock} {product.unit} left
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Sidebar (Desktop: Static, Mobile: Bottom Sheet logic could go here, but for now just stacking) */}
      <div className="w-full md:w-96 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0 h-[40vh] md:h-auto">
        {/* Customer Section */}
        <div className="p-3 md:p-4 border-b border-slate-100 bg-slate-50/80">
          {!selectedCustomer ? (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Find Customer (Name/Phone)" 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-slate-900 bg-white"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
              {customerSearch && filteredCustomers.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 z-20 max-h-48 overflow-y-auto">
                  {filteredCustomers.map(c => (
                    <button 
                      key={c.id}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm"
                      onClick={() => {
                        setSelectedCustomer(c);
                        setCustomerSearch('');
                      }}
                    >
                      <div className="font-medium text-slate-800">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.phone} • {c.loyaltyPoints} pts</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
              <div>
                <div className="text-sm font-bold text-slate-800">{selectedCustomer.name}</div>
                <div className="text-xs text-amber-600 font-medium flex items-center gap-1">
                  <Award size={12} /> {selectedCustomer.loyaltyPoints} Points
                </div>
              </div>
              <button onClick={() => { setSelectedCustomer(null); setIsRedeeming(false); }} className="text-slate-400 hover:text-red-500">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Current Order Header */}
        <div className="p-3 border-b border-slate-100 bg-white">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
            <CreditCard size={16} /> Order Details
          </h3>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
              <ShoppingBag size={32} className="mb-2 opacity-50" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-slate-800">{item.name}</h4>
                  <div className="text-xs text-slate-500">₹{item.price.toFixed(2)} x {item.quantity}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-medium text-sm w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <div className="font-bold text-sm text-slate-700 min-w-[3rem] text-right">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals Section */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          {selectedCustomer && selectedCustomer.loyaltyPoints >= 50 && cart.length > 0 && (
             <div className="mb-3 flex items-center justify-between bg-amber-50 p-2 rounded-lg border border-amber-100">
               <div className="flex items-center gap-2">
                 <input 
                    type="checkbox" 
                    id="redeem"
                    checked={isRedeeming}
                    onChange={(e) => setIsRedeeming(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                 />
                 <label htmlFor="redeem" className="text-xs font-medium text-amber-800 cursor-pointer">
                    Redeem 50 pts (₹50 off)
                 </label>
               </div>
             </div>
          )}

          <div className="space-y-1 mb-3">
            <div className="flex justify-between items-center text-slate-500 text-xs">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-600 text-xs font-medium">
                <span>Discount</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-slate-800 font-bold">Total</span>
              <span className="text-xl font-bold text-slate-900">₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            onClick={handleProceedToPayment}
            disabled={cart.length === 0}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;