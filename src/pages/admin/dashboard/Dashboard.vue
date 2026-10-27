<template>
  <div class="px-0">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 class="text-xl font-bold text-gray-800 dark:text-white">Inventory & Sales Dashboard</h1>
          <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">Real-time overview of products, sales, warehouses and
            inventory management</p>
        </div>
        <div
          class="flex flex-col sm:flex-row flex-wrap items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">

          <!-- Company filter -->
          <div>
            <select v-model="filters.companyId" class="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 
                  transition-all duration-150">
              <option value="">-- Select Company --</option>
              <option v-for="company in companies" :key="company.id" :value="company.id">
                {{ company.name }}
              </option>
            </select>
          </div>

          <!-- branch filter -->
          <div>
            <select v-model="filters.branchId" class="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 
                  transition-all duration-150">
              <option value="">-- Select Branch --</option>
              <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                {{ branch.name }}
              </option>
            </select>
          </div>


          <!-- Filter Controls -->
          <div class="relative">
            <input type="date" v-model="filters.startDate"
              class="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          </div>
          <span class="text-gray-500 dark:text-gray-400 text-xs">to</span>
          <div class="relative">
            <input type="date" v-model="filters.endDate"
              class="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          </div>
          <div class="flex items-center space-x-2">
            <button @click="applyFilters"
              class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors whitespace-nowrap">
              Apply
            </button>
            <button @click="resetFilters"
              class="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-lg transition-colors whitespace-nowrap">
              Reset
            </button>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            Last updated: {{ formatDate(currentTime) }}
            <button @click="refreshData" class="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              :disabled="loading">
              <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'" class="text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>


    <TableLoadingState v-if="loading" :is-loading="true" :total-items="false" :item-name="'dashboard'"
      loading-text="Loading dashboard..." loading-subtext="Fetching your dashboard data" />

    <!-- Error State -->
    <div v-else-if="error"
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <i class="fas fa-exclamation-circle text-red-500 mr-3"></i>
        <div>
          <p class="text-red-700 dark:text-red-400 font-medium">Failed to load dashboard data</p>
          <p class="text-red-600 dark:text-red-300 text-sm mt-1">{{ error }}</p>
          <button @click="fetchDashboardData"
            class="mt-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-900/50">
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Stats Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 mb-6">
        <!-- Total Companies -->
        <div v-if="widgets?.counters?.total_companies"
          class="bg-white dark:bg-gray-800 rounded-lg shadow dark:border dark:border-gray-700 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-600 dark:text-gray-400">Total Companies</p>
              <p class="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {{ widgets?.counters?.total_companies?.toLocaleString() || '0' }}
              </p>
            </div>
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <i class="fas fa-building text-blue-600 dark:text-blue-400"></i>
            </div>
          </div>
          <div class="mt-2 text-xs text-gray-500 text-gray-600 dark:text-gray-400">
            {{ widgets?.period == 'current_month' ? "This Month" : 'Selected period' }}
          </div>
        </div>

        <div v-if="widgets?.counters?.total_branches"
          class="bg-white dark:bg-gray-800 rounded-lg shadow dark:border dark:border-gray-700 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-600 dark:text-gray-400">Total Branch</p>
              <p class="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {{ widgets?.counters?.total_branches?.toLocaleString() || '0' }}
              </p>
            </div>
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <i class="fas fa-building text-blue-600 dark:text-blue-400"></i>
            </div>
          </div>
          <div class="mt-2 text-xs text-gray-500 text-gray-600 dark:text-gray-400">
            {{ widgets?.period == 'current_month' ? "This Month" : 'Selected period' }}
          </div>
        </div>

        <!-- Total Users -->
        <div v-if="widgets?.counters?.total_users"
          class="bg-white dark:bg-gray-800 rounded-lg shadow dark:border dark:border-gray-700 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p class="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                {{ widgets?.counters?.total_users?.toLocaleString() || '0' }}
              </p>
            </div>
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <i class="fas fa-users text-green-600 dark:text-green-400"></i>
            </div>
          </div>
          <div class="mt-2 text-xs text-gray-500 text-gray-600 dark:text-gray-400">
            {{ widgets?.period == 'current_month' ? "This Month" : 'Selected period' }}
          </div>
        </div>
        <!-- Total Transactions -->
        <div v-if="widgets?.counters?.total_transactions"
          class="bg-white dark:bg-gray-800 rounded-lg shadow dark:border dark:border-gray-700 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
              <p class="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {{ widgets?.counters?.total_transactions?.toLocaleString() || '0' }}
              </p>
            </div>
            <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <i class="fas fa-exchange-alt text-purple-600 dark:text-purple-400"></i>
            </div>
          </div>
          <div class="mt-2 text-xs text-gray-500 text-gray-600 dark:text-gray-400">
            {{ widgets?.period == 'current_month' ? "This Month" : 'Selected period' }}
          </div>
        </div>

        <!-- Total Deposits -->
        <div v-if="widgets?.counters?.total_income"
          class="bg-white dark:bg-gray-800 rounded-lg shadow dark:border dark:border-gray-700 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-600 dark:text-gray-400">Total Income</p>
              <p class="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                {{ formatCurrency(Math.abs(widgets?.counters?.total_income || 0)) }}
              </p>
            </div>
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <i class="fas fa-arrow-down text-green-600 dark:text-green-400"></i>
            </div>
          </div>

          <div class="mt-2 text-xs text-gray-500 text-gray-600 dark:text-gray-400">
            {{ widgets?.period == 'current_month' ? "This Month" : 'Selected period' }}
          </div>
        </div>

        <!-- Total Withdrawals -->
        <div v-if="widgets?.counters?.total_expenses"
          class="bg-white dark:bg-gray-800 rounded-lg shadow dark:border dark:border-gray-700 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-600 dark:text-gray-400">Total Expense</p>
              <p class="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                {{ formatCurrency(widgets?.counters?.total_expenses || 0) }}
              </p>
            </div>
            <div class="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <i class="fas fa-arrow-up text-red-600 dark:text-red-400"></i>
            </div>
          </div>
          <div class="mt-2 text-xs text-gray-500 text-gray-600 dark:text-gray-400">
            {{ widgets?.period == 'current_month' ? "This Month" : 'Selected period' }}
          </div>
        </div>

        <!-- Net Cash Flow -->
        <div v-if="widgets?.counters?.net_profit_loss"
          class="bg-white dark:bg-gray-800 rounded-lg shadow dark:border dark:border-gray-700 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-600 dark:text-gray-400">Net Profit/Loss</p>
              <h3 class="text-xl font-bold mt-1"
                :class="widgets?.counters?.net_profit_loss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ formatCurrency(widgets?.counters?.net_profit_loss || 0) }}
              </h3>
            </div>
            <div class="p-2"
              :class="widgets?.counters?.net_profit_loss >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'">
              <i
                :class="widgets?.counters?.net_profit_loss >= 0 ? 'fas fa-arrow-up text-green-600 dark:text-green-400' : 'fas fa-arrow-down text-red-600 dark:text-red-400'"></i>
            </div>
          </div>
          <div class="mt-2 text-xs text-gray-500 text-gray-600 dark:text-gray-400">
            {{ widgets?.period == 'current_month' ? "This Month" : 'Selected period' }}
          </div>
        </div>

        <div v-if="widgets?.counters?.current_cash_position"
          class="bg-white dark:bg-gray-800 rounded-lg shadow dark:border dark:border-gray-700 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-600 dark:text-gray-400">Current Cash Position</p>
              <h3 class="text-xl font-bold mt-1"
                :class="widgets?.counters?.current_cash_position >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                {{ formatCurrency(widgets?.counters?.current_cash_position || 0) }}
              </h3>
            </div>
            <div class="p-2"
              :class="widgets?.counters?.current_cash_position >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'">
              <i
                :class="widgets?.counters?.current_cash_position >= 0 ? 'fas fa-arrow-up text-green-600 dark:text-green-400' : 'fas fa-arrow-down text-red-600 dark:text-red-400'"></i>
            </div>
          </div>
          <div class="mt-2 text-xs text-gray-500 text-gray-600 dark:text-gray-400">
            {{ widgets?.period == 'current_month' ? "This Month" : 'Selected period' }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 align-top items-start">
        <div v-if="reports?.lists?.top_companies_by_volume">
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="p-5 border-b border-gray-200 dark:border-gray-700">
              <div class="flex justify-between items-center">
                <h2 class="font-semibold text-gray-800 dark:text-white">Top Companies by Volume</h2>
                <a href="/companies" class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                  View All <i class="fas fa-chevron-right ml-1 text-xs"></i>
                </a>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transactions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="company in reports?.lists?.top_companies_by_volume" :key="company.id">
                    <td class="px-4 py-1 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <img v-if="company.logo" :src="company.logo" alt="Company Logo"
                            class="h-10 w-10 rounded-full object-cover">
                          <img v-else class="h-10 w-10 rounded-full"
                            :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random&color=fff&size=128`"
                            alt="Company Avatar">
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900 dark:text-white">{{ company.name }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-1 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">{{ company.transaction_count }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div v-if="reports?.lists?.top_users_by_activity">
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="p-5 border-b border-gray-200 dark:border-gray-700">
              <div class="flex justify-between items-center">
                <h2 class="font-semibold text-gray-800 dark:text-white">Top Users by Activity</h2>
                <a href="/users" class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                  View All <i class="fas fa-chevron-right ml-1 text-xs"></i>
                </a>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transactions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="user in reports?.lists?.top_users_by_activity" :key="user.id">
                    <td class="px-4 py-1 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <img v-if="user.avatar" :src="user.avatar" alt="User Avatar"
                            class="h-10 w-10 rounded-full object-cover">
                          <img v-else class="h-10 w-10 rounded-full"
                            :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=128`"
                            alt="User Avatar">
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</div>
                          <div class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-1 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">{{ user.transaction_count }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- Transaction Count by Company (Pie Chart) -->
        <div v-if="companyChartData && companyChartData?.length > 0"
          class="bg-white dark:bg-gray-800 px-4 pt-5 pb-7 rounded-lg shadow xl:col-span-2 lg:col-span-2">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Transactions by Company
          </h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Pie Chart -->
            <div class="h-64">
              <canvas ref="companyChart"></canvas>
            </div>

            <!-- Legend & Stats -->
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div v-for="item in companyChartData" :key="item.company_id"
                  class="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: item.color }"></div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate" :title="item.company_name">
                      {{ item.company_name }}
                    </p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">
                      {{ item.transaction_count }} transactions ({{ item.percentage }}%)
                    </p>
                  </div>
                </div>
              </div>

              <!-- Total Transactions -->
              <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p class="text-sm text-blue-700 dark:text-blue-300">
                  <span class="font-semibold">Total Transactions:</span>
                  {{ calculateTotalTransactions() }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 align-top items-start">
        <div v-if="reports?.lists?.income_entries">
          <div
            class="bg-white  h-100 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="p-5 border-b border-gray-200 dark:border-gray-700">
              <div class="flex justify-between items-center">
                <h2 class="font-semibold text-gray-800 dark:text-white">Income Entries</h2>
                <a href="/incomes" class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                  View All <i class="fas fa-chevron-right ml-1 text-xs"></i>
                </a>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Income Entry
                    </th>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="income in reports?.lists?.income_entries" :key="income.id">
                    <td class="px-4 py-1 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">{{ income.reference_no ? "Ref. #" +
                        income.reference_no : '' }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ income.income_date ? "Date: " +
                        income.income_date : '' }}</div>
                    </td>
                    <td class="px-4 py-1 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">{{ income.amount }}</div>
                    </td>
                    <td class="px-4 py-1 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">{{ income.created_by }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ income.description ? "Description: " +
                        income.description : '' }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div v-if="reports?.lists?.expense_entries">
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="p-5 border-b border-gray-200 dark:border-gray-700">
              <div class="flex justify-between items-center">
                <h2 class="font-semibold text-gray-800 dark:text-white">Expense Entries</h2>
                <a href="/expenses" class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                  View All <i class="fas fa-chevron-right ml-1 text-xs"></i>
                </a>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expense Entry
                    </th>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="expense in reports?.lists?.expense_entries" :key="expense.id">
                    <td class="px-4 py-1 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">{{ expense.reference_no ? "Ref. #" +
                        expense.reference_no : '' }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ expense.expense_date ? "Date: " +
                        expense.expense_date : '' }}</div>
                    </td>
                    <td class="px-4 py-1 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">{{ expense.amount }}</div>
                    </td>
                    <td class="px-4 py-1 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">{{ expense.created_by }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ expense.description ? "Description: " +
                        expense.description : '' }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div v-if="reports?.lists?.personal_transactions">
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="p-5 border-b border-gray-200 dark:border-gray-700">
              <div class="flex justify-between items-center">
                <h2 class="font-semibold text-gray-800 dark:text-white">Personal Entries</h2>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction No
                    </th>
                    <th scope="col"
                      class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference No
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="trans in reports?.lists?.personal_transactions" :key="trans.id">
                    <td class="px-4 py-1 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">{{ trans.transaction_no ? trans.transaction_no
                        : '' }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ trans.type ? "Type: " + trans.type : ''
                      }}</div>
                    </td>
                    <td class="px-4 py-1 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-white">{{ trans.reference_no ? trans.reference_no : ''
                      }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{{ trans.transaction_date }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Top Accounts Used (Pie Chart) -->
        <div v-if="topAccountsChartData && topAccountsChartData?.length > 0"
          class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Top Accounts Used
          </h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div class="h-48">
              <canvas ref="topAccountsChart"></canvas>
            </div>

            <!-- Legend & Stats -->
            <div class="mt-3 space-y-2 max-h-40 overflow-y-auto">
              <div v-for="item in topAccountsChartData" :key="item.chart_of_account_id"
                class="flex items-center justify-between p-1.5 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                <div class="flex items-center min-w-0 flex-1">
                  <div class="w-2 h-2 rounded-full mr-1.5 flex-shrink-0" :style="{ backgroundColor: item.color }"></div>
                  <span class="text-gray-700 dark:text-gray-300 truncate" :title="item.chart_of_account_name">
                    {{ item.chart_of_account_name }}
                  </span>
                </div>
                <span class="text-gray-600 dark:text-gray-400 font-medium ml-2 flex-shrink-0">
                  {{ item.usage_count }} ({{ item.percentage }}%)
                </span>
              </div>

              <!-- Total Usage -->
              <div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mt-2">
                <p class="text-xs text-blue-700 dark:text-blue-300">
                  <span class="font-semibold">Total Usage:</span>
                  {{ calculateTotalAccountUsage() }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- Branch Expense Categories (Pie Chart) -->
        <div v-if="branchExpenseChartData && branchExpenseChartData?.length > 0"
          class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Branch Expense Categories
          </h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div class="h-48">
              <canvas ref="branchExpenseChart"></canvas>
            </div>

            <!-- Legend & Stats -->
            <div class="mt-3 space-y-2 max-h-40 overflow-y-auto">
              <div v-for="item in branchExpenseChartData" :key="item.chart_of_account_id"
                class="flex items-center justify-between p-1.5 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                <div class="flex items-center min-w-0 flex-1">
                  <div class="w-2 h-2 rounded-full mr-1.5 flex-shrink-0" :style="{ backgroundColor: item.color }"></div>
                  <span class="text-gray-700 dark:text-gray-300 truncate" :title="item.chart_of_account_name">
                    {{ item.chart_of_account_name }}
                  </span>
                </div>
                <span class="text-gray-600 dark:text-gray-400 font-medium ml-2 flex-shrink-0">
                  {{ formatCurrency(item.total_amount) }} ({{ item.percentage }}%)
                </span>
              </div>

              <!-- Total Expenses -->
              <div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mt-2">
                <p class="text-xs text-blue-700 dark:text-blue-300">
                  <span class="font-semibold">Total Expenses:</span>
                  {{ formatCurrency(calculateTotalBranchExpenses()) }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- Branch Income Categories (Pie Chart) -->
        <div v-if="branchIncomeChartData && branchIncomeChartData?.length > 0"
          class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Branch Income Categories
          </h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div class="h-48">
              <canvas ref="branchIncomeChart"></canvas>
            </div>

            <!-- Legend & Stats -->
            <div class="mt-3 space-y-2 max-h-40 overflow-y-auto">
              <div v-for="item in branchIncomeChartData" :key="item.chart_of_account_id"
                class="flex items-center justify-between p-1.5 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                <div class="flex items-center min-w-0 flex-1">
                  <div class="w-2 h-2 rounded-full mr-1.5 flex-shrink-0" :style="{ backgroundColor: item.color }"></div>
                  <span class="text-gray-700 dark:text-gray-300 truncate" :title="item.chart_of_account_name">
                    {{ item.chart_of_account_name }}
                  </span>
                </div>
                <span class="text-gray-600 dark:text-gray-400 font-medium ml-2 flex-shrink-0">
                  {{ formatCurrency(item.total_amount) }} ({{ item.percentage }}%)
                </span>
              </div>

              <!-- Total Income -->
              <div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mt-2">
                <p class="text-xs text-blue-700 dark:text-blue-300">
                  <span class="font-semibold">Total Income:</span>
                  {{ formatCurrency(calculateTotalBranchIncome()) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions Section -->
      <div class="mb-6 mt-5">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div>
            <!-- Header with Filters -->
            <div class="p-5 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <h1 class="text-sm sm:text-sm md:text-md lg:text-lg font-semibold text-gray-700 dark:text-white">Dashboard
                Analytics</h1>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
              <div class="text-center">
                <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                <p class="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
              </div>
            </div>

            <!-- Dashboard Content -->
            <div v-else class="space-y-3">
              <!-- Date Range Info -->
              <div v-if="dashboardData.date_range" class="bg-blue-50 dark:bg-blue-900/20 p-3 mx-5 mt-3 rounded-lg">
                <p class="text-sm text-blue-700 dark:text-blue-300">
                  <i class="fas fa-calendar-alt mr-2"></i>
                  Showing data from {{ formatDate(dashboardData.date_range.start_date) }} to {{
                    formatDate(dashboardData.date_range.end_date) }}
                </p>
              </div>


              <!-- Income vs Expenses Chart -->
              <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Income vs Expenses
                  </h2>

                  <!-- Chart Type Toggle -->
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-600 dark:text-gray-400">View:</span>
                    <div class="flex rounded-lg border border-gray-300 dark:border-gray-600">
                      <button @click="setIncomeExpenseView('daily')" :class="[
                        'px-3 py-1 text-xs font-medium rounded-l-lg transition-colors',
                        incomeExpenseView === 'daily'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      ]">
                        Daily
                      </button>
                      <button @click="setIncomeExpenseView('weekly')" :class="[
                        'px-3 py-1 text-xs font-medium rounded-r-lg transition-colors',
                        incomeExpenseView === 'weekly'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      ]">
                        Weekly
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Bar Chart -->
                <div class="h-80">
                  <canvas ref="incomeExpenseChart"></canvas>
                </div>



                <!-- Summary Stats -->
                <div
                  class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div class="text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
                    <p class="text-xl font-semibold text-green-600 dark:text-green-400">
                      {{ formatCurrency(calculateTotal('income')) }}
                    </p>
                  </div>
                  <div class="text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                    <p class="text-xl font-semibold text-red-600 dark:text-red-400">
                      {{ formatCurrency(calculateTotal('expense')) }}
                    </p>
                  </div>
                  <div class="text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Net Profit/Loss</p>
                    <p class="text-xl font-semibold" :class="getNetClass(calculateNet())">
                      {{ formatCurrency(calculateNet()) }}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import axiosClient from "@/axiosClient";
import TableLoadingState from '@/components/core/TableLoadingState.vue';
import { useCompanyStore } from '@/stores/companyStore.js';
import { useBranchStore } from '@/stores/branchStore.js';
import { useToast } from "vue-toastification";
import Chart from 'chart.js/auto';
import Breadcrumb from '@/components/core/Breadcrumb.vue';

// Initialize stores
const companyStore = useCompanyStore();
const branchStore = useBranchStore();
const toast = useToast();

const router = useRouter();

// Reactive data
const loading = ref(false);
const error = ref(null);
const currentTime = ref(new Date());

// Dashboard data structure
const dashboardData = ref({
  role: 'superadmin',
  period: 'current_month',
  date_range: {
    from_date: '',
    to_date: ''
  },
  graphs: {
    income_vs_expenses: {
      chart_type: 'bar',
      daily: [],
      weekly: []
    },
    transaction_count_by_company: {
      chart_type: 'pie',
      data: []
    }
  }
});

const widgets = ref({});
const reports = ref({});

// Filters
const filters = ref({
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  companyId: '',
  branchId: '',
  accountId: ''
});

// Pagination
const accountPage = ref(0);

// Period and selection states
const period = ref('current_month');
const selectedCompany = ref('');
const selectedBranch = ref('');

// Add these refs with your other chart refs
const topAccountsChart = ref(null);
const branchExpenseChart = ref(null);
const branchIncomeChart = ref(null);

// Add these chart instances with your other chart instances
let topAccountsChartInstance = null;
let branchExpenseChartInstance = null;
let branchIncomeChartInstance = null;

// Chart instances
const incomeExpenseChart = ref(null);
const companyChart = ref(null);
let incomeExpenseChartInstance = null;
let companyChartInstance = null;

// View state
const incomeExpenseView = ref('daily');

// Colors for charts
const chartColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6B7280', '#6366F1'
];

// Computed properties
const stats = computed(() => dashboardData.value.stats || {});
const displayedAccounts = computed(() => {
  return dashboardData.value.accounts || [];
});

const companies = computed(() => companyStore.items || []);
const branches = computed(() => branchStore.items || []);

const incomeExpenseData = computed(() => {
  const data = dashboardData.value.graphs?.income_vs_expenses;
  if (!data) return [];
  return incomeExpenseView.value === 'daily' ? data.daily || [] : data.weekly || [];
});

const companyChartData = computed(() => {
  const data = dashboardData.value.graphs?.transaction_count_by_company?.data || [];
  const total = data.reduce((sum, item) => sum + (item.transaction_count || 0), 0);

  return data.map((item, index) => ({
    ...item,
    color: chartColors[index % chartColors.length],
    percentage: total > 0 ? ((item.transaction_count / total) * 100).toFixed(1) : 0
  }));
});

// Watch for company changes
watch(() => filters.value.companyId, async (newVal) => {
  filters.value.branchId = '';
  if (!newVal) {
    // clear branches when no company is selected
    branchStore.items = [];
    filters.value.branchId = '';
    return;
  }
  await branchStore.getAll({ company_id: newVal });
});

// Watch for data changes to update charts
watch([incomeExpenseData, companyChartData, dashboardData], () => {
  nextTick(() => {
    setTimeout(() => {
      updateCharts();
    }, 100);
  });
}, { deep: true });

// Watch for view changes
watch(incomeExpenseView, () => {
  nextTick(() => {
    setTimeout(() => {
      updateCharts();
    }, 100);
  });
});

// Methods
const fetchDashboardData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const params = new URLSearchParams();
    if (filters.value.startDate) params.append('from_date', filters.value.startDate);
    if (filters.value.endDate) params.append('to_date', filters.value.endDate);
    if (filters.value.companyId) params.append('company_id', filters.value.companyId);
    if (filters.value.branchId) params.append('branch_id', filters.value.branchId);
    if (filters.value.accountId) params.append('account_id', filters.value.accountId);
    // if (period.value) params.append('period', period.value);

    const widgetsResponse = await axiosClient.get(`/dashboard/reports/counters?${params.toString()}`);
    widgets.value = widgetsResponse.data.data || {};

    const reportsResponse = await axiosClient.get(`/dashboard/reports/lists?${params.toString()}`);
    reports.value = reportsResponse.data.data || {};

    const graphsResponse = await axiosClient.get(`/dashboard/reports/graphs?${params.toString()}`);

    if (graphsResponse.data.success) {
      dashboardData.value = {
        role: graphsResponse.data.data.role,
        period: graphsResponse.data.data.period,
        date_range: graphsResponse.data.data.date_range,
        graphs: graphsResponse.data.data.graphs
      };
      console.log('Graphs data loaded:', dashboardData.value.graphs);
    }

    await companyStore.getAll();

    await nextTick();
    setTimeout(() => {
      updateCharts();
    }, 200);

  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    error.value = err.response?.data?.message || err.message || 'An error occurred';
    toast.error('Failed to load dashboard data');
  } finally {
    loading.value = false;
  }
};

const loadCompanies = async () => {
  try {
    await companyStore.getAll();
  } catch (error) {
    console.error('Error loading companies:', error);
    toast.error('Failed to load companies');
  }
};


const refreshData = () => {
  fetchDashboardData();
  toast.info('Refreshing dashboard data...');
};

const applyFilters = () => {
  accountPage.value = 0;
  fetchDashboardData();
};

const resetFilters = () => {
  filters.value = {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    companyId: '',
    branchId: '',
    accountId: ''
  };
  period.value = 'current_month';
  // clear loaded branches as company selection was reset
  branchStore.items = [];
  applyFilters();
  toast.success('Filters reset to default');
};

const changePeriod = (newPeriod) => {
  period.value = newPeriod;
  applyFilters();
};

const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};


