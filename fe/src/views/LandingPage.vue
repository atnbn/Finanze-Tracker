<template>
  <div class="page">
    <div class="hero-shell">
      <header class="nav">
        <div class="brand">
          <div class="brand-badge">₣</div>
          <h1 class="logo">FinTrack</h1>
        </div>

        <nav class="links">
          <a href="#features">Features</a>
          <a href="#preview">Preview</a>
          <a href="#workflow">Workflow</a>
        </nav>

        <div class="nav-actions">
          <button class="btn ghost small" @click="goToLogin">Sign In</button>
          <button class="btn primary small" @click="goToSignup">Get Started</button>
        </div>
      </header>

      <section class="hero">
        <div class="hero-left">
          <span class="eyebrow">Personal finance, without the chaos</span>

          <h2>
            A cleaner way to track spending,
            <span class="accent">plan budgets</span>
            and stay in control.
          </h2>

          <p>
            FinTrack helps you understand where your money goes, spot trends early, and make better
            decisions with a simple dashboard built for everyday use.
          </p>

          <div class="buttons">
            <button class="btn primary big" @click="goToSignup">Create free account</button>
            <button class="btn secondary big" @click="scrollToPreview">See preview</button>
          </div>

          <div class="hero-stats">
            <div class="hero-stat">
              <strong>Smart insights</strong>
              <span>See spending trends at a glance</span>
            </div>
            <div class="hero-stat">
              <strong>Budget focus</strong>
              <span>Stay ahead of monthly limits</span>
            </div>
            <div class="hero-stat">
              <strong>Fast setup</strong>
              <span>Start tracking in just minutes</span>
            </div>
          </div>
        </div>

        <div class="hero-right">
          <div class="dashboard-preview">
            <div class="preview-top">
              <div>
                <p class="preview-label">Monthly overview</p>
                <h3>April performance</h3>
              </div>
              <span class="trend positive">+12%</span>
            </div>

            <div class="chart-card">
              <div class="chart-bars">
                <span style="height: 44%"></span>
                <span style="height: 62%"></span>
                <span style="height: 50%"></span>
                <span style="height: 76%"></span>
                <span style="height: 68%"></span>
                <span style="height: 86%"></span>
              </div>

              <div class="chart-summary">
                <div>
                  <small>Income</small>
                  <strong>$4,200</strong>
                </div>
                <div>
                  <small>Spent</small>
                  <strong>$2,860</strong>
                </div>
                <div>
                  <small>Saved</small>
                  <strong>$1,340</strong>
                </div>
              </div>
            </div>

            <div class="stats-grid">
              <article class="metric-card emphasis">
                <span>Budget health</span>
                <strong>On track</strong>
                <small>4 categories below threshold</small>
              </article>

              <article class="metric-card">
                <span>Biggest category</span>
                <strong>Food</strong>
                <small>32% of total expenses</small>
              </article>

              <article class="metric-card">
                <span>Upcoming alert</span>
                <strong>Transport</strong>
                <small>82% of budget used</small>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="trust-bar">
        <div>Clear dashboard</div>
        <div>Flexible budgets</div>
        <div>Helpful analytics</div>
        <div>Built for everyday finance</div>
      </section>
    </div>

    <section id="features" class="section">
      <div class="section-heading">
        <span class="eyebrow">Features</span>
        <h3>Everything needed for a modern money workflow</h3>
        <p>
          From daily transaction tracking to budget planning, every part of the experience is
          designed to stay simple and useful.
        </p>
      </div>

      <div class="grid">
        <div class="card">
          <div class="card-icon">💸</div>
          <h4>Expense tracking</h4>
          <p>Log income and expenses quickly with categories that keep everything organized.</p>
        </div>

        <div class="card">
          <div class="card-icon">📊</div>
          <h4>Insights & analytics</h4>
          <p>Spot patterns, compare months, and understand where your budget is going.</p>
        </div>

        <div class="card">
          <div class="card-icon">🎯</div>
          <h4>Budget planning</h4>
          <p>
            Set spending limits, receive alerts, and keep your goals visible throughout the month.
          </p>
        </div>

        <div class="card">
          <div class="card-icon">⚙️</div>
          <h4>Personal settings</h4>
          <p>Customize currency, theme, start page, and preferences to fit your routine.</p>
        </div>

        <div class="card">
          <div class="card-icon">🔔</div>
          <h4>Useful alerts</h4>
          <p>Get early warnings before a category reaches its limit and act before overspending.</p>
        </div>

        <div class="card">
          <div class="card-icon">✨</div>
          <h4>Clean experience</h4>
          <p>A focused layout keeps your financial overview readable on desktop and mobile.</p>
        </div>
      </div>
    </section>

    <section id="preview" class="section light">
      <div class="section-heading centered">
        <span class="eyebrow">Preview</span>
        <h3>Simple on the surface, powerful underneath</h3>
      </div>

      <div class="preview-large">
        <div class="preview-panel sidebar-panel">
          <span class="panel-title">Workspace</span>
          <div class="panel-pill active">Dashboard</div>
          <div class="panel-pill">Transactions</div>
          <div class="panel-pill">Analytics</div>
          <div class="panel-pill">Budgets</div>
          <div class="panel-pill">Settings</div>
        </div>

        <div class="preview-panel content-panel">
          <div class="content-top-row">
            <div class="content-highlight">
              <span>Available to save</span>
              <strong>$1,340</strong>
            </div>
            <div class="content-highlight soft">
              <span>This month</span>
              <strong>18 transactions</strong>
            </div>
          </div>

          <div class="content-chart"></div>

          <div class="content-bottom-row">
            <div class="content-card">
              <span>Food</span>
              <strong>$920</strong>
            </div>
            <div class="content-card">
              <span>Transport</span>
              <strong>$310</strong>
            </div>
            <div class="content-card">
              <span>Entertainment</span>
              <strong>$180</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="workflow" class="section workflow-section">
      <div class="section-heading">
        <span class="eyebrow">Workflow</span>
        <h3>From daily tracking to better decisions</h3>
      </div>

      <div class="workflow-grid">
        <article class="step-card">
          <span class="step-number">01</span>
          <h4>Add your transactions</h4>
          <p>Capture income and expenses as they happen.</p>
        </article>

        <article class="step-card">
          <span class="step-number">02</span>
          <h4>Review your analytics</h4>
          <p>See which categories grow fastest and where you can optimize.</p>
        </article>

        <article class="step-card">
          <span class="step-number">03</span>
          <h4>Adjust and stay on track</h4>
          <p>Update budgets, respond to alerts, and keep your goals realistic.</p>
        </article>
      </div>
    </section>

    <section class="cta">
      <div class="cta-box">
        <span class="eyebrow">Get started</span>
        <h3>Start managing your money smarter</h3>
        <p>No spreadsheets. No stress. Just a clear overview of your finances.</p>

        <div class="buttons cta-buttons">
          <button class="btn primary big" @click="goToSignup">Create free account</button>
          <button class="btn secondary big" @click="goToLogin">Already have an account?</button>
        </div>
      </div>
    </section>

    <footer class="footer">© 2026 FinTrack — Personal Finance Tracker</footer>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToLogin(): void {
  router.push('/login')
}

