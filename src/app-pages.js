const PAGE_KEY='parfolio-mini:page-v1'

const PAGE_IMAGES={
  home:'/A07131CC-8C1C-4BA1-8ECC-02FCE25E8FB1.png',
  play:'/71801855-9EE9-4DB6-AB7C-AAD29FF7CEB8.png',
  skins:'/AF31B066-16CA-4694-B548-557289482F11.png',
  wallet:'/24990F69-5962-4C9C-858C-685D08F5C222.png',
  rounds:'/7B60F61E-9FDB-481C-B77F-DAAD3E8B3C90.png',
  clubs:'/32F7D526-6622-4CD2-AD7D-FE737120E318.png',
  how:'/B4E75CCF-E78D-4FEB-A48F-1088618A56B2.png'
}

function installPageStyles(){
  if(document.getElementById('pf-pages-style'))return
  const style=document.createElement('style')
  style.id='pf-pages-style'
  style.textContent=`
  body{padding-top:74px!important}
  .pf-pages{width:min(100%,1080px);margin:0 auto;padding:0 20px max(34px,env(safe-area-inset-bottom))}
  .pf-app-page{display:none;animation:pfPageIn .18s ease}.pf-app-page.active{display:block}
  @keyframes pfPageIn{from{opacity:.55;transform:translateY(5px)}to{opacity:1;transform:none}}
  .pf-page-visual{margin:0 0 22px;border-radius:28px;overflow:hidden;border:1px solid rgba(229,199,99,.22);background:#061b13;box-shadow:0 22px 55px rgba(0,0,0,.24)}
  .pf-page-visual img{display:block;width:100%;aspect-ratio:16/7;object-fit:cover;background:#061b13}
  .pf-page-title{margin:0 0 18px}.pf-page-title .eyebrow{margin-bottom:6px}.pf-page-title h1{max-width:none;font-size:clamp(2.1rem,6vw,4rem);line-height:.98;margin:0 0 10px}.pf-page-title p{max-width:760px;color:#afc0b8;line-height:1.55;margin:0}
  .pf-nim-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:18px}.pf-nim-card,.pf-flow-card{border:1px solid rgba(255,255,255,.09);background:linear-gradient(155deg,rgba(12,45,34,.92),rgba(5,26,19,.92));border-radius:22px;padding:20px}.pf-nim-card h2,.pf-flow-card h3{margin:0 0 8px}.pf-nim-card p,.pf-flow-card p{color:#aebeb6;line-height:1.55}.pf-nim-steps{display:grid;gap:10px;margin-top:14px}.pf-nim-step{display:grid;grid-template-columns:38px 1fr;gap:11px;align-items:start;padding:12px;border-radius:15px;background:rgba(255,255,255,.045)}.pf-nim-step strong{width:38px;height:38px;display:grid;place-items:center;border-radius:50%;background:rgba(232,204,107,.14);color:#f0d77c}.pf-nim-step b{display:block;margin-bottom:3px}.pf-nim-step span{font-size:.78rem;color:#a9bbb2;line-height:1.4}
  .pf-nim-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:15px}.pf-nim-actions a,.pf-nim-actions button{min-height:45px;border-radius:12px;padding:0 14px;font-weight:900;text-decoration:none;display:inline-flex;align-items:center;border:1px solid rgba(232,204,107,.34);background:#e1c66b;color:#102017}.pf-nim-actions .secondary{background:#13372c;color:#fff;border-color:rgba(255,255,255,.13)}
  .pf-required{margin-top:14px;padding:12px 14px;border-radius:14px;background:rgba(225,198,107,.10);border:1px solid rgba(225,198,107,.28);color:#e9d582;font-size:.82rem;line-height:1.45}
  .pf-flow-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.pf-flow-card b{color:#efd477}.pf-app-page>.panel,.pf-app-page>.records-section,.pf-app-page>.pf-extra-section,.pf-app-page>.pf-skins-home{margin-top:18px}
  .pf-app-page .hero{margin:0}.pf-app-page .steps-panel,.pf-app-page .golf-banner{margin-top:20px}
  .pf-drawer .pf-nav-item.active{background:rgba(239,212,118,.11);color:#f4dd8b}.pf-drawer .pf-nav-item.active i{color:#f4dd8b}
  .workspace-grid:empty{display:none}.shell>.workspace-grid{display:none!important}
  @media(max-width:760px){.pf-pages{padding:0 12px max(28px,env(safe-area-inset-bottom))}.pf-page-visual{border-radius:20px}.pf-page-visual img{aspect-ratio:4/3;object-fit:cover}.pf-nim-grid{grid-template-columns:1fr}.pf-flow-grid{grid-template-columns:1fr 1fr}}
  @media(max-width:440px){.pf-flow-grid{grid-template-columns:1fr}.pf-page-title h1{font-size:2.35rem}}
  `
  document.head.appendChild(style)
}