const calculateTotal = (type) => {
  const data = incomeExpenseData.value;
  if (!data || data.length === 0) return 0;
  return data.reduce((sum, item) => sum + (item[type] || 0), 0);
};

const calculateNet = () => {
  return calculateTotal('income') - calculateTotal('expense');
};

const calculateTotalTransactions = () => {
  const data = dashboardData.value.graphs?.transaction_count_by_company?.data || [];
  return data.reduce((sum, item) => sum + (item.transaction_count || 0), 0);
};

const getNetClass = (value) => {
  return value >= 0
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';
};

const setIncomeExpenseView = (view) => {
  incomeExpenseView.value = view;
};

// Add these computed properties
const topAccountsChartData = computed(() => {
  const data = dashboardData.value.graphs?.top_accounts_used?.data || [];
  const total = data.reduce((sum, item) => sum + (item.usage_count || 0), 0);

  return data.map((item, index) => ({
    ...item,
    color: chartColors[index % chartColors.length],
    percentage: total > 0 ? ((item.usage_count / total) * 100).toFixed(1) : 0
  }));
});

const branchExpenseChartData = computed(() => {
  const data = dashboardData.value.graphs?.expense_categories?.data || [];
  const total = data.reduce((sum, item) => sum + (item.total_amount || 0), 0);

  return data.map((item, index) => ({
    ...item,
    color: chartColors[index % chartColors.length],
    percentage: total > 0 ? ((item.total_amount / total) * 100).toFixed(1) : 0
  }));
});

