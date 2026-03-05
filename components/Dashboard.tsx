import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingBag, AlertTriangle, Sparkles, Loader2, IndianRupee, Clock } from 'lucide-react';
import { SaleRecord, Product, DailyStat } from '../types';
import { generateBakeryInsights } from '../services/geminiService';

// Helper for minimal markdown parsing (bolding)
const MarkdownText = ({ content }: { content: string }) => {
  const parts = content.split(/(\*\*.*?\*\*)/g);
  return (
    <div className="whitespace-pre-wrap text-slate-600 text-sm leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-slate-800 font-semibold">{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </div>
  );
};

interface DashboardProps {
  sales: SaleRecord[];
  products: Product[];
  dailyStats: DailyStat[];
}

const Dashboard: React.FC<DashboardProps> = ({ sales, products, dailyStats }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = sales.length;
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const handleGenerateInsight = async () => {
    setLoadingInsight(true);
    const result = await generateBakeryInsights(products, sales, totalRevenue);
    setInsight(result);
    setLoadingInsight(false);
  };

  const StatCard = ({ title, value, sub, icon: Icon, colorClass, bgClass }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
          {sub && <p className={`text-xs mt-2 font-medium ${colorClass}`}>{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bgClass}`}>
          <Icon className={colorClass} size={22} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toFixed(2)}`}
          sub="+12% from yesterday"
          icon={IndianRupee}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
        <StatCard
          title="Orders Today"
          value={totalOrders}
          sub="3 Pending"
          icon={ShoppingBag}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          sub={lowStockCount > 0 ? "Restock needed" : "Inventory healthy"}
          icon={AlertTriangle}
          colorClass={lowStockCount > 0 ? "text-amber-600" : "text-slate-400"}
          bgClass={lowStockCount > 0 ? "bg-amber-50" : "bg-slate-50"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-96">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-800">Weekly Sales Trend</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span> Sales (₹)
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStats}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value}`, 'Sales']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Section */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col relative overflow-hidden h-96">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-amber-500 rounded-full opacity-20 blur-3xl"></div>

          <div className="flex items-center justify-between mb-4 z-10">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="text-amber-400" size={18} />
              AI Assistant
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto z-10 mb-4">
            {loadingInsight ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="animate-spin text-amber-500" size={24} />
                <span className="text-sm">Analyzing sales patterns...</span>
              </div>
            ) : insight ? (
              <div className="animate-fade-in">
                <MarkdownText content={insight} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-slate-400 text-sm p-4">
                Generate a daily report to get actionable insights on your sales and inventory.
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateInsight}
            disabled={loadingInsight}
            className="w-full bg-white text-slate-900 py-3 rounded-xl font-medium text-sm hover:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed transition-colors z-10 flex items-center justify-center gap-2"
          >
            {loadingInsight ? 'Thinking...' : 'Generate Daily Report'}
          </button>
        </div>
      </div>

      {/* Daily Sales Transaction List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-slate-400">No sales recorded today yet.</td></tr>
              ) : (
                sales.slice(0, 10).map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Clock size={14} className="text-slate-400" />
                        {sale.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-800 font-medium">
                        {sale.items.length} items
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[200px]">
                        {sale.items.map(i => i.name).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {sale.customerId ? 'Registered Customer' : 'Walk-in Customer'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-slate-800">
                      ₹{sale.total.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;