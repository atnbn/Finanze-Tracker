<template>
  <div class="card large-card">
    <div class="card-header">
      <div>
        <p class="section-label">Budget performance</p>
        <h3>Budget vs actual</h3>
      </div>
    </div>

    <div v-if="hasData" class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <p v-else class="empty-state">
      Set a budget to compare your monthly limits with actual spending.
    </p>
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Budget } from '../services/budgetService'
import { formatCurrencyAmount, preferredCurrency } from '@/utils/appPreferences'

const props = defineProps<{
  budgets: Budget[]
}>()

Chart.register(...registerables)

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let budgetChart: Chart<'bar'> | null = null
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

const chartData = computed(() => {
  return [...props.budgets]
    .sort((a, b) => a.category.localeCompare(b.category))
    .map((budget) => ({
      label: categoryLabelMap[budget.category] ?? budget.category,
      limitAmount: budget.limitAmount,
      spent: budget.spent,
    }))
})

const hasData = computed(() => chartData.value.length > 0)

const renderChart = () => {
  if (!chartCanvas.value || !hasData.value) {
    budgetChart?.destroy()
    budgetChart = null
    return
  }

  const accentColor = getThemeValue('--accent-color', '#2563eb')
  const expenseColor = getThemeValue('--expense-color', '#dc2626')
  const gridColor = getThemeValue('--chart-grid-color', 'rgba(148, 163, 184, 0.25)')
  const textColor = getThemeValue('--text-muted', '#475569')
  const headingColor = getThemeValue('--heading-color', '#0f172a')
  const surfaceColor = getThemeValue('--surface-1', '#ffffff')

  budgetChart?.destroy()

  budgetChart = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: chartData.value.map((item) => item.label),
      datasets: [
        {
          label: 'Budget',
          data: chartData.value.map((item) => item.limitAmount),
          backgroundColor: `${accentColor}bf`,
          borderColor: accentColor,
          borderRadius: 8,
        },
        {
          label: 'Spent',
          data: chartData.value.map((item) => item.spent),
          backgroundColor: `${expenseColor}bf`,
          borderColor: expenseColor,
          borderRadius: 8,
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
              const datasetLabel = context.dataset.label ?? 'Amount'
              return `${datasetLabel}: ${formatCurrencyAmount(Number(context.parsed.y))}`
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: gridColor,
          },
          ticks: {
            color: textColor,
            callback: (value) => formatCurrencyAmount(Number(value)),
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: textColor,
          },
        },
      },
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
watch([chartData, preferredCurrency], renderChart, { deep: true })

onBeforeUnmount(() => {
  themeObserver?.disconnect()
  budgetChart?.destroy()
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