function goToSignup(): void {
  router.push('/signup')
}

function scrollToPreview(): void {
  document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 28%),
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.12), transparent 22%), var(--app-bg);
  color: var(--app-text);
}

.hero-shell {
  padding: 20px 24px 40px;
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 16px 22px;
  background: color-mix(in srgb, var(--surface-1) 88%, transparent);
  border: 1px solid var(--border-color);
  border-radius: 22px;
  box-shadow: 0 14px 40px var(--shadow-color);
  backdrop-filter: blur(14px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--accent-color), #7c3aed);
  color: #fff;
  font-weight: 800;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.24);
}

.logo {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.links a {
  margin: 0 12px;
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 600;
}

.links a:hover {
  color: var(--heading-color);
}

.nav-actions {
  display: flex;
  gap: 10px;
}

.hero {
  max-width: 1200px;
  margin: 28px auto 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  padding: 48px 12px 24px;
}

.hero-left {
  flex: 1;
  max-width: 620px;
}

.hero-left h2 {
  margin-top: 14px;
  font-size: clamp(2.6rem, 5vw, 4.5rem);
  line-height: 1.2;
  letter-spacing: -0.04em;
  color: var(--heading-color);
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent-color) 14%, transparent);
  color: var(--accent-color);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.accent {
  color: var(--accent-color);
}

