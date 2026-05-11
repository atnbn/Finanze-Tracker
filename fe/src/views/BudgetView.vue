<template>
  <div class="budget-layout">
    <Sidebar :is-open="isSidebarOpen" @close-sidebar="handleCloseSidebar" />

    <div class="main-area">
      <Header title="Budgets" @open-sidebar="handleOpenSidebar" />

      <main class="content-area">
        <section class="hero-card">
          <div>
            <p class="eyebrow">Monthly planning</p>
            <h2>Stay in control of your spending</h2>
            <p class="hero-copy">
              Track category limits, watch your progress, and see where your budget still has room.
            </p>
          </div>

          <div class="hero-stats">
            <div class="stat-card">
              <span>Total Budget</span>
              <strong>{{ formatCurrency(totalBudget) }}</strong>
            </div>
            <div class="stat-card">
              <span>Spent</span>
              <strong>{{ formatCurrency(totalSpent) }}</strong>
            </div>
            <div class="stat-card">
              <span>Remaining</span>
              <strong>{{ formatCurrency(remainingBudget) }}</strong>
            </div>
          </div>
        </section>

        <section class="grid">
          <article class="card large-card">
            <div class="card-header">
              <div>
                <p class="section-label">Category budgets</p>
                <h3>{{ currentPeriodLabel }}</h3>
              </div>
              <button class="btn primary" @click="openBudgetModal">+ New Budget</button>
            </div>

            <p v-if="errorMessage" class="state-message error">{{ errorMessage }}</p>
            <p v-else-if="isLoading" class="state-message">Loading budgets...</p>

            <div v-else-if="budgetCards.length > 0" class="budget-list">
              <div v-for="budget in budgetCards" :key="budget.category" class="budget-item">
                <div class="budget-meta">
                  <div>
                    <h4>{{ budget.label }}</h4>
                    <p>
                      {{ formatCurrency(budget.spent) }} of
                      {{ formatCurrency(budget.limitAmount) }} used
                    </p>
                  </div>
                  <div class="budget-actions">
                    <span :class="['budget-status', budget.status]">{{ budget.statusLabel }}</span>
                    <button
                      class="icon-button danger-button"
                      :disabled="isDeletingBudget && budget.id === budgetToDelete?.id"
                      @click="openDeleteBudgetModal(budget)"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div class="progress-track">
                  <div class="progress-fill" :style="{ width: `${budget.progress}%` }"></div>
                </div>
              </div>
            </div>

            <p v-else class="state-message">
              No budgets yet. Add your first monthly category budget.
            </p>
          </article>

          <article class="card side-card">
            <p class="section-label">Quick insights</p>
            <h3>Recommendations</h3>

            <ul class="insight-list">
              <li v-for="insight in insights" :key="insight.title">
                <strong>{{ insight.title }}</strong>
                <span>{{ insight.message }}</span>
              </li>
            </ul>
          </article>
        </section>
      </main>
    </div>

    <Modal
      :model-value="showBudgetModal"
      title="Set monthly budget"
      @update:model-value="handleBudgetModalChange"
    >
      <form class="budget-form" @submit.prevent="submitBudget">
        <label class="field">
          <span>Category</span>
          <select v-model="budgetForm.category">
            <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="field">
          <span>Monthly limit</span>
          <input v-model.number="budgetForm.limitAmount" type="number" min="1" placeholder="500" />
        </label>
      </form>

      <template #footer>
        <button class="btn secondary" @click="closeBudgetModal">Cancel</button>
        <button class="btn primary" :disabled="isSavingBudget" @click="submitBudget">
          {{ isSavingBudget ? 'Saving...' : 'Save Budget' }}
        </button>
      </template>
    </Modal>

    <Modal
      :model-value="showDeleteBudgetModal"
      title="Delete budget"
      @update:model-value="handleDeleteBudgetModalChange"
    >
      <div class="delete-copy">
        <p v-if="budgetToDelete">
          Delete the <strong>{{ budgetToDelete.label }}</strong> budget for
          {{ currentPeriodLabel }}?
        </p>
        <p>This action removes the monthly budget limit but keeps your transactions.</p>
      </div>

      <template #footer>
        <button class="btn secondary" :disabled="isDeletingBudget" @click="closeDeleteBudgetModal">
          Cancel
        </button>
        <button class="btn danger" :disabled="isDeletingBudget" @click="confirmDeleteBudget">
          {{ isDeletingBudget ? 'Deleting...' : 'Delete Budget' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Header from '@/components/parts/header.vue'
import Sidebar from '@/components/parts/sidebar.vue'
import Modal from '@/components/Modal.vue'
import {
  deleteBudget,
  fetchCurrentMonthBudgets,
  saveBudget,
  type Budget,
} from '@/components/services/budgetService'
import type { ExpenseCategory } from '@/components/services/transactionService'
import { formatCurrencyAmount } from '@/utils/appPreferences'
import { showToast } from '@/utils/toast'

type BudgetStatus = 'safe' | 'warning' | 'danger'

type BudgetItem = {
  id: number
  category: ExpenseCategory
  label: string
  limitAmount: number
  spent: number
  progress: number
  status: BudgetStatus
  statusLabel: string
}

type Insight = {
  title: string
  message: string
}

type BudgetDeleteTarget = {
  id: number
  label: string
}

const isSidebarOpen = ref(false)
const showBudgetModal = ref(false)
const showDeleteBudgetModal = ref(false)
const isLoading = ref(false)
const isSavingBudget = ref(false)
const isDeletingBudget = ref(false)
const errorMessage = ref('')
const currentMonth = ref(new Date().getMonth() + 1)
const currentYear = ref(new Date().getFullYear())
const budgetToDelete = ref<BudgetDeleteTarget | null>(null)

const categoryOptions: Array<{ label: string; value: ExpenseCategory }> = [
  { label: 'Food', value: 'food' },
  { label: 'Transport', value: 'transport' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Other', value: 'other' },
]

const categoryLabelMap: Record<ExpenseCategory, string> = {
  food: 'Food',
  transport: 'Transport',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  other: 'Other',
}

const budgets = ref<Budget[]>([])
const budgetForm = ref<{ category: ExpenseCategory; limitAmount: number }>({
  category: 'food',
  limitAmount: 0,
})

const currentPeriodLabel = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value - 1)

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

const budgetCards = computed<BudgetItem[]>(() => {
  return budgets.value.map((budget) => {
    const ratio = budget.limitAmount > 0 ? budget.spent / budget.limitAmount : 0
    const progress = Math.min(Math.round(ratio * 100), 100)
    const status: BudgetStatus = ratio >= 1 ? 'danger' : ratio >= 0.8 ? 'warning' : 'safe'

    return {
      id: budget.id,
      category: budget.category,
      label: categoryLabelMap[budget.category],
      limitAmount: budget.limitAmount,
      spent: budget.spent,
      progress,
      status,
      statusLabel: `${progress}%`,
    }
  })
})

const totalBudget = computed(() =>
  budgets.value.reduce((sum, budget) => sum + budget.limitAmount, 0),
)
const totalSpent = computed(() => budgets.value.reduce((sum, budget) => sum + budget.spent, 0))
const remainingBudget = computed(() => totalBudget.value - totalSpent.value)

const insights = computed<Insight[]>(() => {
  if (budgetCards.value.length === 0) {
    return [
      {
        title: 'No budgets yet',
        message: 'Set a monthly budget to start tracking your category limits.',
      },
    ]
  }

  return budgetCards.value.slice(0, 3).map((budget) => {
    if (budget.status === 'danger') {
      return {
        title: budget.label,
        message: `You are over budget in ${budget.label}. Reduce spending in this category this month.`,
      }
    }

    if (budget.status === 'warning') {
      return {
        title: budget.label,
        message: `You are close to the ${budget.label} limit. Keep an eye on new expenses.`,
      }
    }

    return {
      title: budget.label,
      message: `Spending in ${budget.label} is on track. You still have room in this category.`,
    }
  })
})

const formatCurrency = (value: number) => formatCurrencyAmount(value)

const loadBudgets = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const data = await fetchCurrentMonthBudgets()
    budgets.value = data.budgets
    currentMonth.value = data.month
    currentYear.value = data.year
  } catch (error) {
    console.error('Error loading budgets:', error)
    errorMessage.value = 'Could not load budgets right now.'
    showToast({
      type: 'error',
      title: 'Budgets unavailable',
      message: 'Budgets could not be loaded right now.',
    })
  } finally {
    isLoading.value = false
  }
}

