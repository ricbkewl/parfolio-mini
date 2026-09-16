const HOME_PAGE='home'

function installStyles(){
  if(document.getElementById('pf-final-flow-polish'))return
  const s=document.createElement('style')
  s.id='pf-final-flow-polish'
  s.textContent=`
  .pf-app-page[data-page="home"] .hero{margin-top:0!important}
  .pf-app-page[data-page="home"] .pf-home-intro{margin-top:18px!important}
  .pf-app-page[data-page="play"] #roundForm{display:none!important}
  .pf-app-page[data-page="play"] #verifyRound{padding-top:4px;contain:layout style}
  .pf-app-page[data-page="play"] #verifyRound>.section-heading .eyebrow{display:none}
  .pf-app-page[data-page="play"] #verifyRound>.section-heading h2{font-size:clamp(1.55rem,5vw,2.3rem);margin-bottom:4px}
  .pf-play-path{margin:0 0 14px;padding:13px 14px;border:1px solid rgba(239,211,117,.22);border-radius:16px;background:linear-gradient(145deg,#0b3024,#071f18);color:#fff;min-height:118px;contain:layout paint;transform:translateZ(0)}
  .pf-play-path b{display:block;color:#efd476;margin-bottom:4px}.pf-play-path span{font-size:.8rem;color:#afc0b8;line-height:1.45}
  .pf-play-readiness{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px;min-height:30px;align-items:center}.pf-ready-pill{padding:6px 9px;border-radius:999px;font-size:.68rem;font-weight:850;border:1px solid rgba(255,255,255,.1);background:#12372b;color:#c2d0ca;white-space:nowrap}.pf-ready-pill.ok{color:#78d89d;border-color:rgba(83,206,132,.28);background:rgba(83,206,132,.08)}
  .pf-app-page[data-page="wallet"]>.pf-page-visual{display:none!important}
  .pf-my-identity-head{margin:0 0 14px;padding:18px;border-radius:22px;border:1px solid rgba(239,211,117,.22);background:radial-gradient(circle at 85% 10%,rgba(239,211,117,.16),transparent 28%),linear-gradient(145deg,#0b3527,#061d16);color:#fff}
  .pf-my-identity-head .pf-avatar{width:58px;height:58px;border-radius:18px;display:grid;place-items:center;background:#123c2e;border:1px solid rgba(239,211,117,.3);font:800 1.35rem Georgia,serif;color:#efd476;margin-bottom:12px}
  .pf-my-identity-head h1{margin:0 0 5px;font:800 clamp(2rem,7vw,3.6rem)/.98 Georgia,serif}.pf-my-identity-head p{margin:0;color:#afc0b8;line-height:1.5;max-width:720px}
  .pf-my-quick{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.pf-my-quick span{padding:6px 9px;border-radius:999px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.08);font-size:.68rem;color:#c4d1cb}.pf-my-quick .ok{color:#79d89e}
  .pf-wallet-subhead{margin:24px 0 10px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08)}.pf-wallet-subhead h2{margin:0 0 5px}.pf-wallet-subhead p{margin:0;color:#aebdb6;line-height:1.5}
  @media(max-width:720px){.pf-my-identity-head{padding:16px;border-radius:20px}.pf-my-identity-head h1{font-size:2.25rem}.pf-play-path{margin-left:0;margin-right:0;min-height:132px}}
  `
  document.head.appendChild(s)
}

