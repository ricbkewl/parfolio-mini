const HERO_IMAGE='/parfolio-mini-hero.webp'

function installLandingStyles(){
  if(document.getElementById('pf-mini-landing-polish'))return
  const style=document.createElement('style')
  style.id='pf-mini-landing-polish'
  style.textContent=`
    .hero{align-items:center!important}
    .hero-copy h1{max-width:760px!important;line-height:.98!important}
    .hero-copy h1 span{display:inline!important}
    .hero-lede{max-width:700px!important;font-size:1.04rem!important;line-height:1.55!important}
    .hero-visual{display:block!important;min-height:0!important;padding:0!important;background:none!important;overflow:hidden!important;border-radius:24px!important}
    .hero-visual>*{display:none!important}
    .hero-visual .pf-mini-hero-art{display:block!important;width:100%!important;height:auto!important;border-radius:24px!important;border:1px solid rgba(242,214,117,.24)!important;box-shadow:0 24px 70px rgba(0,0,0,.28)!important}
    .pf-mini-value-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:18px 0 0}
    .pf-mini-value-strip span{display:flex;gap:9px;align-items:center;padding:12px 14px;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(255,255,255,.035);color:#e9efeb;font-size:.82rem;line-height:1.3}
    .pf-mini-value-strip b{display:block;color:#f1d476;font-size:.72rem;letter-spacing:.04em;text-transform:uppercase}
    .pf-mini-purpose{margin:18px 0 0;padding:14px 16px;border-left:3px solid #e4c668;background:rgba(228,198,104,.07);border-radius:0 14px 14px 0;color:#d9e2dd;font-size:.9rem;line-height:1.5}
    .pf-mini-purpose strong{color:#fff}
    .steps-panel .steps-kicker{color:#e6cb72!important}
    .golf-banner{display:none!important}
    .coming-soon{display:none!important}
    #verifyRound .section-heading h2::after{content:' — play first, sign when finished';font-size:.48em;font-weight:600;color:#a9b7b1}
    .ca-course-finder{border:1px solid rgba(228,198,104,.18)!important;background:linear-gradient(180deg,rgba(228,198,104,.05),rgba(255,255,255,.02))!important}
    .pf-mini-competition-note{margin:10px 0 0;color:#9fb0a8;font-size:.76rem;line-height:1.45}
    @media(max-width:860px){
      .hero{grid-template-columns:1fr!important}
      .hero-copy{order:1!important}.hero-visual{order:0!important;margin-bottom:4px!important}
      .pf-mini-value-strip{grid-template-columns:1fr!important}
      .hero-copy h1{font-size:clamp(2.15rem,10vw,3.5rem)!important}
    }
  `
  document.head.appendChild(style)
}

function decorateLanding(){
  installLandingStyles()
  const hero=document.querySelector('.hero')
  if(hero&&hero.dataset.competitionPolished!=='1'){
    hero.dataset.competitionPolished='1'
    const title=hero.querySelector('.hero-copy h1')
    if(title)title.innerHTML='Play your round.<br>Save your score.<br><span>Own your golf record.</span>'
    const lede=hero.querySelector('.hero-lede')
    if(lede)lede.textContent='Find a GPS-ready course, track your round hole by hole, then sign the completed result with your Nimiq wallet to create a shareable golf record you control.'
    const button=hero.querySelector('#connectWallet')
    if(button){
      const connected=document.querySelector('.wallet-chip.connected')
      button.innerHTML=connected?'Start a Round <span aria-hidden="true">→</span>':'Connect wallet to start <span aria-hidden="true">→</span>'
    }
    const helper=hero.querySelector('#walletMessage')
    if(helper&&!document.querySelector('.wallet-chip.connected'))helper.textContent=window.nimiqPay?'Connect your Nimiq wallet, then choose a GPS-ready California course below.':'Open this Mini App inside Nimiq Pay to connect your wallet and start a round.'
    const visual=hero.querySelector('.hero-visual')
    if(visual){
      const image=document.createElement('img')
      image.className='pf-mini-hero-art'
      image.src=HERO_IMAGE
      image.alt='ParFolio Mini: choose a GPS-ready course, track a golf round hole by hole, and save a wallet-signed golf record.'
      visual.appendChild(image)
    }
    const copy=hero.querySelector('.hero-copy')
    if(copy&&!copy.querySelector('.pf-mini-value-strip')){
      const strip=document.createElement('div')
      strip.className='pf-mini-value-strip'
      strip.innerHTML=`
        <span><i>⌖</i><span><b>1 · Choose</b>GPS-ready course</span></span>
        <span><i>⛳</i><span><b>2 · Play</b>Score hole by hole</span></span>
        <span><i>✓</i><span><b>3 · Own</b>Sign & save the record</span></span>`
      copy.appendChild(strip)
      const purpose=document.createElement('p')
      purpose.className='pf-mini-purpose'
      purpose.innerHTML='<strong>Why Nimiq?</strong> Your wallet signature proves which wallet signed the round record. It does not independently prove the golf score.'
      copy.appendChild(purpose)
    }
  }

  const steps=document.querySelector('.steps-panel')
  if(steps&&steps.dataset.competitionPolished!=='1'){
    steps.dataset.competitionPolished='1'
    const kicker=steps.querySelector('.steps-kicker');if(kicker)kicker.textContent='One simple golf flow'
    const cards=steps.querySelectorAll('.step-card')
    const data=[
      ['Choose a course','Search a GPS-ready California course and launch the round.'],
      ['Play & score','Use the course map and enter your score as you move hole by hole.'],
      ['Sign & save','Finish the round and sign the completed record with your Nimiq wallet.'],
    ]
    cards.forEach((card,index)=>{if(!data[index])return;const h=card.querySelector('h3'),p=card.querySelector('p');if(h)h.textContent=data[index][0];if(p)p.textContent=data[index][1]})
  }

  const finder=document.querySelector('.ca-course-finder')
  if(finder&&!finder.querySelector('.pf-mini-competition-note')){
    const note=document.createElement('p')
    note.className='pf-mini-competition-note'
    note.textContent='Competition edition: supported courses are intentionally limited to ParFolio GPS-ready California courses so every listed course has reviewed hole geometry before play.'
    finder.appendChild(note)
  }
}

let queued=false
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorateLanding()})}
new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:true})
decorateLanding()
setTimeout(decorateLanding,250)