function pageHeader(kicker,title,copy,image,alt=''){
  return `<div class="pf-page-visual"><img src="${image}" alt="${alt}" loading="eager" decoding="async"></div><div class="pf-page-title"><p class="eyebrow">${kicker}</p><h1>${title}</h1><p>${copy}</p></div>`
}

function walletConnected(){return Boolean(document.querySelector('.wallet-chip.connected'))}

function buildWalletPage(){
  const page=document.createElement('section');page.className='pf-app-page';page.dataset.page='wallet'
  page.innerHTML=`${pageHeader('Wallet & NIM','New to NIM? Start here.','ParFolio Mini uses Nimiq Pay for wallet connection, round signing, and direct peer-to-peer NIM settlement. You need a Nimiq wallet connected before starting a round.',PAGE_IMAGES.wallet,'Nimiq wallet onboarding for ParFolio Mini')}
  <div class="pf-nim-grid"><article class="pf-nim-card"><h2>Get ready in four steps</h2><div class="pf-nim-steps">
  <div class="pf-nim-step"><strong>1</strong><div><b>Get Nimiq Pay</b><span>Nimiq Pay is the mobile payment app for iOS and Android.</span></div></div>
  <div class="pf-nim-step"><strong>2</strong><div><b>Create or connect your wallet</b><span>Create a self-custodial Nimiq wallet and securely back up your recovery information.</span></div></div>
  <div class="pf-nim-step"><strong>3</strong><div><b>Add some NIM</b><span>Your wallet needs NIM if you want to participate in NIM-based skins and settle with other players.</span></div></div>
  <div class="pf-nim-step"><strong>4</strong><div><b>Return to ParFolio Mini</b><span>Connect Nimiq Pay here, then choose your course and start playing.</span></div></div>
  </div><div class="pf-nim-actions"><a href="https://www.nimiq.com/nimiq-pay/" target="_blank" rel="noopener noreferrer">Get Nimiq Pay ↗</a><a class="secondary" href="https://www.nimiq.com/wallet/" target="_blank" rel="noopener noreferrer">Create Nimiq wallet ↗</a></div></article>
  <article class="pf-nim-card"><h2>What is NIM?</h2><p>NIM is the native currency of the Nimiq blockchain. In ParFolio Mini, it can be used for optional hole-by-hole skins and direct wallet-to-wallet settlement after the round.</p><p>ParFolio Mini does not hold player funds. Players approve their own payments in Nimiq Pay.</p><div class="pf-required"><b>Required to play:</b> connect a Nimiq wallet before starting a ParFolio Mini round. If you are only browsing the app, you can explore the pages first.</div><div class="pf-nim-actions"><button type="button" data-pf-connect-now>${walletConnected()?'Wallet connected ✓':'Connect Nimiq Pay'}</button></div></article></div>`
  return page
}

function buildHowPage(){
  const page=document.createElement('section');page.className='pf-app-page';page.dataset.page='how'
  page.innerHTML=`${pageHeader('How It Works','From wallet to final putt.','ParFolio Mini keeps the golf experience simple: connect once, pick a GPS-ready course, play full-screen, and settle only after the scores are final.',PAGE_IMAGES.how,'How ParFolio Mini works')}
  <div class="pf-flow-grid"><article class="pf-flow-card"><b>1 · Connect</b><h3>Nimiq Pay</h3><p>Connect the wallet that will sign your round and handle NIM settlement.</p></article><article class="pf-flow-card"><b>2 · Choose</b><h3>GPS-ready course</h3><p>Find a supported course and open the full-screen ParFolio playing experience.</p></article><article class="pf-flow-card"><b>3 · Play</b><h3>Golf first</h3><p>Use yardage, planning, scorecard, wind, shot tracking and optional skins.</p></article><article class="pf-flow-card"><b>4 · Finish</b><h3>Sign & settle</h3><p>Finish the round, sign your record, and approve any NIM settlement directly in your wallet.</p></article></div>`
  return page
}

function makePage(name,headerHtml,nodes=[]){const p=document.createElement('section');p.className='pf-app-page';p.dataset.page=name;if(headerHtml)p.insertAdjacentHTML('beforeend',headerHtml);nodes.filter(Boolean).forEach(n=>p.appendChild(n));return p}