function profile(){try{return JSON.parse(localStorage.getItem('parfolio-mini:profile-v1')||'null')}catch{return null}}
function walletReady(){return Boolean(document.querySelector('.wallet-chip.connected'))}
function clubCount(){try{return Object.keys(JSON.parse(localStorage.getItem('parfolio-mini:clubs-v1')||'{}')).length}catch{return 0}}
function roundCount(){try{return JSON.parse(localStorage.getItem('parfolio-mini:verified-rounds')||'[]').length}catch{return 0}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function polishHome(){
  const page=document.querySelector('.pf-app-page[data-page="home"]');if(!page)return
  const hero=page.querySelector('.hero'),intro=page.querySelector('.pf-home-intro')
  if(hero&&page.firstElementChild!==hero)page.insertBefore(hero,page.firstElementChild)
  if(intro&&hero&&intro.previousElementSibling!==hero)hero.insertAdjacentElement('afterend',intro)
}

function ensurePlayPath(){
  const page=document.querySelector('.pf-app-page[data-page="play"]'),verify=page?.querySelector('#verifyRound');if(!verify)return false
  const h=verify.querySelector('.section-heading h2');if(h&&h.textContent!=='Choose a GPS-ready course')h.textContent='Choose a GPS-ready course'
  const security=verify.querySelector('.section-heading .security');if(security&&security.textContent!=='Profile + wallet required')security.textContent='Profile + wallet required'
  let box=verify.querySelector('.pf-play-path')
  if(!box){
    box=document.createElement('div');box.className='pf-play-path'
    box.innerHTML='<b>One clean path to the first tee</b><span>Choose your course. ParFolio checks your player profile and Nimiq wallet, then everyone locks the match terms before the full-screen round opens.</span><div class="pf-play-readiness"><span class="pf-ready-pill" data-ready-profile></span><span class="pf-ready-pill" data-ready-wallet></span><span class="pf-ready-pill">3 · Match terms</span><span class="pf-ready-pill">4 · Start round</span></div>'
    verify.querySelector('.ca-course-finder')?.insertAdjacentElement('beforebegin',box)
  }
  const note=verify.querySelector('.course-finder-note'),text='Pick a supported course to continue. Before play begins, every player confirms the same reward terms and wallet details.'
  if(note&&note.textContent!==text)note.textContent=text
  refreshPlayReadiness()
  return true
}

function refreshPlayReadiness(){
  const box=document.querySelector('.pf-app-page[data-page="play"] .pf-play-path');if(!box)return
  const p=profile(),w=walletReady(),profilePill=box.querySelector('[data-ready-profile]'),walletPill=box.querySelector('[data-ready-wallet]')
  if(profilePill){profilePill.textContent=`${p?.name?'✓':'○'} Profile`;profilePill.classList.toggle('ok',Boolean(p?.name))}
  if(walletPill){walletPill.textContent=`${w?'✓':'○'} Nimiq wallet`;walletPill.classList.toggle('ok',w)}
}

function polishMy(){
  const page=document.querySelector('.pf-app-page[data-page="wallet"]');if(!page)return
  const p=profile()||{},readyWallet=walletReady(),clubs=clubCount(),rounds=roundCount()
  const title=page.querySelector('.pf-page-title');if(title)title.style.display='none'
  if(!page.querySelector('.pf-my-identity-head')){
    const head=document.createElement('section');head.className='pf-my-identity-head'
    const initials=(p.name||'My ParFolio').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'PF'
    head.innerHTML=`<div class="pf-avatar">${esc(initials)}</div><p class="eyebrow">My ParFolio</p><h1>${p.name?esc(p.name):'Your golf identity.'}</h1><p>This is your player home: profile, sign-in readiness, Nimiq wallet, club distances and signed rounds in one place.</p><div class="pf-my-quick"><span class="${p.name?'ok':''}">${p.name?'✓ Profile ready':'○ Complete profile'}</span><span class="${readyWallet?'ok':''}">${readyWallet?'✓ Wallet connected':'○ Connect wallet'}</span><span>${clubs} clubs saved</span><span>${rounds} signed rounds</span></div>`
    page.insertBefore(head,page.firstElementChild)
  }
  const grid=page.querySelector('.pf-nim-grid')
  if(grid&&!page.querySelector('.pf-wallet-subhead')){
    const sub=document.createElement('div');sub.className='pf-wallet-subhead';sub.innerHTML='<p class="eyebrow">Wallet & NIM</p><h2>Connect, fund and settle.</h2><p>New to NIM? Use the official Nimiq links below, then return here and connect Nimiq Pay before starting a reward match.</p>';grid.insertAdjacentElement('beforebegin',sub)
  }
}

function polishNav(){
  const drawer=document.querySelector('.pf-drawer');if(!drawer)return
  drawer.querySelectorAll('.pf-nav-item').forEach(btn=>{
    if(btn.dataset.page==='wallet'&&btn.textContent.trim()!=='My ParFolio')btn.innerHTML='<i>◎</i>My ParFolio'
    if(btn.dataset.page==='rounds'||btn.dataset.page==='clubs')btn.style.display='none'
  })
}

function runOnce(){installStyles();polishHome();ensurePlayPath();polishMy();polishNav()}

let tries=0
const bootTimer=setInterval(()=>{
  tries++
  runOnce()
  if(document.querySelector('.pf-pages')||tries>50)clearInterval(bootTimer)
},120)

window.addEventListener('parfolio:profile-updated',()=>{refreshPlayReadiness();polishMy()})
window.addEventListener('parfolio:wallet-updated',()=>{refreshPlayReadiness();polishMy()})
window.addEventListener('parfolio:course-selected',refreshPlayReadiness)
window.addEventListener('hashchange',()=>setTimeout(runOnce,0))
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-page]'))setTimeout(runOnce,0)
  if(e.target.closest?.('[data-pf-connect-now],[data-connect-profile-wallet],#connectWallet')){
    setTimeout(()=>{refreshPlayReadiness();polishMy()},900)
    setTimeout(()=>{refreshPlayReadiness();polishMy()},2200)
  }
},true)

runOnce()
