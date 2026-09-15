import heroImage from './hero-image.js'
import './landing.css'

const hero = document.querySelector('#competitionHeroImage')
if (hero) hero.src = heroImage

function scrollToRoundSetup() {
  document.querySelector('#verifyRound')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

document.querySelectorAll('[data-start-round]').forEach((button) => {
  button.addEventListener('click', scrollToRoundSetup)
})

document.querySelector('[data-how-it-works]')?.addEventListener('click', () => {
  document.querySelector('#howItWorks')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
})

document.querySelector('[data-connect-wallet]')?.addEventListener('click', connectWallet)