.hero-left p {
  margin-top: 20px;
  max-width: 560px;
  color: var(--text-muted);
  font-size: 1.05rem;
  line-height: 1.7;
}

.buttons {
  margin-top: 28px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-stats {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.hero-stat {
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface-1) 88%, transparent);
  box-shadow: 0 10px 24px var(--shadow-color);
}

.hero-stat strong,
.hero-stat span {
  display: block;
}

.hero-stat strong {
  color: var(--heading-color);
  margin-bottom: 6px;
}

.hero-stat span {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.btn {
  padding: 12px 18px;
  border-radius: 14px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 700;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.primary {
  background: var(--accent-color);
  color: var(--accent-contrast);
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.2);
}

.primary:hover {
  filter: brightness(1.05);
}

.secondary {
  background: var(--surface-1);
  border-color: var(--border-color);
}

.secondary:hover {
  background: var(--surface-2);
}

.ghost {
  background: transparent;
  border-color: var(--border-color);
  color: var(--app-text);
}

.small {
  padding: 8px 14px;
}

.big {
  padding: 16px 26px;
}

.hero-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.dashboard-preview {
  width: min(100%, 520px);
  padding: 22px;
  border-radius: 28px;
  border: 1px solid var(--border-color);
  background: linear-gradient(
    180deg,
    var(--surface-1),
    color-mix(in srgb, var(--surface-2) 80%, transparent)
  );
  box-shadow: 0 24px 50px var(--shadow-color);
}

.preview-top,
.chart-summary,
.content-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.preview-label,
.metric-card span,
.content-highlight span,
.content-card span,
.panel-title,
.chart-summary small {
  color: var(--text-muted);
  font-size: 0.82rem;
}

.preview-top h3,
.metric-card strong,
.content-highlight strong,
.content-card strong,
.chart-summary strong {
  color: var(--heading-color);
}

.trend {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
}

.trend.positive {
  background: var(--success-bg);
  color: var(--success-text);
}

.chart-card {
  margin-top: 18px;
  padding: 18px;
  border-radius: 22px;
  background: color-mix(in srgb, var(--surface-2) 90%, transparent);
  border: 1px solid var(--border-color);
}

.chart-bars {
  height: 180px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-items: end;
  gap: 12px;
}

.chart-bars span {
  display: block;
  border-radius: 999px 999px 10px 10px;
  background: linear-gradient(180deg, #8b5cf6, var(--accent-color));
}

.chart-summary {
  margin-top: 16px;
}

.chart-summary > div,
.content-card,
.content-highlight,
.metric-card {
  flex: 1;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid var(--border-color);
  background: var(--surface-1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.metric-card small {
  display: block;
  margin-top: 8px;
  color: var(--text-muted);
}

.metric-card.emphasis {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent-color) 16%, transparent),
    var(--surface-1)
  );
}

.trust-bar {
  max-width: 1200px;
  margin: 24px auto 0;
  padding: 18px 24px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  border: 1px solid var(--border-color);
  border-radius: 22px;
  background: color-mix(in srgb, var(--surface-1) 92%, transparent);
  color: var(--text-muted);
  font-weight: 700;
  text-align: center;
}

.section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 88px 24px;
}

.section.light {
  padding-top: 72px;
}

.section-heading {
  max-width: 720px;
  margin-bottom: 34px;
}

