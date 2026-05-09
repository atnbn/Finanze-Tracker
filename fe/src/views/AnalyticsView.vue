<template>
  <div class="analytics-layout">
    <Sidebar :is-open="isSidebarOpen" @close-sidebar="handleCloseSidebar" />

    <div class="main-area">
      <Header title="Analytics" @open-sidebar="handleOpenSidebar" />

      <main class="content-area">
        <section class="hero-card">
          <div>
            <p class="eyebrow">Performance overview</p>
            <h2>See where your money goes</h2>
            <p class="hero-copy">
              Understand your expense mix, compare budgets to actual spending, and spot trends
              faster.
            </p>
          </div>

          <div class="summary-grid">
            <div class="summary-card">
              <span>Income</span>
              <strong>{{ formatCurrency(totalIncome) }}</strong>
            </div>
            <div class="summary-card">
              <span>Expenses</span>
              <strong>{{ formatCurrency(totalExpenses) }}</strong>
            </div>
            <div class="summary-card">
              <span>Net Cashflow</span>
              <strong :class="{ positive: netCashflow >= 0, negative: netCashflow < 0 }">
                {{ formatCurrency(netCashflow) }}
              </strong>
            </div>
            <div class="summary-card">
              <span>Active Budgets</span>
              <strong>{{ budgets.length }}</strong>
            </div>
          </div>
        </section>

        <p v-if="errorMessage" class="state-message error">{{ errorMessage }}</p>
        <p v-else-if="isLoading" class="state-message">Loading analytics...</p>

        <template v-else>
          <section class="grid">
            <ExpenseCategoryChart :transactions="transactions" />
            <BudgetComparisonChart :budgets="budgets" />
          </section>

          <section class="insights-grid">
            <article class="insight-card">
              <p class="section-label">Top category</p>
              <h3>{{ topExpenseCategory.label }}</h3>
              <p>
                {{ formatCurrency(topExpenseCategory.total) }} spent in your biggest expense
                category.
              </p>
            </article>

            <article class="insight-card">
              <p class="section-label">Largest expense</p>
              <h3>{{ highestExpense.title }}</h3>
              <p>
                {{ formatCurrency(highestExpense.amount) }} in {{ highestExpense.categoryLabel }}.
              </p>
            </article>

            <article class="insight-card">
              <p class="section-label">Average expense</p>
              <h3>{{ formatCurrency(averageExpense) }}</h3>
              <p>Average amount per expense transaction this month.</p>
            </article>

            <article class="insight-card">
              <p class="section-label">Budget health</p>
              <h3>{{ overBudgetCount }}</h3>
              <p>
                {{ overBudgetCount === 1 ? 'category is' : 'categories are' }} currently over
                budget.
              </p>
            </article>
          </section>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Header from '@/components/parts/header.vue'
import Sidebar from '@/components/parts/sidebar.vue'
import BudgetComparisonChart from '@/components/parts/BudgetComparisonChart.vue'
import ExpenseCategoryChart from '@/components/parts/ExpenseCategoryChart.vue'
import { fetchCurrentMonthBudgets, type Budget } from '@/components/services/budgetService'
import {
  fetchTransactions,
  type ExpenseCategory,
  type Transaction,
} from '@/components/services/transactionService'
import { formatCurrencyAmount } from '@/utils/appPreferences'

const isSidebarOpen = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const transactions = ref<Transaction[]>([])
const budgets = ref<Budget[]>([])

const categoryLabelMap: Record<ExpenseCategory, string> = {
  food: 'Food',
  transport: 'Transport',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  other: 'Other',
}

const expenseTransactions = computed(() =>
  transactions.value.filter((transaction) => transaction.type === 'expense'),
)

const totalIncome = computed(() =>
  transactions.value
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0),
)

const totalExpenses = computed(() =>
  expenseTransactions.value.reduce((sum, transaction) => sum + Number(transaction.amount), 0),
)

const netCashflow = computed(() => totalIncome.value - totalExpenses.value)

