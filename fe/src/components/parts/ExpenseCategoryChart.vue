<template>
  <div class="card large-card">
    <div class="card-header">
      <div>
        <p class="section-label">Expense insights</p>
        <h3>Spending by category</h3>
      </div>
    </div>

    <div v-if="hasData" class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <p v-else class="empty-state">
      No expense transactions yet. Add some expenses to see category insights.
    </p>
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Transaction } from '../services/transactionService'
import { formatCurrencyAmount, preferredCurrency } from '@/utils/appPreferences'

const props = defineProps<{
  transactions: Transaction[]
}>()

Chart.register(...registerables)

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let categoryChart: Chart<'doughnut'> | null = null
let themeObserver: MutationObserver | null = null

const getThemeValue = (variableName: string, fallback: string) => {
  if (typeof window === 'undefined') {
    return fallback
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()
  return value || fallback
}

const categoryLabelMap: Record<string, string> = {
  food: 'Food',
  transport: 'Transport',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  other: 'Other',
}

const categoryTotals = computed(() => {
  const totals = new Map<string, number>()

  props.transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const currentValue = totals.get(transaction.category) ?? 0
      totals.set(transaction.category, currentValue + Number(transaction.amount))
    })

  return Array.from(totals.entries())
    .map(([category, total]) => ({
      category,
      label: categoryLabelMap[category] ?? category,
      total,
    }))
    .sort((a, b) => b.total - a.total)
})

const hasData = computed(() => categoryTotals.value.length > 0)

const renderChart = () => {
  if (!chartCanvas.value || !hasData.value) {
    categoryChart?.destroy()
    categoryChart = null
    return
  }

  const headingColor = getThemeValue('--heading-color', '#0f172a')
  const textColor = getThemeValue('--text-muted', '#475569')
  const surfaceColor = getThemeValue('--surface-1', '#ffffff')
  const chartPalette = ['#2563eb', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6']

  categoryChart?.destroy()

  categoryChart = new Chart(chartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: categoryTotals.value.map((item) => item.label),
      datasets: [
        {
          data: categoryTotals.value.map((item) => item.total),
          backgroundColor: chartPalette,
          borderColor: surfaceColor,
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
          },
        },
        tooltip: {
          backgroundColor: headingColor,
          titleColor: surfaceColor,
          bodyColor: surfaceColor,
          callbacks: {
            label: (context) => {
              const value = context.parsed
              return `${context.label}: ${formatCurrencyAmount(Number(value))}`
            },
          },
        },
      },
      cutout: '62%',
    },
  })
}

onMounted(() => {
  renderChart()

  if (typeof window !== 'undefined') {
    themeObserver = new MutationObserver(() => {
      renderChart()
    })

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
  }
})

watch([categoryTotals, preferredCurrency], renderChart, { deep: true })

onBeforeUnmount(() => {
  themeObserver?.disconnect()
  categoryChart?.destroy()
})
</script>

<style scoped>
.card {
  background: var(--surface-1);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  box-shadow: 0 10px 30px var(--shadow-color);
  padding: 24px;
}

.large-card {
  min-height: 360px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.section-label {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-color);
}

.card-header h3 {
  margin: 0;
  color: var(--heading-color);
}

.chart-wrapper {
  position: relative;
  height: 280px;
  border-radius: 14px;
  background: var(--surface-2);
  padding: 12px;
}

.empty-state {
  color: var(--text-muted);
  line-height: 1.5;
}
</style>