const resetBudgetForm = () => {
  budgetForm.value = {
    category: 'food',
    limitAmount: 0,
  }
}

const openBudgetModal = () => {
  resetBudgetForm()
  showBudgetModal.value = true
}

const closeBudgetModal = () => {
  showBudgetModal.value = false
  resetBudgetForm()
}

const openDeleteBudgetModal = (budget: BudgetItem) => {
  budgetToDelete.value = {
    id: budget.id,
    label: budget.label,
  }
  showDeleteBudgetModal.value = true
}

const resetDeleteBudgetModal = () => {
  showDeleteBudgetModal.value = false
  budgetToDelete.value = null
}

const closeDeleteBudgetModal = () => {
  if (isDeletingBudget.value) {
    return
  }

  resetDeleteBudgetModal()
}

const handleBudgetModalChange = (value: boolean) => {
  if (!value) {
    closeBudgetModal()
  }
}

const handleDeleteBudgetModalChange = (value: boolean) => {
  if (!value) {
    closeDeleteBudgetModal()
  }
}

const submitBudget = async () => {
  if (budgetForm.value.limitAmount <= 0) {
    errorMessage.value = 'Budget amount must be greater than 0.'
    return
  }

  isSavingBudget.value = true
  errorMessage.value = ''

  try {
    const savedBudget = await saveBudget(budgetForm.value)
    const existingIndex = budgets.value.findIndex(
      (budget) => budget.category === savedBudget.category,
    )

    if (existingIndex >= 0) {
      budgets.value[existingIndex] = {
        ...savedBudget,
        spent: budgets.value[existingIndex]?.spent ?? 0,
      }
      showToast({
        type: 'success',
        title: 'Budget updated',
        message: `${categoryLabelMap[savedBudget.category]} budget was updated successfully.`,
      })
    } else {
      budgets.value.push(savedBudget)
      showToast({
        type: 'success',
        title: 'Budget created',
        message: `${categoryLabelMap[savedBudget.category]} budget was created successfully.`,
      })
    }

    closeBudgetModal()
  } catch (error) {
    console.error('Error saving budget:', error)
    errorMessage.value = 'Could not save the budget.'
    showToast({
      type: 'error',
      title: 'Save failed',
      message: error instanceof Error ? error.message : 'The budget could not be saved.',
    })
  } finally {
    isSavingBudget.value = false
  }
}

