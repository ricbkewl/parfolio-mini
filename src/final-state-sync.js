const PROFILE_KEY='parfolio-mini:profile-v1'
const BAG_KEY='parfolio-mini:bag-v1'
const ROUNDS_KEY='parfolio-mini:verified-rounds'
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??f}catch{return f}}
const walletReady=()=>Boolean(document.querySelector('.wallet-chip.connected'))
let lastRoundCount=read(ROUNDS_KEY,[]).length

function initials(name){return String(name||'PF').split(/\s+/).filter(Boolean).slice(0,2).map(v=>v[0]).join('').toUpperCase()||'PF'}
function syncIdentity(){
  const p=read(PROFILE_KEY,{}),bag=read(BAG_KEY,[]),rounds=read(ROUNDS_KEY,[]),head=document.querySelector('.pf-my-identity-head')
  if(head){
    const avatar=head.querySelector('.pf-avatar'),title=head.querySelector('h1'),quick=head.querySelector('.pf-my-quick')
    if(avatar)avatar.textContent=initials(p.name)
    if(title)title.textContent=p.name||'Your golf identity.'
    if(quick){
      const chips=[...quick.children]
      const profileChip=chips.find(x=>/profile/i.test(x.textContent));if(profileChip){profileChip.textContent=p.name?'✓ Profile ready':'○ Complete profile';profileChip.classList.toggle('ok',Boolean(p.name))}
      const walletChip=chips.find(x=>/wallet/i.test(x.textContent));if(walletChip){walletChip.textContent=walletReady()?'✓ Wallet connected':'○ Connect wallet';walletChip.classList.toggle('ok',walletReady())}
      const clubChip=chips.find(x=>/club/i.test(x.textContent));if(clubChip)clubChip.textContent=`${bag.length} clubs in bag`
      const roundChip=chips.find(x=>/signed rounds/i.test(x.textContent));if(roundChip)roundChip.textContent=`${rounds.length} signed rounds`
    }
  }
  const hub=document.querySelector('.pf-my-hub')
  if(hub){
    const rows=[...hub.querySelectorAll('.pf-status-row')]
    const profileRow=rows.find(r=>/player profile/i.test(r.querySelector('span')?.textContent||''));if(profileRow?.querySelector('b'))profileRow.querySelector('b').textContent=p.name?'Ready':'Needed'
    const walletRow=rows.find(r=>/nimiq wallet/i.test(r.querySelector('span')?.textContent||''));if(walletRow?.querySelector('b'))walletRow.querySelector('b').textContent=walletReady()?'Connected':'Needed'
    const bagRow=rows.find(r=>/golf bag|club distances/i.test(r.querySelector('span')?.textContent||''));if(bagRow){if(bagRow.querySelector('span'))bagRow.querySelector('span').textContent='Golf bag';if(bagRow.querySelector('b'))bagRow.querySelector('b').textContent=bag.length?`${bag.length} clubs`:'Needed'}
    const roundRow=rows.find(r=>/signed rounds/i.test(r.querySelector('span')?.textContent||''));if(roundRow?.querySelector('b'))roundRow.querySelector('b').textContent=String(rounds.length)
  }
}
function goToRoundsIfNew(){
  const now=read(ROUNDS_KEY,[]).length
  if(now>lastRoundCount){
    lastRoundCount=now
    const nav=document.querySelector('.pf-nav-item[data-page="rounds"]')||document.querySelector('button[data-page="rounds"]')
    if(nav)setTimeout(()=>nav.click(),120)
    setTimeout(()=>{const section=document.querySelector('.pf-app-page[data-page="rounds"] .records-section');section?.scrollIntoView({block:'start'})},220)
  }else lastRoundCount=now
  syncIdentity()
}
function afterUiSettles(){setTimeout(syncIdentity,20);setTimeout(syncIdentity,90);setTimeout(syncIdentity,240)}
window.addEventListener('parfolio:profile-updated',afterUiSettles)
window.addEventListener('parfolio:wallet-updated',afterUiSettles)
window.addEventListener('parfolio:clubs-updated',afterUiSettles)
window.addEventListener('parfolio:rounds-updated',goToRoundsIfNew)
document.addEventListener('click',e=>{if(e.target.closest?.('button[data-page="wallet"],.pf-nav-item[data-page="wallet"]'))setTimeout(syncIdentity,60)},true)
let tries=0;const boot=setInterval(()=>{tries++;syncIdentity();if(document.querySelector('.pf-my-identity-head')||tries>40)clearInterval(boot)},120)
syncIdentity()
