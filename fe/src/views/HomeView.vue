<template>
  <div class="dashboard">
    <!-- SIDEBAR -->
    <Sidebar :is-open="isModalOpen" @close-sidebar="handleCloseSidebar" />
    <!-- MAIN -->
    <div class="main">
      <!-- TOPBAR -->
      <Header @open-sidebar="handleOpenSidebar" />
      <!-- CONTENT -->
      <div class="content">
        <!-- STATS -->
        <div class="stats">
          <div class="card">
            <p>Balance</p>
            <h3 :class="{ negative: balance < 0, positive: balance > 0 }">
              {{ formatCurrencyAmount(balance) }}
            </h3>
          </div>

          <div class="card">
            <p>Income</p>
            <h3 :class="{ negative: income < 0, positive: income > 0 }">
              {{ formatCurrencyAmount(income) }}
            </h3>
          </div>

          <div class="card">
            <p>-Expenses</p>
            <h3 :class="{ negative: expense < 0, positive: expense > 0 }">
              {{ formatCurrencyAmount(expense) }}
            </h3>
          </div>

          <div class="card">
            <p>Savings Rate</p>
            <h3
              :class="{
                negative: savingsRate !== null && savingsRate < 0,
                positive: savingsRate !== null && savingsRate > 0,
              }"
            >
              {{ formatSavingsRate(savingsRate) }}
            </h3>
          </div>
        </div>

        <!-- CHART + TRANSACTIONS -->
        <div class="grid">
          <TransactionsChart :transactions="transactions" />

          <!-- TRANSACTIONS -->
          <div class="card large">
            <h3>Recent Transactions</h3>
            <TransactionList :transactions="transactions" :edit="false" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Transaction } from '../components/services/transactionService'
import { fetchTransactions } from '../components/services/transactionService'
import TransactionList from '../components/parts/transactionList.vue'
import TransactionsChart from '../components/parts/TransactionsChart.vue'
import Sidebar from '@/components/parts/sidebar.vue'
import Header from '@/components/parts/header.vue'
import { formatCurrencyAmount } from '@/utils/appPreferences'

const apiUrl = import.meta.env.VITE_API_URL

const isModalOpen = ref(false)

const handleOpenSidebar = () => {
  isModalOpen.value = true
}

const handleCloseSidebar = () => {
  isModalOpen.value = false
}

const balance = ref(0)
const income = ref(0)
const expense = ref(0)
const savings = computed(() => income.value - expense.value)
const savingsRate = computed<number | null>(() => {
  if (income.value === 0) {
    return null
  }

  return (savings.value / income.value) * 100
})

const formatSavingsRate = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) {
    return '—'
  }

  return `${Math.round(value)}%`
}

const transactions = ref<Transaction[]>([])

const loadTransactions = async () => {
  try {
    transactions.value = await fetchTransactions()
  } catch (err: unknown) {
    console.error('Error loading transactions:', err)
  }
}

async function fetchBalance() {
  try {
    const response = await fetch(`${apiUrl}/getBalance`, {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch balance')
    }

    const data = await response.json()
    balance.value = Number(data.balance) || 0
    income.value = Number(data.total_income) || 0
    expense.value = Number(data.total_expense) || 0
  } catch (error) {
    console.error('Error fetching balance:', error)
  }
}

onMounted(() => {
  fetchBalance()
  loadTransactions()
})
</script>

<style scoped>
/* ========== BASE LAYOUT ========== */
/* Close button (hidden on desktop) */

/* Show only on mobile */

.dashboard {
  display: flex;
  min-height: 100vh;
  background: var(--app-bg);
  color: var(--app-text);
  font-family: system-ui, sans-serif;
}

/* LOGOUT */
.logout {
  margin-top: auto;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #ef4444;
  color: white;
  cursor: pointer;
}

/* ========== MAIN ========== */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* MENU BUTTON */

/* CONTENT */
.content {
  padding: 30px;
}

/* STATS */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: var(--surface-1);
  border-radius: 14px;
  padding: 20px;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 30px var(--shadow-color);
}

.card p {
  color: var(--text-muted);
}

.card h3 {
  margin-top: 10px;
  color: var(--heading-color);
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

/* TRANSACTIONS */
.transactions {
  list-style: none;
  padding: 0;
  margin-top: 15px;
}

.transactions li {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
}

.amount {
  font-weight: 600;
}

.positive {
  color: var(--income-color);
}

.negative {
  color: var(--expense-color);
}

/* ========== RESPONSIVE ========== */

/* MOBILE LAYOUT */
@media (max-width: 768px) {
  .dashboard {
    flex-direction: column;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 1000;
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .content {
    padding: 20px;
  }

  .topbar {
    padding: 15px 20px;
  }
}

/* TABLET */
@media (max-width: 1024px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* MOBILE STATS */
@media (max-width: 600px) {
  .stats {
    grid-template-columns: 1fr;
  }
}

/* STACK GRID */
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
@media (min-width: 780px) {
  .card {
    width: 100%;
  }
}
</style>