const confirmDeleteBudget = async () => {
  if (!budgetToDelete.value) {
    return
  }

  isDeletingBudget.value = true
  errorMessage.value = ''

  try {
    await deleteBudget(budgetToDelete.value.id)
    const deletedBudgetLabel = budgetToDelete.value.label
    budgets.value = budgets.value.filter((budget) => budget.id !== budgetToDelete.value?.id)
    resetDeleteBudgetModal()
    showToast({
      type: 'success',
      title: 'Budget deleted',
      message: `${deletedBudgetLabel} budget was deleted successfully.`,
    })
  } catch (error) {
    console.error('Error deleting budget:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Could not delete the budget.'
    showToast({
      type: 'error',
      title: 'Delete failed',
      message: error instanceof Error ? error.message : 'The budget could not be deleted.',
    })
  } finally {
    isDeletingBudget.value = false
  }
}

const handleOpenSidebar = () => {
  isSidebarOpen.value = true
}

const handleCloseSidebar = () => {
  isSidebarOpen.value = false
}

onMounted(() => {
  loadBudgets()
})
</script>

<style scoped>
.budget-layout {
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
.card {
  background: var(--app-bg);
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
.card h3,
.budget-item h4 {
  margin: 0;
}

.hero-copy {
  max-width: 560px;
  margin: 12px 0 0;
  color: var(--app-text);
  line-height: 1.5;
}

.hero-stats {
  min-width: 280px;
  display: grid;
  gap: 12px;
}

.stat-card {
  background: var(--surface-2);
  border-radius: 14px;
  padding: 16px;
  border: 1px solid var(--border-color);
}

.stat-card span {
  display: block;
  margin-bottom: 6px;
  color: var(--app-text);
  font-size: 14px;
}

.stat-card strong {
  font-size: 24px;
  color: var(--app-text);
}

.grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.card {
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.budget-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.budget-item {
  padding: 18px;
  border-radius: 14px;
  background: var(--surface-2);
  border: 1px solid var(--border-color);
}

.budget-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}

.budget-meta p {
  margin: 6px 0 0;
  color: var(--app-text);
  font-size: 14px;
}

.budget-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-track {
  height: 10px;
  border-radius: 999px;
  background: var(--surface-2);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #2563eb, #60a5fa);
}

.budget-status {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.budget-status.safe {
  color: var(--success-text);
  background: var(--surface-2);
}

.budget-status.warning {
  color: var(--warning-text);
  background: var(--surface-2);
}

.budget-status.danger {
  color: var(--danger-color);
  background: var(--surface-2);
}

.insight-list {
  display: grid;
  gap: 16px;
  padding: 0;
  margin: 20px 0 0;
  list-style: none;
}

.insight-list li {
  display: grid;
  gap: 6px;
  padding: 16px;
  border-radius: 14px;
  background: var(--surface-2);
  border: 1px solid var(--border-color);
}

.insight-list span {
  color: var(--app-text);
  line-height: 1.5;
  font-size: 14px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.btn:disabled,
.icon-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.primary {
  background: #2563eb;
  color: #fff;
}

.secondary {
  background: var(--surface-2);
  color: var(--app-text);
}

.danger {
  background: #dc2626;
  color: #fff;
}

.icon-button {
  border: 1px solid var(--border-color);
  background: var(--surface-1);
  color: var(--app-text);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.danger-button {
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.24);
}

.state-message {
  margin: 0;
  color: var(--app-text);
}

.state-message.error {
  color: var(--danger-color);
}

.budget-form {
  display: grid;
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text);
}

.field input,
.field select {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.delete-copy {
  display: grid;
  gap: 12px;
}

.delete-copy p {
  margin: 0;
  color: var(--app-text);
  line-height: 1.5;
}

@media (max-width: 1024px) {
  .hero-card,
  .grid {
    grid-template-columns: 1fr;
  }

  .hero-card {
    flex-direction: column;
  }

  .hero-stats {
    min-width: 0;
  }
}

@media (max-width: 768px) {
  .budget-layout {
    display: block;
  }

  .content-area {
    padding: 20px;
  }
}

@media (max-width: 600px) {
  .card-header,
  .budget-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .budget-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
