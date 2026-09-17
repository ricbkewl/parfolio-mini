const METRICS_KEY = 'parfolio-mini:local-metrics-v1'

function safeRead(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function metric(name) {
  const data = safeRead(METRICS_KEY, {})
  data[name] = Number(data[name] || 0) + 1
  data.lastActivityAt = new Date().toISOString()
  safeWrite(METRICS_KEY, data)
}

function installStyles() {
  if (document.getElementById('pf-competition-hardening-style')) return
  const style = document.createElement('style')
  style.id = 'pf-competition-hardening-style'
  style.textContent = `
    .pf-runtime-banner{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);transform:translateX(-50%);z-index:99999;max-width:min(92vw,560px);padding:11px 14px;border-radius:14px;background:rgba(7,25,19,.96);border:1px solid rgba(239,212,118,.34);box-shadow:0 16px 50px rgba(0,0,0,.35);color:#f5eedb;font:600 .8rem/1.4 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-align:center;backdrop-filter:blur(16px)}
    .pf-runtime-banner.error{border-color:rgba(255,126,126,.45);color:#ffe4e4}
    .pf-runtime-banner.success{border-color:rgba(120,225,173,.45);color:#dbffea}
    .pf-offline-chip{position:fixed;top:calc(env(safe-area-inset-top,0px) + 10px);right:10px;z-index:99990;padding:7px 10px;border-radius:999px;background:#7f261f;color:#fff;font:700 .68rem/1 system-ui;letter-spacing:.04em;box-shadow:0 8px 24px rgba(0,0,0,.28)}
    .coming-soon{display:none!important}
    button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid rgba(239,212,118,.72)!important;outline-offset:3px!important}
  `
  document.head.appendChild(style)
}

let bannerTimer
function showBanner(message, tone = '') {
  if (!message) return
  let banner = document.querySelector('.pf-runtime-banner')
  if (!banner) {
    banner = document.createElement('div')
    banner.className = 'pf-runtime-banner'
    banner.setAttribute('role', 'status')
    banner.setAttribute('aria-live', 'polite')
    document.body.appendChild(banner)
  }
  banner.className = `pf-runtime-banner ${tone}`.trim()
  banner.textContent = message
  clearTimeout(bannerTimer)
  bannerTimer = setTimeout(() => banner?.remove(), tone === 'error' ? 6500 : 3600)
}

function syncOfflineState() {
  let chip = document.querySelector('.pf-offline-chip')
  if (!navigator.onLine) {
    if (!chip) {
      chip = document.createElement('div')
      chip.className = 'pf-offline-chip'
      chip.textContent = 'OFFLINE · scoring still available'
      document.body.appendChild(chip)
    }
  } else if (chip) {
    chip.remove()
  }
}

function setDefaultDate() {
  const dateInput = document.querySelector('#roundForm input[name="date"]')
  if (!dateInput || dateInput.value) return
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  dateInput.value = local.toISOString().slice(0, 10)
}

function clarifyPrimaryAction() {
  const button = document.querySelector('#connectWallet')
  if (!button) return
  if (button.textContent.includes('How to open')) {
    button.setAttribute('aria-label', 'Open ParFolio Mini inside Nimiq Pay to connect your wallet')
  }
}

function guardDisabledActions() {
  document.querySelectorAll('button[disabled]').forEach((button) => {
    if (button.dataset.pfGuarded === '1') return
    button.dataset.pfGuarded = '1'
    button.addEventListener('click', () => {
      showBanner('Complete the required step above before continuing.')
    })
  })
}

function trackCoreFlow(event) {
  const target = event.target.closest?.('button,a')
  if (!target) return
  if (target.id === 'connectWallet') metric('connectWalletTaps')
  if (target.id === 'searchCourses') metric('courseSearches')
  if (target.id === 'nearbyCourses') metric('nearMeTaps')
  if (target.matches('[data-use-pf-course]')) metric('courseSelections')
  if (target.matches('[data-share-round]')) metric('shareTaps')
  if (target.matches('[data-page="play"],.pf-nav-item[data-page="play"]')) metric('playPageViews')
}

document.addEventListener('submit', (event) => {
  if (event.target?.id === 'roundForm') metric('roundSignAttempts')
}, true)

document.addEventListener('click', trackCoreFlow, true)

window.addEventListener('error', (event) => {
  metric('runtimeErrors')
  console.error('[ParFolio Mini] runtime error', event.error || event.message)
  showBanner('Something did not load correctly. Your saved round data is still on this device. Retry the action or reopen Mini.', 'error')
})

window.addEventListener('unhandledrejection', (event) => {
  metric('promiseErrors')
  console.error('[ParFolio Mini] unhandled promise rejection', event.reason)
  showBanner('That request did not complete. Check your connection and try again; saved round data was not removed.', 'error')
})

window.addEventListener('offline', () => {
  metric('offlineEvents')
  syncOfflineState()
  showBanner('You are offline. Local scoring can continue, but maps, course search and wallet signing need a connection.')
})
window.addEventListener('online', () => {
  syncOfflineState()
  showBanner('Connection restored.', 'success')
})

function removePrototypeSignals() {
  document.querySelectorAll('.coming-soon').forEach((section) => section.remove())
  document.querySelectorAll('.soon-pill').forEach((pill) => pill.remove())
}

function run() {
  installStyles()
  syncOfflineState()
  setDefaultDate()
  clarifyPrimaryAction()
  guardDisabledActions()
  removePrototypeSignals()
}

let passes = 0
const boot = setInterval(() => {
  passes += 1
  run()
  if (passes >= 80) clearInterval(boot)
}, 125)

document.addEventListener('click', () => setTimeout(run, 40), true)
window.addEventListener('parfolio:wallet-updated', () => setTimeout(run, 20))
window.addEventListener('parfolio:rounds-updated', () => {
  metric('signedRoundEvents')
  setTimeout(run, 20)
})
run()
