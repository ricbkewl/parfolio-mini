import heroImage from './hero-image.js'
import './landing.css'

function scrollToRoundSetup() {
  document.querySelector('#verifyRound')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToHowItWorks() {
  document.querySelector('#howItWorks')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function connectWallet() {
  const button = document.querySelector('#connectWallet')
  if (button) {
    button.click()
    setTimeout(scrollToRoundSetup, 350)
  } else {
    scrollToRoundSetup()
  }
}

function ensureCompetitionLanding() {
  const app = document.querySelector('#app')
  if (!app || document.querySelector('.competition-landing')) return

  const landing = document.createElement('section')
  landing.className = 'competition-landing'
  landing.setAttribute('aria-label', 'ParFolio Mini introduction')
  landing.innerHTML = `
    <div class="landing-inner">
      <div class="landing-nav">
        <div class="landing-brand">
          <img src="/parfolio-mini-logo-v2.png" alt="ParFolio Mini" />
          <div><strong>ParFolio Mini</strong><span>Play · Score · Sign · Save</span></div>
        </div>
        <button class="wallet-launch" type="button" data-connect-wallet>Connect wallet</button>
      </div>

      <div class="hero-image-shell">
        <img id="competitionHeroImage" src="${heroImage}" alt="ParFolio Mini: play a GPS-ready golf course, track your round, connect a Nimiq wallet, and save a wallet-signed golf record." />
        <button class="hero-hotspot hero-hotspot-start" type="button" data-start-round aria-label="Start a round"></button>
        <button class="hero-hotspot hero-hotspot-how" type="button" data-how-it-works aria-label="How ParFolio Mini works"></button>
      </div>

      <div class="mobile-hero-actions" aria-label="ParFolio Mini actions">
        <button class="start-round" type="button" data-start-round>Start a Round <span aria-hidden="true">→</span></button>
        <button class="how-button" type="button" data-how-it-works>How It Works</button>
      </div>

      <section class="how-section" id="howItWorks">
        <div class="how-head">
          <div><p class="eyebrow">How it works</p><h2>From the first tee to a signed record.</h2></div>
          <p>ParFolio Mini keeps the competition experience focused: choose a GPS-ready course, score the round hole by hole, then sign the completed record with your Nimiq wallet.</p>
        </div>
        <div class="steps-grid">
          <article class="step"><span class="step-num">1</span><h3>Choose a course</h3><p>Search the GPS-ready California catalog and start a supported round.</p></article>
          <article class="step"><span class="step-num">2</span><h3>Track the round</h3><p>Use the ParFolio-style hole view, yardage, navigation and simple scoring controls.</p></article>
          <article class="step"><span class="step-num">3</span><h3>Sign & save</h3><p>Finish the round and sign the entered result with your connected Nimiq wallet.</p></article>
        </div>
      </section>

      <div class="final-cta">
        <div><h2>Ready to play?</h2><p>Start with a GPS-ready course and turn the finished round into your wallet-signed golf record.</p></div>
        <button type="button" data-start-round>Start a Round →</button>
      </div>
    </div>
  `

  app.parentNode.insertBefore(landing, app)

  landing.querySelectorAll('[data-start-round]').forEach((button) => button.addEventListener('click', scrollToRoundSetup))
  landing.querySelectorAll('[data-how-it-works]').forEach((button) => button.addEventListener('click', scrollToHowItWorks))
  landing.querySelector('[data-connect-wallet]')?.addEventListener('click', connectWallet)
}

function initLanding() {
  ensureCompetitionLanding()
  if (!document.querySelector('#verifyRound')) requestAnimationFrame(initLanding)
}

initLanding()
