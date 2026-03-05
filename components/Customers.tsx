import React, { useState } from 'react';
import { Customer, SaleRecord } from '../types';
import { Search, UserPlus, History, Award, X } from 'lucide-react';

interface CustomersProps {
  customers: Customer[];
  sales: SaleRecord[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'joinDate' | 'loyaltyPoints' | 'totalSpent'>) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, sales, onAddCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Filter customers
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCustomer(newCustomer);
    setNewCustomer({ name: '', phone: '', email: '' });
    setShowAddModal(false);
  };

  // Get customer history
  const customerHistory = selectedCustomer 
    ? sales.filter(s => s.customerId === selectedCustomer.id).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, phone, or email..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-900 bg-white placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
        >
          <UserPlus size={18} />
          Add Customer
        </button>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Loyalty Points</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{customer.name}</div>
                      <div className="text-xs text-slate-400">Joined {customer.joinDate.toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{customer.phone}</div>
                      <div className="text-xs text-slate-400">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium border border-amber-100">
                        <Award size={14} />
                        {customer.loyaltyPoints} pts
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      ₹{customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-slate-400 hover:text-amber-600 p-2 hover:bg-amber-50 rounded-lg transition-all"
                        title="View History"
                      >
                        <History size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Add New Customer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  value={newCustomer.email}
                  onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors">
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{selectedCustomer.name}</h3>
                <p className="text-sm text-slate-500">{selectedCustomer.email} • {selectedCustomer.phone}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex gap-4 mb-6">
                 <div className="flex-1 bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                    <p className="text-xs text-amber-600 font-semibold uppercase">Loyalty Points</p>
                    <p className="text-2xl font-bold text-amber-800">{selectedCustomer.loyaltyPoints}</p>
                 </div>
                 <div className="flex-1 bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                    <p className="text-xs text-emerald-600 font-semibold uppercase">Lifetime Value</p>
                    <p className="text-2xl font-bold text-emerald-800">₹{selectedCustomer.totalSpent.toFixed(2)}</p>
                 </div>
                 <div className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                    <p className="text-xs text-blue-600 font-semibold uppercase">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-800">{customerHistory.length}</p>
                 </div>
              </div>

              <h4 className="font-semibold text-slate-800 mb-4">Order History</h4>
              
              {customerHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                  No orders found for this customer.
                </div>
              ) : (
                <div className="space-y-3">
                  {customerHistory.map(sale => (
                    <div key={sale.id} className="bg-white border border-slate-100 p-4 rounded-xl hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-slate-600">
                          {new Date(sale.timestamp).toLocaleString()}
                        </span>
                        <span className="font-bold text-slate-800">₹{sale.total.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-slate-500">
                        {sale.items.map(item => (
                          <span key={item.id} className="mr-3">
                             {item.quantity}x {item.name}
                          </span>
                        ))}
                      </div>
                      {sale.pointsEarned && (
                        <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <Award size={12} />
                          Earned {sale.pointsEarned} pts
                        </div>
                      )}
                      {sale.pointsRedeemed && sale.pointsRedeemed > 0 && (
                        <div className="mt-1 text-xs text-amber-600 font-medium">
                          Redeemed {sale.pointsRedeemed} pts for discount
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;