const branchIncomeChartData = computed(() => {
  const data = dashboardData.value.graphs?.income_categories?.data || [];
  const total = data.reduce((sum, item) => sum + (item.total_amount || 0), 0);

  return data.map((item, index) => ({
    ...item,
    color: chartColors[index % chartColors.length],
    percentage: total > 0 ? ((item.total_amount / total) * 100).toFixed(1) : 0
  }));
});

// Add these methods for calculations
const calculateTotalAccountUsage = () => {
  const data = dashboardData.value.graphs?.top_accounts_used?.data || [];
  return data.reduce((sum, item) => sum + (item.usage_count || 0), 0);
};

const calculateTotalBranchExpenses = () => {
  const data = dashboardData.value.graphs?.expense_categories?.data || [];
  return data.reduce((sum, item) => sum + (item.total_amount || 0), 0);
};

const calculateTotalBranchIncome = () => {
  const data = dashboardData.value.graphs?.income_categories?.data || [];
  return data.reduce((sum, item) => sum + (item.total_amount || 0), 0);
};

const updateCharts = () => {
  try {
    // Destroy all existing chart instances first
    if (incomeExpenseChartInstance) {
      incomeExpenseChartInstance.destroy();
      incomeExpenseChartInstance = null;
    }
    if (companyChartInstance) {
      companyChartInstance.destroy();
      companyChartInstance = null;
    }
    if (topAccountsChartInstance) {
      topAccountsChartInstance.destroy();
      topAccountsChartInstance = null;
    }
    if (branchExpenseChartInstance) {
      branchExpenseChartInstance.destroy();
      branchExpenseChartInstance = null;
    }
    if (branchIncomeChartInstance) {
      branchIncomeChartInstance.destroy();
      branchIncomeChartInstance = null;
    }

    // Create Income vs Expenses Chart - check if ref exists
    if (incomeExpenseChart.value) {
      const ctx = incomeExpenseChart.value.getContext('2d');
      if (ctx) {
        const data = incomeExpenseData.value;

        if (data && data.length > 0) {
          // Format labels based on view
          const labels = data.map(item => {
            if (incomeExpenseView.value === 'daily') {
              return formatDate(item.date);
            } else {
              return `Week of ${formatDate(item.week_start)}`;
            }
          });

          incomeExpenseChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [
                {
                  label: 'Income',
                  data: data.map(item => item.income || 0),
                  backgroundColor: 'rgba(16, 185, 129, 0.8)',
                  borderColor: 'rgb(16, 185, 129)',
                  borderWidth: 1
                },
                {
                  label: 'Expenses',
                  data: data.map(item => item.expense || 0),
                  backgroundColor: 'rgba(239, 68, 68, 0.8)',
                  borderColor: 'rgb(239, 68, 68)',
                  borderWidth: 1
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'top'
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.dataset.label || '';
                      const value = context.raw || 0;
                      return `${label}: ${formatCurrency(value)}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => formatCurrency(value)
                  }
                }
              }
            }
          });
        } else {
          // Show empty state
          ctx.clearRect(0, 0, incomeExpenseChart.value.width, incomeExpenseChart.value.height);
          ctx.font = '14px Arial';
          ctx.fillStyle = '#999';
          ctx.textAlign = 'center';
          ctx.fillText('No data available', incomeExpenseChart.value.width / 2, incomeExpenseChart.value.height / 2);
        }
      }
    }

    // Create Company Transaction Chart - check if ref exists
    if (companyChart.value) {
      const ctx = companyChart.value.getContext('2d');
      if (ctx) {
        const data = companyChartData.value;

        if (data && data.length > 0) {
          companyChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: data.map(item => item.company_name || 'Unknown'),
              datasets: [
                {
                  data: data.map(item => item.transaction_count || 0),
                  backgroundColor: data.map(item => item.color),
                  borderWidth: 1
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      const percentage = data[context.dataIndex]?.percentage || 0;
                      return `${label}: ${value} transactions (${percentage}%)`;
                    }
                  }
                }
              }
            }
          });
        } else {
          ctx.clearRect(0, 0, companyChart.value.width, companyChart.value.height);
          ctx.font = '14px Arial';
          ctx.fillStyle = '#999';
          ctx.textAlign = 'center';
          ctx.fillText('No data available', companyChart.value.width / 2, companyChart.value.height / 2);
        }
      }
    }

    // Create Top Accounts Chart - check if ref exists
    if (topAccountsChart.value) {
      const ctx = topAccountsChart.value.getContext('2d');
      if (ctx) {
        const data = topAccountsChartData.value;

        if (data && data.length > 0) {
          topAccountsChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: data.map(item => item.chart_of_account_name || 'Unknown'),
              datasets: [
                {
                  data: data.map(item => item.usage_count || 0),
                  backgroundColor: data.map(item => item.color),
                  borderWidth: 1
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      const percentage = data[context.dataIndex]?.percentage || 0;
                      return `${label}: ${value} uses (${percentage}%)`;
                    }
                  }
                }
              }
            }
          });
        } else {
          ctx.clearRect(0, 0, topAccountsChart.value.width, topAccountsChart.value.height);
          ctx.font = '14px Arial';
          ctx.fillStyle = '#999';
          ctx.textAlign = 'center';
          ctx.fillText('No data available', topAccountsChart.value.width / 2, topAccountsChart.value.height / 2);
        }
      }
    }

    // Create Branch Expense Chart - check if ref exists
    if (branchExpenseChart.value) {
      const ctx = branchExpenseChart.value.getContext('2d');
      if (ctx) {
        const data = branchExpenseChartData.value;

        if (data && data.length > 0) {
          branchExpenseChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: data.map(item => item.chart_of_account_name || 'Unknown'),
              datasets: [
                {
                  data: data.map(item => item.total_amount || 0),
                  backgroundColor: data.map(item => item.color),
                  borderWidth: 1
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      const percentage = data[context.dataIndex]?.percentage || 0;
                      return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                    }
                  }
                }
              }
            }
          });
        } else {
          ctx.clearRect(0, 0, branchExpenseChart.value.width, branchExpenseChart.value.height);
          ctx.font = '14px Arial';
          ctx.fillStyle = '#999';
          ctx.textAlign = 'center';
          ctx.fillText('No data available', branchExpenseChart.value.width / 2, branchExpenseChart.value.height / 2);
        }
      }
    }

    // Create Branch Income Chart - check if ref exists
    if (branchIncomeChart.value) {
      const ctx = branchIncomeChart.value.getContext('2d');
      if (ctx) {
        const data = branchIncomeChartData.value;

        if (data && data.length > 0) {
          branchIncomeChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
              labels: data.map(item => item.chart_of_account_name || 'Unknown'),
              datasets: [
                {
                  data: data.map(item => item.total_amount || 0),
                  backgroundColor: data.map(item => item.color),
                  borderWidth: 1
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      const percentage = data[context.dataIndex]?.percentage || 0;
                      return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                    }
                  }
                }
              }
            }
          });
        } else {
          ctx.clearRect(0, 0, branchIncomeChart.value.width, branchIncomeChart.value.height);
          ctx.font = '14px Arial';
          ctx.fillStyle = '#999';
          ctx.textAlign = 'center';
          ctx.fillText('No data available', branchIncomeChart.value.width / 2, branchIncomeChart.value.height / 2);
        }
      }
    }
  } catch (err) {
    console.error('Error rendering charts:', err);
    toast.error('Error rendering charts');
  }
};


// Lifecycle
onMounted(async () => {
  console.log('Component mounted');
  await loadCompanies();
  await fetchDashboardData();

  // Auto-refresh every 5 minutes
  const refreshInterval = setInterval(() => {
    if (!loading.value) {
      fetchDashboardData();
    }
  }, 5 * 60 * 1000);

  // Update current time every minute
  const timeInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 60000);

  // Cleanup intervals on component unmount
  onUnmounted(() => {
    clearInterval(refreshInterval);
    clearInterval(timeInterval);
    // Destroy chart instances
    if (incomeExpenseChartInstance) {
      incomeExpenseChartInstance.destroy();
    }
    if (companyChartInstance) {
      companyChartInstance.destroy();
    }
    if (topAccountsChartInstance) {
      topAccountsChartInstance.destroy();
    }
    if (branchExpenseChartInstance) {
      branchExpenseChartInstance.destroy();
    }
    if (branchIncomeChartInstance) {
      branchIncomeChartInstance.destroy();
    }
  });
});

</script>

<style scoped>
.dashboard-card {
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Custom scrollbar */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.dark .overflow-x-auto::-webkit-scrollbar-track {
  background: #374151;
}

.dark .overflow-x-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.dark .overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

.fa-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

canvas {
  max-width: 100%;
  height: auto !important;
}
</style>