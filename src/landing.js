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

function prepareHeroArtwork(landing) {
  const hero = landing.querySelector('#competitionHeroImage')
  if (!hero) return
  hero.src = heroImage

  const shell = hero.closest('.hero-art') || hero.parentElement
  if (!shell) return
  shell.classList.add('hero-image-shell')

  if (!shell.querySelector('.hero-hotspot-start')) {
    const start = document.createElement('button')
    start.type = 'button'
    start.className = 'hero-hotspot hero-hotspot-start'
    start.dataset.startRound = ''
    start.setAttribute('aria-label', 'Start a round')
    shell.appendChild(start)
  }

  if (!shell.querySelector('.hero-hotspot-how')) {
    const how = document.createElement('button')
    how.type = 'button'
    how.className = 'hero-hotspot hero-hotspot-how'
    how.dataset.howItWorks = ''
    how.setAttribute('aria-label', 'How ParFolio Mini works')
    shell.appendChild(how)
  }
}

function wireLanding() {
  const landing = document.querySelector('.competition-landing')
  if (!landing || landing.dataset.wired === '1') return false

  prepareHeroArtwork(landing)
  landing.dataset.wired = '1'

  landing.querySelectorAll('[data-start-round]').forEach((button) => {
    button.addEventListener('click', scrollToRoundSetup)
  })
  landing.querySelectorAll('[data-how-it-works]').forEach((button) => {
    button.addEventListener('click', scrollToHowItWorks)
  })
  landing.querySelectorAll('[data-connect-wallet]').forEach((button) => {
    button.addEventListener('click', connectWallet)
  })
  return true
}

function initLanding() {
  wireLanding()
  if (!document.querySelector('#verifyRound')) requestAnimationFrame(initLanding)
}

initLanding()
