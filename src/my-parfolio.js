const PROFILE_KEY='parfolio-mini:profile-v1'
const CLUBS_KEY='parfolio-mini:clubs-v1'
const ROUNDS_KEY='parfolio-mini:verified-rounds'

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))

function connectedWallet(){
  const text=document.querySelector('#walletMessage')?.textContent||''
  const m=text.match(/Connected as\s+(.+?)\.\s*Tap/i)
  return m?.[1]?.trim()||''
}
function walletReady(){return Boolean(document.querySelector('.wallet-chip.connected'))}
function loadProfile(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')}catch{return null}}
function saveProfile(p){localStorage.setItem(PROFILE_KEY,JSON.stringify(p));window.dispatchEvent(new CustomEvent('parfolio:profile-updated',{detail:p}))}
function loadClubs(){try{return JSON.parse(localStorage.getItem(CLUBS_KEY)||'{}')}catch{return {}}}
function roundCount(){try{return JSON.parse(localStorage.getItem(ROUNDS_KEY)||'[]').length}catch{return 0}}

function installStyles(){
  if(document.getElementById('pf-my-style'))return
  const s=document.createElement('style');s.id='pf-my-style';s.textContent=`
  .pf-my-hub{margin:18px 0;display:grid;grid-template-columns:1.1fr .9fr;gap:14px}.pf-my-card{border:1px solid rgba(255,255,255,.09);background:linear-gradient(155deg,#0b3024,#071f18);border-radius:20px;padding:18px;color:#fff}.pf-my-card h2,.pf-my-card h3{margin:0 0 8px}.pf-my-card p{color:#aebdb6;line-height:1.5}.pf-profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pf-profile-grid label{font-size:.72rem;color:#9fb1a8}.pf-profile-grid input{width:100%;margin-top:4px;border:1px solid rgba(255,255,255,.12);background:#061d16;color:#fff;border-radius:11px;padding:10px}.pf-profile-grid .wide{grid-column:1/-1}.pf-profile-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.pf-profile-actions button{min-height:42px;border-radius:11px;border:1px solid rgba(239,211,117,.3);background:#e1c66b;color:#102017;padding:0 13px;font-weight:900}.pf-profile-actions .secondary{background:#14372c;color:#fff;border-color:rgba(255,255,255,.12)}.pf-status-list{display:grid;gap:8px;margin-top:10px}.pf-status-row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.07)}.pf-status-row b{color:#efd476}.pf-my-links{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.pf-my-links button{min-height:68px;border-radius:13px;border:1px solid rgba(255,255,255,.1);background:#0d3428;color:#fff;font-weight:800}.pf-my-links button span{display:block;color:#efd476;font-size:1.05rem;margin-bottom:2px}.pf-signin-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;background:rgba(239,212,118,.1);color:#efd476;font-size:.72rem;font-weight:800}.pf-signin-badge.ready{background:rgba(76,196,126,.12);color:#79d89e}
  @media(max-width:760px){.pf-my-hub{grid-template-columns:1fr}.pf-profile-grid{grid-template-columns:1fr}.pf-profile-grid .wide{grid-column:auto}.pf-my-links{grid-template-columns:1fr}}
  `;document.head.appendChild(s)
}

function renderHub(){
  const page=document.querySelector('.pf-app-page[data-page="wallet"]');if(!page)return
  installStyles()
  const title=page.querySelector('.pf-page-title');if(title){title.querySelector('.eyebrow').textContent='My ParFolio';title.querySelector('h1').textContent='Your golf identity, in one place.';title.querySelector('p:last-child').textContent='Keep your player details, Nimiq wallet, clubs and signed rounds together. Your connected Nimiq wallet is your Mini sign-in credential for this competition build.'}
  if(page.querySelector('.pf-my-hub'))return
  const profile=loadProfile()||{},wallet=connectedWallet(),clubs=loadClubs(),clubCount=Object.keys(clubs).length,rounds=roundCount(),ready=Boolean(profile.name&&walletReady())
  const hub=document.createElement('section');hub.className='pf-my-hub';hub.innerHTML=`
    <article class="pf-my-card"><div class="pf-signin-badge ${ready?'ready':''}">${ready?'✓ Signed in with Nimiq wallet':'Player setup required'}</div><h2 style="margin-top:10px">Player profile</h2><p>Save the details that should follow your rounds on this device. Connect Nimiq Pay to make the wallet your playing credential.</p><div class="pf-profile-grid"><label>Full name<input data-pf-profile="name" value="${esc(profile.name||'')}" placeholder="Your name"></label><label>Email<input data-pf-profile="email" type="email" value="${esc(profile.email||'')}" placeholder="you@example.com"></label><label>Phone<input data-pf-profile="phone" value="${esc(profile.phone||'')}" placeholder="Optional"></label><label>Handicap<input data-pf-profile="handicap" value="${esc(profile.handicap||'')}" placeholder="Optional"></label><label class="wide">Home course<input data-pf-profile="homeCourse" value="${esc(profile.homeCourse||'')}" placeholder="Optional"></label></div><div class="pf-profile-actions"><button type="button" data-save-profile>Save profile</button><button type="button" class="secondary" data-connect-profile-wallet>${walletReady()?'Wallet connected ✓':'Connect Nimiq Pay'}</button></div><p class="helper" data-profile-status></p></article>
    <article class="pf-my-card"><h3>Account readiness</h3><div class="pf-status-list"><div class="pf-status-row"><span>Player profile</span><b>${profile.name?'Ready':'Needed'}</b></div><div class="pf-status-row"><span>Nimiq wallet</span><b>${walletReady()?'Connected':'Needed'}</b></div><div class="pf-status-row"><span>Club distances</span><b>${clubCount} saved</b></div><div class="pf-status-row"><span>Signed rounds</span><b>${rounds}</b></div></div><div class="pf-my-links"><button type="button" data-page="clubs"><span>♢</span>My Clubs</button><button type="button" data-page="rounds"><span>≡</span>My Rounds</button><button type="button" data-scroll-wallet><span>◈</span>Wallet & NIM</button></div></article>`
  title?.insertAdjacentElement('afterend',hub)
  hub.querySelector('[data-save-profile]')?.addEventListener('click',()=>{const data={};hub.querySelectorAll('[data-pf-profile]').forEach(i=>data[i.dataset.pfProfile]=i.value.trim());data.wallet=connectedWallet();data.updatedAt=new Date().toISOString();saveProfile(data);hub.querySelector('[data-profile-status]').textContent=data.name?'Profile saved. Your round setup will use this name and connected wallet.':'Add your name to complete your profile.';setTimeout(()=>{hub.remove();renderHub()},300)})
  hub.querySelector('[data-connect-profile-wallet]')?.addEventListener('click',()=>document.querySelector('#connectWallet')?.click())
  hub.querySelector('[data-scroll-wallet]')?.addEventListener('click',()=>page.querySelector('.pf-nim-grid')?.scrollIntoView({behavior:'smooth',block:'start'}))
}

function simplifyNav(){
  const drawer=document.querySelector('.pf-drawer');if(!drawer)return
  drawer.querySelectorAll('.pf-nav-item').forEach(btn=>{const p=btn.dataset.page;if(p==='wallet')btn.innerHTML='<i>◈</i>My ParFolio';if(p==='rounds'||p==='clubs')btn.style.display='none'})
}

function run(){renderHub();simplifyNav()}
new MutationObserver(()=>requestAnimationFrame(run)).observe(document.body,{childList:true,subtree:true})
window.addEventListener('parfolio:profile-updated',run)
run()