const averageExpense = computed(() => {
  if (expenseTransactions.value.length === 0) {
    return 0
  }

  return totalExpenses.value / expenseTransactions.value.length
})

const expenseTotalsByCategory = computed(() => {
  const totals = new Map<ExpenseCategory, number>()

  expenseTransactions.value.forEach((transaction) => {
    const category = transaction.category as ExpenseCategory
    const currentValue = totals.get(category) ?? 0
    totals.set(category, currentValue + Number(transaction.amount))
  })

  return Array.from(totals.entries())
    .map(([category, total]) => ({
      category,
      label: categoryLabelMap[category],
      total,
    }))
    .sort((a, b) => b.total - a.total)
})

const topExpenseCategory = computed(() => {
  return (
    expenseTotalsByCategory.value[0] ?? {
      category: 'other' as ExpenseCategory,
      label: 'No expenses yet',
      total: 0,
    }
  )
})

const highestExpense = computed(() => {
  const sortedExpenses = [...expenseTransactions.value].sort(
    (a, b) => Number(b.amount) - Number(a.amount),
  )
  const item = sortedExpenses[0]

  if (!item) {
    return {
      title: 'No expenses yet',
      amount: 0,
      categoryLabel: 'N/A',
    }
  }

  return {
    title: item.title,
    amount: Number(item.amount),
    categoryLabel: categoryLabelMap[item.category as ExpenseCategory] ?? 'Other',
  }
})

const overBudgetCount = computed(
  () => budgets.value.filter((budget) => budget.spent > budget.limitAmount).length,
)

const formatCurrency = (value: number) => formatCurrencyAmount(value)

const loadAnalytics = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [transactionData, budgetData] = await Promise.all([
      fetchTransactions(),
      fetchCurrentMonthBudgets(),
    ])

    transactions.value = transactionData
    budgets.value = budgetData.budgets
  } catch (error) {
    console.error('Error loading analytics:', error)
    errorMessage.value = 'Could not load analytics right now.'
  } finally {
    isLoading.value = false
  }
}

const handleOpenSidebar = () => {
  isSidebarOpen.value = true
}

const handleCloseSidebar = () => {
  isSidebarOpen.value = false
}

onMounted(() => {
  loadAnalytics()
})
</script>

<style scoped>
.analytics-layout {
  display: flex;
  min-height: 100vh;
  background: var(--app-bg);
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content-area {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.hero-card,
.insight-card {
  background: var(--surface-2);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 28px;
  margin-bottom: 24px;
}

.eyebrow,
.section-label {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.hero-card h2,
.insight-card h3 {
  margin: 0;
}

.hero-copy {
  max-width: 560px;
  margin: 12px 0 0;
  color: var(--app-text);
  line-height: 1.5;
}

.summary-grid {
  min-width: 360px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.summary-card,
.insight-card {
  padding: 18px;
}

.summary-card {
  background: var(--surface-1);
  border-radius: 14px;
  border: 1px solid var(--border-color);
}

.summary-card span {
  display: block;
  margin-bottom: 6px;
  color: var(--app-text);
  font-size: 14px;
}

.summary-card strong,
.insight-card h3 {
  font-size: 24px;
  color: var(--app-text);
}

.grid,
.insights-grid {
  display: grid;
  gap: 24px;
}

.grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 24px;
}

.insights-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.insight-card p:last-child {
  margin: 10px 0 0;
  color: var(--app-text);
  line-height: 1.5;
}

.positive {
  color: var(--success-tetxt);
}

.negative {
  color: var(--danger-text);
}

.state-message {
  margin: 0 0 24px;
  color: var(--app-text);
}

.state-message.error {
  color: var(--danger-text);
}

@media (max-width: 1200px) {
  .insights-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .hero-card {
    flex-direction: column;
  }

  .summary-grid {
    min-width: 0;
  }
}

@media (max-width: 768px) {
  .analytics-layout {
    display: block;
  }

  .content-area {
    padding: 20px;
  }
}

@media (max-width: 600px) {
  .summary-grid,
  .insights-grid {
    grid-template-columns: 1fr;
  }
}
</style>
