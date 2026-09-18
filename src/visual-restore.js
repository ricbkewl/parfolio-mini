// Restore the original premium ParFolio Mini artwork and keep core navigation complete.
// Uses bounded/event-driven passes only; no document-wide MutationObserver.

const VISUALS={
  home:'./9B68D5FF-8CCE-40FA-8F35-7F5828913002.png',
  play:'./24C0A58C-92A8-4778-9031-96CC85894A3E.png',
  wallet:'./905BCCA7-6CD7-4A83-BD0E-BCB1E0C871CF.png',
  rounds:'./417CAD54-2A36-4671-834C-1CBA0D148224.png',
  clubs:'./A0077D56-18EF-43BC-9C9F-0312956363F5.png',
  how:'./E9CA092A-116F-4D8E-AE7E-C13A43D52E41.png'
}

const ALTS={
  play:'ParFolio Mini GPS golf play',
  wallet:'ParFolio Mini player profile, Nimiq wallet and signed-round identity',
  rounds:'ParFolio Mini signed golf rounds',
  clubs:'ParFolio Mini golf bag and club distances',
  how:'How ParFolio Mini works'
}

function installRestoreStyles(){
  if(document.getElementById('pf-visual-restore-style'))return
  const s=document.createElement('style')
  s.id='pf-visual-restore-style'
  s.textContent=`
    .pf-app-page>.pf-page-visual{display:block!important;visibility:visible!important;opacity:1!important}
    .pf-app-page>.pf-page-visual img{display:block!important;width:100%!important;height:auto!important;max-height:none!important;object-fit:contain!important}
  `
  document.head.appendChild(s)
}

function ensurePageVisual(page,src){
  const section=document.querySelector(`.pf-app-page[data-page="${page}"]`)
  if(!section)return

  let visual=section.querySelector(':scope > .pf-page-visual')
  if(!visual){
    visual=document.createElement('div')
    visual.className='pf-page-visual pf-restored-visual'
    const first=section.firstElementChild
    section.insertBefore(visual,first||null)
  }

  let img=visual.querySelector('img')
  if(!img){
    img=document.createElement('img')
    visual.appendChild(img)
  }

  if(img.getAttribute('src')!==src)img.src=src
  img.alt=ALTS[page]||'ParFolio Mini'
  img.loading='eager'
  img.decoding='async'
}

function ensureCoreNav(){
  const drawer=document.querySelector('.pf-drawer')
  if(!drawer)return
  const group=drawer.querySelector('.pf-nav-group')
  if(!group)return

  const how=drawer.querySelector('.pf-nav-item[data-page="how"]')
  if(!drawer.querySelector('.pf-nav-item[data-page="rounds"]')){
    const b=document.createElement('button')
    b.className='pf-nav-item'
    b.type='button'
    b.dataset.page='rounds'
    b.innerHTML='<i>≡</i>My Rounds'
    group.insertBefore(b,how||null)
  }
  if(!drawer.querySelector('.pf-nav-item[data-page="clubs"]')){
    const b=document.createElement('button')
    b.className='pf-nav-item'
    b.type='button'
    b.dataset.page='clubs'
    b.innerHTML='<i>♢</i>My Clubs'
    group.insertBefore(b,how||null)
  }
}

function restoreVisuals(){
  installRestoreStyles()

  const hero=document.querySelector('.pf-hero-art')
  if(hero&&hero.getAttribute('src')!==VISUALS.home){
    hero.src=VISUALS.home
    hero.alt='ParFolio Mini golf, GPS play and Nimiq wallet experience'
  }

  Object.entries(VISUALS).forEach(([page,src])=>{
    if(page!=='home')ensurePageVisual(page,src)
  })

  ensureCoreNav()
}

let passes=0
const timer=setInterval(()=>{
  passes+=1
  restoreVisuals()
  if(passes>=80)clearInterval(timer)
},150)

window.addEventListener('hashchange',()=>setTimeout(restoreVisuals,20))
window.addEventListener('parfolio:auth-updated',()=>setTimeout(restoreVisuals,20))
window.addEventListener('parfolio:profile-updated',()=>setTimeout(restoreVisuals,20))
window.addEventListener('parfolio:rounds-updated',()=>setTimeout(restoreVisuals,20))
window.addEventListener('parfolio:clubs-updated',()=>setTimeout(restoreVisuals,20))
document.addEventListener('click',()=>setTimeout(restoreVisuals,40),true)
restoreVisuals()
