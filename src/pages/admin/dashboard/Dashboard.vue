<template>
  <div class="px-0 transition-colors duration-500 bg-transparent">
    <div class="mb-8">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 mb-3">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-[10px] font-black tracking-[0.2em] text-emerald-600 dark:text-emerald-400 uppercase">Live Marketplace Terminal</span>
          </div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">eCommerce Nexus</h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Global sales and logistics ecosystem monitor.</p>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <div class="hidden md:flex flex-col text-right mr-4">
            <span class="text-[10px] font-black text-slate-400 uppercase">Total Revenue (MTD)</span>
            <span class="text-lg font-black text-slate-900 dark:text-white">$142,580.00</span>
          </div>
          <button class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/10">
            Export Report
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="stat in ecommerceStats" :key="stat.label" 
           class="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group hover:border-indigo-500/50 transition-all">
        <div class="relative z-10">
          <div :class="`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.bgClass}`">
            <i :class="`${stat.icon} ${stat.iconClass}`"></i>
          </div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{{ stat.label }}</p>
          <div class="flex items-center gap-2">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{{ stat.value }}</h3>
            <span :class="`text-[10px] font-bold ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`">
              {{ stat.trend }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
      <div class="lg:col-span-8 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8">
        <div class="flex items-center justify-between mb-10">
          <div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">Category Sales Weight</h2>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Product Distribution Analysis</p>
          </div>
          <select class="bg-slate-100 dark:bg-white/5 border-none rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none">
            <option>Last 30 Days</option>
            <option>Q1 Growth</option>
          </select>
        </div>
        
        <div class="space-y-8">
          <div v-for="cat in categoryPerformance" :key="cat.name">
            <div class="flex justify-between items-center mb-3">
              <span class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{{ cat.name }}</span>
              <div class="text-right">
                <span class="text-sm font-black text-slate-900 dark:text-white">${{ cat.sales }}k</span>
                <span class="text-[10px] text-slate-400 ml-2">({{ cat.share }}%)</span>
              </div>
            </div>
            <div class="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full">
              <div :class="`h-full rounded-full transition-all duration-1000 ${cat.color}`" :style="{ width: cat.share + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-4 flex flex-col gap-6">
        <div class="bg-slate-900 rounded-[2.5rem] p-8 text-white flex-grow relative overflow-hidden group">
          <div class="absolute -right-4 -bottom-4 opacity-10">
            <i class="fas fa-shipping-fast text-9xl"></i>
          </div>
          <h3 class="text-lg font-black tracking-tight mb-6">Order Pipeline</h3>
          <div class="space-y-6 relative z-10">
            <div v-for="pipe in logisticsPipeline" :key="pipe.status" class="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <div class="flex items-center gap-3">
                <span :class="`w-2 h-2 rounded-full ${pipe.color}`"></span>
                <span class="text-xs font-bold uppercase tracking-widest text-slate-300">{{ pipe.status }}</span>
              </div>
              <span class="text-sm font-black">{{ pipe.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden">
      <div class="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
        <h2 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">Recent High-Value Orders</h2>
        <div class="flex gap-2">
           <button class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all"><i class="fas fa-search text-xs"></i></button>
           <button class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all"><i class="fas fa-filter text-xs"></i></button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] bg-slate-50/50 dark:bg-white/5">
              <th class="px-8 py-5 text-left">Order Reference</th>
              <th class="px-8 py-5 text-left">Customer</th>
              <th class="px-8 py-5 text-left">Fulfillment</th>
              <th class="px-8 py-5 text-left">Total Amount</th>
              <th class="px-8 py-5 text-left">Logistics</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-white/5">
            <tr v-for="order in orders" :key="order.id" class="group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
              <td class="px-8 py-6">
                <p class="text-sm font-black text-slate-900 dark:text-white">ORD-{{ order.id }}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{{ order.date }}</p>
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-600">
                    {{ order.customerInitials }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ order.customer }}</p>
                    <p class="text-[10px] text-slate-400">{{ order.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <span :class="`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${order.statusClass}`">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-8 py-6 font-black text-sm text-slate-900 dark:text-white">
                ${{ order.amount }}
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center gap-2">
                  <i class="fas fa-truck text-xs text-slate-300"></i>
                  <span class="text-xs font-bold text-slate-500">{{ order.courier }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// eCommerce KPI Stats
const ecommerceStats = [
  { label: 'Net Revenue', value: '$84,250', trend: '+12.5%', trendUp: true, icon: 'fas fa-wallet', bgClass: 'bg-indigo-500/10', iconClass: 'text-indigo-600' },
  { label: 'Active Orders', value: '1,420', trend: '+5.2%', trendUp: true, icon: 'fas fa-shopping-bag', bgClass: 'bg-emerald-500/10', iconClass: 'text-emerald-600' },
  { label: 'Avg. Order Value', value: '$158.40', trend: '-2.1%', trendUp: false, icon: 'fas fa-chart-pie', bgClass: 'bg-cyan-500/10', iconClass: 'text-cyan-600' },
  { label: 'Customer LTV', value: '$2,480', trend: '+8.4%', trendUp: true, icon: 'fas fa-users', bgClass: 'bg-amber-500/10', iconClass: 'text-amber-600' }
];

// Logistics & Pipeline
const logisticsPipeline = [
  { status: 'Processing', count: 142, color: 'bg-indigo-500' },
  { status: 'Awaiting Pickup', count: 85, color: 'bg-amber-500' },
  { status: 'In Transit', count: 214, color: 'bg-emerald-500' },
  { status: 'Delivered', count: 1240, color: 'bg-slate-400' }
];

// Category Sales Data
const categoryPerformance = [
  { name: 'Electronics', sales: 42.5, share: 45, color: 'bg-indigo-500' },
  { name: 'Fashion & Apparel', sales: 28.2, share: 30, color: 'bg-cyan-500' },
  { name: 'Home Appliances', sales: 14.1, share: 15, color: 'bg-emerald-500' },
  { name: 'Other', sales: 9.4, share: 10, color: 'bg-slate-300' }
];

// Orders Table Static Data
const orders = [
  { id: '8842', date: '14 Apr 2026', customer: 'Sharif Uddin', customerInitials: 'SU', email: 'sharif@dev.io', amount: '1,240.00', status: 'Delivered', statusClass: 'bg-emerald-500/10 text-emerald-600', courier: 'DHL Express' },
  { id: '8841', date: '14 Apr 2026', customer: 'Alex Rivera', customerInitials: 'AR', email: 'alex@company.com', amount: '450.00', status: 'In Transit', statusClass: 'bg-indigo-500/10 text-indigo-600', courier: 'FedEx' },
  { id: '8840', date: '13 Apr 2026', customer: 'Sarah Chen', customerInitials: 'SC', email: 'sarah@design.co', amount: '2,800.00', status: 'Processing', statusClass: 'bg-amber-500/10 text-amber-600', courier: 'UPS' }
];
</script>