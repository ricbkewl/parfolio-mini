import { init } from '@nimiq/mini-app-sdk'
import './styles.css'

const app = document.querySelector('#app')

const state = {
  provider: null,
  account: null,
  networkReady: null,
  blockNumber: null,
  verifiedRounds: loadRounds(),
}

function loadRounds() {
  try {
    const raw = localStorage.getItem('parfolio-mini:verified-rounds')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRounds() {
  localStorage.setItem('parfolio-mini:verified-rounds', JSON.stringify(state.verifiedRounds.slice(0, 20)))
}

function shortAddress(address) {
  if (!address) return 'Not connected'
  const clean = address.replace(/\s+/g, '')
  return `${clean.slice(0, 7)}…${clean.slice(-5)}`
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function roundMessage(round, wallet) {
  return [
    'PARFOLIO MINI WALLET-SIGNED ROUND',
    `course=${round.course}`,
    `date=${round.date}`,
    `holes=${round.holes}`,
    `score=${round.score}`,
    `par=${round.par}`,
    `birdies=${round.birdies}`,
    `longestDriveYards=${round.longestDrive || 'n/a'}`,
    `wallet=${wallet}`,
    `createdAt=${round.createdAt}`,
  ].join('\n')
}

function shareableRecord(item) {
  return [
    'ParFolio Mini · Player-entered, wallet-signed round',
    item.message || roundMessage(item, item.wallet),
    `publicKey=${item.publicKey || 'not available'}`,
    `signature=${item.signature}`,
    'The wallet signature does not independently confirm the golf score.',
  ].join('\n')
}

function render() {
  const connected = Boolean(state.account)
  const records = state.verifiedRounds.map((item, index) => `
    <article class="record-card">
      <div class="credential-top">
        <div>
          <p class="eyebrow">Wallet-signed golf record</p>
          <h3>${escapeHtml(item.course)}</h3>
          <p class="record-meta">${escapeHtml(item.date)} · ${escapeHtml(item.holes)} holes</p>
        </div>
        <span class="credential-status">✓ Signed</span>
      </div>
      <div class="credential-score">
        <div class="credential-medallion"><span>PLAYER ENTERED</span><strong>${escapeHtml(item.score)}</strong><small>${item.score - item.par > 0 ? '+' : ''}${item.score - item.par} TO PAR</small></div>
        <div class="credential-stats">
          <span><b>${escapeHtml(item.holes)}</b><small>HOLES</small></span>
          <span><b>${escapeHtml(item.par)}</b><small>PAR</small></span>
          <span><b>${escapeHtml(item.birdies)}</b><small>BIRDIES</small></span>
        </div>
      </div>
      <div class="credential-wallet">
        <span>Signing wallet</span><code title="${escapeHtml(item.wallet)}">${escapeHtml(shortAddress(item.wallet))}</code>
      </div>
      <div class="signature-row">
        <span>Signature captured · Score self-reported</span>
        <code title="${escapeHtml(item.signature)}">${escapeHtml(item.signature.slice(0, 14))}…</code>
      </div>
      <button class="share-record" type="button" data-share-round="${index}">Share signed record <span aria-hidden="true">↗</span></button>
      <p class="share-feedback" role="status" aria-live="polite"></p>
      <details class="proof-details"><summary>View the signed record</summary><pre>${escapeHtml(shareableRecord(item))}</pre></details>
    </article>
  `).join('')

  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div class="brand-lockup">
          <img class="brand-mark" src="/parfolio-mini-logo-v2.png" alt="ParFolio Mini logo" />
          <div>
            <p class="brand">ParFolio Mini</p>
            <p class="tagline">Your golf game. Recorded. Signed.</p>
          </div>
        </div>
        <div class="wallet-chip ${connected ? 'connected' : ''}">
          <span class="status-dot"></span>${escapeHtml(shortAddress(state.account))}
        </div>
      </header>

      <section class="hero glass-surface">
        <div class="hero-copy">
          <span class="nimiq-badge"><span class="badge-dot"></span>Powered by Nimiq Pay</span>
          <h1>Verify your golf round.<span> Own the result.</span></h1>
          <p class="hero-lede">Connect your Nimiq wallet, record your round, and sign the result. Your wallet signs the round details you enter and gives you a record you can share. The signature confirms the signing wallet, not the golf score.</p>
          <button id="connectWallet" class="primary hero-cta" type="button">${connected ? 'Wallet connected ✓' : window.nimiqPay ? 'Connect wallet' : 'Open in Nimiq Pay'}<span aria-hidden="true">→</span></button>
          <p id="walletMessage" class="helper" role="status" aria-live="polite">${connected ? `Connected as ${escapeHtml(state.account)}` : window.nimiqPay ? 'Tap Connect wallet and approve the Nimiq Pay account prompt. Your private keys never leave the wallet.' : 'Wallet connection works inside Nimiq Pay on your phone. Tap the button to open Mini there.'}</p>

          <div class="trust-row" aria-label="ParFolio Mini benefits">
            <span><i class="trust-icon">⌾</i><b>Secure & private</b></span>
            <span><i class="trust-icon">◇</i><b>Your record</b></span>
            <span><i class="trust-icon">✓</i><b>Wallet signed</b></span>
          </div>
        </div>

        <div class="hero-visual" aria-label="Example wallet-signed, player-entered golf round">
          <div class="hero-glow" aria-hidden="true"></div>
          <div class="visual-orbit orbit-one" aria-hidden="true"></div>
          <div class="visual-orbit orbit-two" aria-hidden="true"></div>
          <div class="phone-shell">
            <div class="phone-edge"></div>
            <div class="phone-screen">
              <div class="phone-status"><span>PARFOLIO MINI</span><span>✦ DEMO ROUND</span></div>
              <div class="phone-brand">
                <img src="/parfolio-mini-logo-v2.png" alt="" aria-hidden="true" />
                <div><strong>ParFolio Mini</strong><small>Your round. Signed.</small></div>
              </div>
              <span class="round-verified"><span></span>Wallet-signed record</span>
              <div class="score-orbit compact">
                <div class="orbit-ring"></div>
                <div class="score-ball">
                  <span>EXAMPLE</span>
                  <strong>72</strong>
                  <small>EVEN PAR</small>
                </div>
              </div>
              <div class="phone-stats">
                <span><b>18</b><small>HOLES</small></span>
                <span><b>72</b><small>SCORE</small></span>
                <span><b>+0</b><small>TO PAR</small></span>
              </div>
              <p class="phone-quote">“A player-entered round, signed by a wallet.”</p>
            </div>
          </div>
          <div class="glass-note glass-note-top" aria-hidden="true"><span class="note-icon">✦</span><span><b>Round details</b><small>Entered by the player</small></span></div>
          <div class="glass-note glass-note-bottom" aria-hidden="true"><span class="note-icon">✓</span><span><b>Wallet signature</b><small>Attached to this record</small></span></div>
          <div class="golf-ball-art" aria-hidden="true"><span>PF</span></div>
        </div>
      </section>

      <section class="steps-panel glass-surface" aria-label="How ParFolio Mini works">
        <p class="steps-kicker">Get started in three steps</p>
        <div class="steps">
          <article class="step-card">
            <div class="step-top"><strong>1</strong><span class="step-icon">▣</span></div>
            <h3>Connect wallet</h3>
            <p>Link your Nimiq wallet securely in seconds.</p>
          </article>
          <article class="step-card">
            <div class="step-top"><strong>2</strong><span class="step-icon">≡</span></div>
            <h3>Record round</h3>
            <p>Enter the round details you want to sign.</p>
          </article>
          <article class="step-card">
            <div class="step-top"><strong>3</strong><span class="step-icon">✓</span></div>
            <h3>Sign result</h3>
            <p>Sign your entered details with your wallet.</p>
          </article>
        </div>
      </section>

      <section class="golf-banner" aria-label="ParFolio Mini golf identity">
        <div>
          <p class="banner-title">A better game<br />goes further.</p>
          <p class="banner-kicker">Your round. Your signature.</p>
        </div>
        <div class="banner-mantra"><span>⚑</span><b>PLAY</b><b>SIGN</b><b>BELONG</b></div>
      </section>

      <div class="workspace-grid">
      <section class="panel" id="verifyRound">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Core experience</p>
            <h2>Sign a round</h2>
          </div>
          <span class="security">🔐 Signed by your wallet</span>
        </div>

        <form id="roundForm" class="round-form">
          <label>Course
            <input name="course" required maxlength="80" placeholder="e.g. Oak Quarry Golf Club" />
          </label>
          <div class="form-grid two">
            <label>Date
              <input name="date" type="date" required />
            </label>
            <label>Holes
              <select name="holes">
                <option value="18">18 holes</option>
                <option value="9">9 holes</option>
              </select>
            </label>
          </div>
          <div class="form-grid three">
            <label>Score
              <input name="score" type="number" min="18" max="200" inputmode="numeric" required placeholder="72" />
            </label>
            <label>Course par
              <input name="par" type="number" min="27" max="90" inputmode="numeric" required value="72" />
            </label>
            <label>Birdies
              <input name="birdies" type="number" min="0" max="18" inputmode="numeric" value="0" />
            </label>
          </div>
          <label>Longest drive <span class="optional">optional</span>
            <div class="unit-input"><input name="longestDrive" type="number" min="50" max="500" inputmode="numeric" placeholder="285" /><span>yd</span></div>
          </label>
          <button class="primary wide" type="submit" ${connected ? '' : 'disabled'}>✓ Sign Entered Round</button>
          <p id="formMessage" class="helper">${connected ? 'Nimiq Pay will ask you to sign your entered details. Mini does not independently validate the score.' : 'Connect your Nimiq wallet first. Mini does not independently validate scores.'}</p>
        </form>
      </section>

      <section class="records-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Saved on this device · Shareable proof</p>
            <h2>Your signed golf records</h2>
          </div>
          <span class="count">${state.verifiedRounds.length} signed</span>
        </div>
        <div class="records">${records || '<div class="empty">Your player-entered, wallet-signed rounds will appear here.</div>'}</div>
      </section>
      </div>

      <section class="coming-soon">
        <div>
          <p class="eyebrow">Next competition feature</p>
          <h2>Skill Challenges + NIM Rewards</h2>
          <p>Future challenges will need a way to confirm results beyond a player's own wallet signature before rewards can be awarded.</p>
        </div>
        <span class="soon-pill">Building next</span>
      </section>

      <footer>
        <span>ParFolio Mini · Competition Edition</span>
        <span>MIT licensed · No private keys stored</span>
      </footer>
    </main>
  `

  bindEvents()
}

const nimiqPayLink = 'https://nimpay.app/miniapps/open/parfolio-mini.vercel.app'

function withTimeout(promise, milliseconds, timeoutMessage) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(timeoutMessage)), milliseconds)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function getProvider() {
  if (state.provider) return state.provider
  state.provider = await withTimeout(
    init(),
    8000,
    'Nimiq Pay did not provide a wallet connection. Close Mini and open it again inside Nimiq Pay.',
  )
  return state.provider
}

async function connectWallet() {
  const button = document.querySelector('#connectWallet')
  const message = document.querySelector('#walletMessage')
  if (!window.nimiqPay) {
    message.textContent = 'Opening ParFolio Mini inside Nimiq Pay. Use a phone with Nimiq Pay installed.'
    window.location.assign(nimiqPayLink)
    return
  }
  if (state.account) {
    message.textContent = `Connected as ${state.account}`
    return
  }

  button.disabled = true
  button.textContent = 'Finding wallet…'
  message.textContent = 'Checking the Nimiq Pay wallet connection…'
  let approvalHint
  try {
    const provider = await getProvider()
    button.textContent = 'Awaiting approval…'
    message.textContent = 'Approve the account request in Nimiq Pay.'
    approvalHint = setTimeout(() => {
      message.textContent = 'Still waiting for Nimiq Pay. If no account prompt appeared, close Mini and reopen it inside Nimiq Pay.'
    }, 8000)
    const accounts = await withTimeout(
      provider.listAccounts(),
      45000,
      'No account response came from Nimiq Pay. Close Mini, reopen it, and tap Connect wallet again.',
    )
    if (!accounts?.length) throw new Error('Nimiq Pay returned no account. Please choose a wallet and try again.')
    state.account = accounts[0]
    render()

    // Network diagnostics are optional and must never hold the connected UI open.
    if (typeof provider.getBlockNumber === 'function') {
      Promise.resolve().then(() => provider.getBlockNumber()).then((height) => { state.blockNumber = height }).catch(() => {})
    }
  } catch (error) {
    button.disabled = false
    button.textContent = 'Connect wallet'
    message.textContent = error?.name === 'PermissionDeniedError'
      ? 'Account access was cancelled in Nimiq Pay. Tap Connect wallet to try again.'
      : error?.message || 'Wallet connection failed. Close Mini and try again.'
  } finally {
    clearTimeout(approvalHint)
  }
}

async function verifyRound(form) {
  const message = document.querySelector('#formMessage')
  const submit = form.querySelector('button[type="submit"]')
  if (!state.account) {
    message.textContent = 'Connect your Nimiq wallet first.'
    return
  }

  const data = new FormData(form)
  const round = {
    course: String(data.get('course') || '').trim(),
    date: String(data.get('date') || ''),
    holes: Number(data.get('holes')),
    score: Number(data.get('score')),
    par: Number(data.get('par')),
    birdies: Number(data.get('birdies') || 0),
    longestDrive: data.get('longestDrive') ? Number(data.get('longestDrive')) : null,
    createdAt: new Date().toISOString(),
  }

  if (!round.course || !round.date || !Number.isFinite(round.score) || !Number.isFinite(round.par)) {
    message.textContent = 'Please complete the required round details.'
    return
  }
  if (round.score < 18 || round.score > 200 || round.par < 27 || round.par > 90) {
    message.textContent = 'Please enter a realistic score and course par.'
    return
  }

  submit.disabled = true
  submit.textContent = 'Waiting for signature…'
  message.textContent = 'Approve the round signature in Nimiq Pay.'

  try {
    const provider = await getProvider()
    const messageToSign = roundMessage(round, state.account)
    const signed = await provider.sign(messageToSign)
    state.verifiedRounds.unshift({
      ...round,
      wallet: state.account,
      publicKey: signed.publicKey,
      signature: signed.signature,
      message: messageToSign,
      blockNumber: state.blockNumber,
    })
    saveRounds()
    render()
    requestAnimationFrame(() => document.querySelector('.records-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  } catch (error) {
    submit.disabled = false
    submit.textContent = '✓ Sign Entered Round'
    message.textContent = error?.message || 'Signature was cancelled or failed. Your round was not saved as wallet signed.'
  }
}

async function shareRecord(index, button) {
  const item = state.verifiedRounds[index]
  if (!item) return
  const feedback = button.parentElement.querySelector('.share-feedback')
  const text = shareableRecord(item)
  try {
    if (navigator.share) {
      await navigator.share({ title: `ParFolio Mini · ${item.course}`, text })
      feedback.textContent = 'Record shared.'
    } else {
      await navigator.clipboard.writeText(text)
      feedback.textContent = 'Signed record copied. You can paste it into a message.'
    }
  } catch (error) {
    if (error?.name !== 'AbortError') feedback.textContent = 'Sharing was unavailable. Please try again.'
  }
}

function bindEvents() {
  document.querySelector('#connectWallet')?.addEventListener('click', connectWallet)
  document.querySelectorAll('[data-share-round]').forEach((button) => button.addEventListener('click', () => shareRecord(Number(button.dataset.shareRound), button)))
  document.querySelector('#roundForm')?.addEventListener('submit', (event) => {
    event.preventDefault()
    verifyRound(event.currentTarget)
  })

  const dateInput = document.querySelector('input[name="date"]')
  if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().slice(0, 10)
}

render()