.section-heading.centered {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.section-heading h3 {
  margin-top: 16px;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.15;
  color: var(--heading-color);
}

.section-heading p {
  margin-top: 14px;
  color: var(--text-muted);
  line-height: 1.7;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.card {
  padding: 24px;
  background: var(--surface-1);
  border: 1px solid var(--border-color);
  border-radius: 22px;
  text-align: left;
  box-shadow: 0 14px 30px var(--shadow-color);
}

.card h4 {
  margin-bottom: 10px;
  color: var(--heading-color);
}

.card p {
  color: var(--text-muted);
  line-height: 1.6;
}

.card-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: color-mix(in srgb, var(--accent-color) 14%, transparent);
  font-size: 1.35rem;
}

.preview-large {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 18px;
  padding: 20px;
  border-radius: 30px;
  background: linear-gradient(
    180deg,
    var(--surface-1),
    color-mix(in srgb, var(--surface-2) 78%, transparent)
  );
  border: 1px solid var(--border-color);
  box-shadow: 0 20px 50px var(--shadow-color);
}

.preview-panel {
  border-radius: 22px;
  border: 1px solid var(--border-color);
  background: var(--surface-1);
}

.sidebar-panel {
  padding: 20px;
}

.panel-pill {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--surface-2);
  color: var(--text-muted);
  font-weight: 600;
}

.panel-pill.active {
  background: color-mix(in srgb, var(--accent-color) 16%, transparent);
  color: var(--accent-color);
}

.content-panel {
  padding: 20px;
}

.content-highlight.soft {
  background: color-mix(in srgb, var(--surface-2) 88%, transparent);
}

.content-chart {
  height: 220px;
  margin: 18px 0;
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(37, 99, 235, 0.18), rgba(37, 99, 235, 0.02)),
    linear-gradient(90deg, var(--accent-color), #8b5cf6);
  opacity: 0.95;
  position: relative;
  overflow: hidden;
}

.content-chart::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 60%;
  background:
    linear-gradient(to top, color-mix(in srgb, var(--surface-1) 88%, transparent), transparent),
    repeating-linear-gradient(
      to right,
      transparent,
      transparent 54px,
      rgba(255, 255, 255, 0.18) 54px,
      rgba(255, 255, 255, 0.18) 55px
    );
}

.content-bottom-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.workflow-section {
  padding-top: 72px;
}

.workflow-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.step-card {
  padding: 24px;
  border-radius: 22px;
  border: 1px solid var(--border-color);
  background: var(--surface-1);
  box-shadow: 0 14px 30px var(--shadow-color);
}

.step-number {
  display: inline-flex;
  margin-bottom: 18px;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--accent-color);
}

.step-card h4 {
  margin-bottom: 10px;
  color: var(--heading-color);
}

.step-card p {
  color: var(--text-muted);
  line-height: 1.6;
}

.cta {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 80px;
}

.cta-box {
  padding: 46px 24px;
  text-align: center;
  border-radius: 32px;
  background: linear-gradient(135deg, #0f172a, #111827 52%, #1d4ed8);
  color: white;
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.24);
}

.cta-box .eyebrow {
  background: rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.92);
}

.cta-box h3 {
  margin-top: 16px;
  font-size: clamp(2rem, 3vw, 3rem);
}

.cta-buttons {
  justify-content: center;
}

.cta p {
  margin: 14px auto 0;
  max-width: 620px;
  opacity: 0.82;
  line-height: 1.7;
}

.footer {
  padding: 0 24px 40px;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}

@media (max-width: 1080px) {
  .hero {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-right {
    justify-content: stretch;
  }

  .hero-stats,
  .stats-grid,
  .grid,
  .workflow-grid,
  .trust-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .nav {
    flex-wrap: wrap;
  }

  .links {
    width: 100%;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  .nav-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .preview-large {
    grid-template-columns: 1fr;
  }

  .content-top-row,
  .content-bottom-row,
  .chart-summary {
    display: grid;
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero-shell,
  .section,
  .cta {
    padding-left: 16px;
    padding-right: 16px;
  }

  .hero {
    padding-left: 0;
    padding-right: 0;
  }

  .hero-stats,
  .stats-grid,
  .grid,
  .workflow-grid,
  .trust-bar,
  .content-bottom-row {
    grid-template-columns: 1fr;
  }

  .nav-actions,
  .buttons {
    width: 100%;
  }

  .nav-actions .btn,
  .buttons .btn {
    flex: 1;
  }

  .dashboard-preview,
  .cta-box,
  .card,
  .step-card,
  .preview-panel {
    border-radius: 20px;
  }
}
</style>