function buildPages(){
  if(document.querySelector('.pf-pages'))return
  const shell=document.querySelector('main.shell');if(!shell)return
  const homeNodes=[document.querySelector('.pf-home-intro'),document.querySelector('.hero'),document.querySelector('.steps-panel'),document.querySelector('.golf-banner')]
  const playNode=document.querySelector('#verifyRound'),join=document.querySelector('#pfJoinRound'),skins=document.querySelector('.pf-skins-home'),howSkins=document.querySelector('#pfHowToPlay'),rounds=document.querySelector('.records-section'),clubs=document.querySelector('#pfMyClubs')
  if(!playNode||!skins||!rounds||!clubs)return
  const pages=document.createElement('div');pages.className='pf-pages'
  pages.appendChild(makePage('home','',homeNodes))
  pages.appendChild(makePage('play',pageHeader('Play','Play ParFolio full-screen.','Browse GPS-ready courses, start a round, use live yardage and scoring, or join your group with a code or QR.',PAGE_IMAGES.play,'ParFolio Mini GPS golf play'),[playNode,join]))
  pages.appendChild(makePage('skins',pageHeader('Skins','Add something to every hole.','Set the NIM value before play, lock the scores hole by hole, let ties carry, then settle directly with your group after the round.',PAGE_IMAGES.skins,'ParFolio Mini NIM skins competition'),[skins,howSkins]))
  pages.appendChild(buildWalletPage())
  pages.appendChild(makePage('rounds',pageHeader('My Rounds','Your game. Your record.','Review the rounds you have finished and the wallet-signed records you have chosen to keep.',PAGE_IMAGES.rounds,'ParFolio Mini signed golf rounds'),[rounds]))
  pages.appendChild(makePage('clubs',pageHeader('My Clubs','Know your carry.','Save the distances you actually hit so ParFolio Mini can make better on-course club suggestions.',PAGE_IMAGES.clubs,'ParFolio Mini club distances'),[clubs]))
  pages.appendChild(buildHowPage())
  shell.parentElement.insertBefore(pages,shell.nextSibling);shell.style.display='none'
  installNavigation()
  showPage(location.hash.replace('#/','')||localStorage.getItem(PAGE_KEY)||'home',false)
}

function navMarkup(){return `<div class="pf-drawer-head"><b>ParFolio Mini</b><button class="pf-drawer-close" type="button">×</button></div><div class="pf-nav-group"><div class="pf-nav-label">App</div><button class="pf-nav-item" data-page="home"><i>⌂</i>Home</button><button class="pf-nav-item" data-page="play"><i>⛳</i>Play</button><button class="pf-nav-item" data-page="skins"><i>🏆</i>Skins</button><button class="pf-nav-item" data-page="wallet"><i>◈</i>Wallet & NIM</button><button class="pf-nav-item" data-page="rounds"><i>≡</i>My Rounds</button><button class="pf-nav-item" data-page="clubs"><i>♢</i>My Clubs</button><button class="pf-nav-item" data-page="how"><i>?</i>How It Works</button></div>`}

function closeDrawer(){document.querySelector('.pf-drawer')?.classList.remove('open');document.querySelector('.pf-drawer-backdrop')?.classList.remove('open')}

function showPage(name,push=true){
  const allowed=['home','play','skins','wallet','rounds','clubs','how'];if(!allowed.includes(name))name='home'
  document.querySelectorAll('.pf-app-page').forEach(p=>p.classList.toggle('active',p.dataset.page===name))
  document.querySelectorAll('.pf-nav-item[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===name))
  localStorage.setItem(PAGE_KEY,name);if(push&&location.hash!==`#/${name}`)history.pushState({page:name},'',`#/${name}`)
  closeDrawer();window.scrollTo({top:0,behavior:'instant'});document.title=`ParFolio Mini · ${name==='home'?'Golf. Compete. Settle in NIM.':name[0].toUpperCase()+name.slice(1)}`
}

function installNavigation(){
  const drawer=document.querySelector('.pf-drawer');if(drawer){drawer.innerHTML=navMarkup();drawer.querySelector('.pf-drawer-close')?.addEventListener('click',closeDrawer)}
  document.addEventListener('click',event=>{
    const pageBtn=event.target.closest?.('[data-page]');if(pageBtn){event.preventDefault();event.stopImmediatePropagation();showPage(pageBtn.dataset.page);return}
    const connect=event.target.closest?.('[data-pf-connect-now]');if(connect){const original=document.querySelector('#connectWallet');if(original){original.click();setTimeout(()=>{connect.textContent=walletConnected()?'Wallet connected ✓':'Connect Nimiq Pay'},500)}return}
    const course=event.target.closest?.('[data-use-pf-course]');if(course&&!walletConnected()){event.preventDefault();event.stopImmediatePropagation();showPage('wallet');setTimeout(()=>window.alert('Connect your Nimiq wallet before starting a ParFolio Mini round.'),80)}
    const start=event.target.closest?.('[data-pf-start-round]');if(start&&!walletConnected()){event.preventDefault();event.stopImmediatePropagation();showPage('wallet')}
  },true)
  window.addEventListener('popstate',()=>showPage(location.hash.replace('#/','')||'home',false))
}

function boot(){installPageStyles();let tries=0;const timer=setInterval(()=>{tries++;buildPages();if(document.querySelector('.pf-pages')||tries>50)clearInterval(timer)},120)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot()
