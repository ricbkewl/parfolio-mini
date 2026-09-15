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

function roundMessage(round) {
  return [
    'PARFOLIO MINI VERIFIED ROUND',
    `course=${round.course}`,
    `date=${round.date}`,
    `holes=${round.holes}`,
    `score=${round.score}`,
    `par=${round.par}`,
    `birdies=${round.birdies}`,
    `longestDriveYards=${round.longestDrive || 'n/a'}`,
    `wallet=${state.account}`,
    `createdAt=${round.createdAt}`,
  ].join('\n')
}

function render() {
  const connected = Boolean(state.account)
  const records = state.verifiedRounds.map((item) => `
    <article class="record-card">
      <div>
        <p class="eyebrow">Verified round</p>
        <h3>${escapeHtml(item.course)}</h3>
        <p class="record-meta">${escapeHtml(item.date)} · ${item.holes} holes · ${item.score} strokes</p>
      </div>
      <div class="record-score">${item.score - item.par > 0 ? '+' : ''}${item.score - item.par}</div>
      <div class="signature-row">
        <span>✓ Wallet signed</span>
        <code>${escapeHtml(item.signature.slice(0, 14))}…</code>
      </div>
    </article>
  `).join('')

  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div class="brand-lockup">
          <img class="brand-mark" src="/parfolio-mini-mark.svg" alt="ParFolio Mini logo" />
          <div>
            <p class="brand">ParFolio Mini</p>
            <p class="tagline">Your golf game. Verified. Rewarded.</p>
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
          <p class="hero-lede">Connect your Nimiq wallet, record your round, and sign the result. ParFolio Mini creates portable, wallet-signed golf proof that belongs to you.</p>
          <button id="connectWallet" class="primary hero-cta" type="button">${connected ? 'Wallet connected ✓' : 'Connect wallet'}<span aria-hidden="true">→</span></button>
          <p id="walletMessage" class="helper">${connected ? `Connected as ${escapeHtml(state.account)}` : 'Open inside Nimiq Pay to connect securely. Your private keys never leave the wallet.'}</p>

          <div class="trust-row" aria-label="ParFolio Mini benefits">
            <span><i class="trust-icon">⌾</i><b>Secure & private</b></span>
            <span><i class="trust-icon">◇</i><b>Player owned</b></span>
            <span><i class="trust-icon">✓</i><b>Wallet signed</b></span>
          </div>
        </div>

        <div class="hero-visual" aria-label="Example wallet-verified golf round">
          <div class="hero-glow" aria-hidden="true"></div>
          <div class="phone-shell">
            <div class="phone-edge"></div>
            <div class="phone-screen">
              <div class="phone-brand">
                <img src="/parfolio-mini-mark.svg" alt="" aria-hidden="true" />
                <div><strong>ParFolio Mini</strong><small>Your game. Verified.</small></div>
              </div>
              <span class="round-verified"><span></span>Round verified</span>
              <div class="score-orbit compact">
                <div class="orbit-ring"></div>
                <div class="score-ball">
                  <span>VERIFIED</span>
                  <strong>72</strong>
                  <small>EVEN PAR</small>
                </div>
              </div>
              <div class="phone-stats">
                <span><b>18</b><small>HOLES</small></span>
                <span><b>72</b><small>SCORE</small></span>
                <span><b>+0</b><small>TO PAR</small></span>
              </div>
              <p class="phone-quote">“A signed record of your best golf.”</p>
            </div>
          </div>
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
            <p>Enter the round details you want to verify.</p>
          </article>
          <article class="step-card">
            <div class="step-top"><strong>3</strong><span class="step-icon">✓</span></div>
            <h3>Sign result</h3>
            <p>Create player-owned proof with your wallet signature.</p>
          </article>
        </div>
      </section>

      <section class="golf-banner" aria-label="ParFolio Mini golf identity">
        <div>
          <p class="banner-title">A better game<br />goes further.</p>
          <p class="banner-kicker">Real rounds. Real ownership.</p>
        </div>
        <div class="banner-mantra"><span>⚑</span><b>PLAY</b><b>VERIFY</b><b>BELONG</b></div>
      </section>

      <section class="panel" id="verifyRound">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Core experience</p>
            <h2>Verify a round</h2>
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
          <button class="primary wide" type="submit" ${connected ? '' : 'disabled'}>✓ Verify & Sign Round</button>
          <p id="formMessage" class="helper">${connected ? 'Nimiq Pay will ask you to approve the signature.' : 'Connect your Nimiq wallet first.'}</p>
        </form>
      </section>

      <section class="records-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Player-owned history</p>
            <h2>Verified golf history</h2>
          </div>
          <span class="count">${state.verifiedRounds.length} verified</span>
        </div>
        <div class="records">${records || '<div class="empty">Your wallet-signed rounds will appear here.</div>'}</div>
      </section>

      <section class="coming-soon">
        <div>
          <p class="eyebrow">Next competition feature</p>
          <h2>Skill Challenges + NIM Rewards</h2>
          <p>Compete on measurable golf skill — lowest score, most birdies, closest-to-pin, or longest drive — with transparent NIM-funded rewards.</p>
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

async function getProvider() {
  if (state.provider) return state.provider
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Nimiq Pay provider not detected. Open ParFolio Mini inside Nimiq Pay.')), 5000))
  state.provider = await Promise.race([init(), timeout])
  return state.provider
}

async function connectWallet() {
  const button = document.querySelector('#connectWallet')
  const message = document.querySelector('#walletMessage')
  button.disabled = true
  button.textContent = 'Connecting…'
  message.textContent = 'Waiting for Nimiq Pay approval…'
  try {
    const provider = await getProvider()
    const accounts = await provider.listAccounts()
    if (!accounts?.length) throw new Error('No Nimiq account was returned.')
    state.account = accounts[0]
    const [ready, height] = await Promise.all([
      provider.isConsensusEstablished().catch(() => null),
      provider.getBlockNumber().catch(() => null),
    ])
    state.networkReady = ready
    state.blockNumber = height
    render()
  } catch (error) {
    button.disabled = false
    button.textContent = 'Connect wallet'
    message.textContent = error?.message || 'Wallet connection failed. Please try again.'
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
    const signed = await provider.sign(roundMessage(round))
    state.verifiedRounds.unshift({
      ...round,
      wallet: state.account,
      publicKey: signed.publicKey,
      signature: signed.signature,
      blockNumber: state.blockNumber,
    })
    saveRounds()
    render()
    requestAnimationFrame(() => document.querySelector('.records-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  } catch (error) {
    submit.disabled = false
    submit.textContent = '✓ Verify & Sign Round'
    message.textContent = error?.message || 'Signature was cancelled or failed. Your round was not marked verified.'
  }
}

function bindEvents() {
  document.querySelector('#connectWallet')?.addEventListener('click', connectWallet)
  document.querySelector('#roundForm')?.addEventListener('submit', (event) => {
    event.preventDefault()
    verifyRound(event.currentTarget)
  })

  const dateInput = document.querySelector('input[name="date"]')
  if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().slice(0, 10)
}

render()
