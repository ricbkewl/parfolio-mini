function installHeroActionStyles(){
  if(document.getElementById('pf-mini-hero-actions-style'))return
  const style=document.createElement('style')
  style.id='pf-mini-hero-actions-style'
  style.textContent=`
    .hero-visual{position:relative!important}
    .pf-mini-hero-hotspot{position:absolute;z-index:20;border:0;background:transparent;border-radius:16px;cursor:pointer;-webkit-tap-highlight-color:transparent}
    .pf-mini-hero-hotspot.start{left:5.3%;top:64.0%;width:20.8%;height:9.0%}
    .pf-mini-hero-hotspot.how{left:27.0%;top:64.0%;width:15.2%;height:9.0%}
    .pf-mini-hero-hotspot:focus-visible{outline:3px solid #fff;outline-offset:2px;background:rgba(255,255,255,.05)}
    @media(hover:hover) and (pointer:fine){.pf-mini-hero-hotspot:hover{background:rgba(255,255,255,.035)}}
  `
  document.head.appendChild(style)
}

function scrollToRound(){
  const target=document.querySelector('#verifyRound')||document.querySelector('.ca-course-finder')
  target?.scrollIntoView({behavior:'smooth',block:'start'})
}

function scrollToHow(){
  const target=document.querySelector('.steps-panel')||document.querySelector('#howItWorks')
  target?.scrollIntoView({behavior:'smooth',block:'start'})
}

function wireHeroActions(){
  installHeroActionStyles()
  const visual=document.querySelector('.hero-visual')
  const image=visual?.querySelector('.pf-mini-hero-art')
  if(!visual||!image||visual.dataset.heroActions==='1')return false
  visual.dataset.heroActions='1'

  const start=document.createElement('button')
  start.type='button'
  start.className='pf-mini-hero-hotspot start'
  start.setAttribute('aria-label','Start a Round')
  start.addEventListener('click',scrollToRound)

  const how=document.createElement('button')
  how.type='button'
  how.className='pf-mini-hero-hotspot how'
  how.setAttribute('aria-label','How It Works')
  how.addEventListener('click',scrollToHow)

  visual.append(start,how)
  return true
}

let queued=false
function schedule(){
  if(queued)return
  queued=true
  requestAnimationFrame(()=>{queued=false;wireHeroActions()})
}

new MutationObserver(schedule).observe(document.getElementById('app')||document.body,{childList:true,subtree:true})
wireHeroActions()
setTimeout(wireHeroActions,300)
