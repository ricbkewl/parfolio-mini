const PROFILE_KEY='parfolio-mini:profile-v1'
const CLUBS_KEY='parfolio-mini:clubs-v1'
const BAG_KEY='parfolio-mini:bag-v1'
const ROUNDS_KEY='parfolio-mini:verified-rounds'
const CLUBS=['Driver','2 Wood','3 Wood','4 Wood','5 Wood','7 Wood','9 Wood','2 Hybrid','3 Hybrid','4 Hybrid','5 Hybrid','6 Hybrid','7 Hybrid','1 Iron','2 Iron','3 Iron','4 Iron','5 Iron','6 Iron','7 Iron','8 Iron','9 Iron','Pitching Wedge','Approach Wedge','Gap Wedge','Sand Wedge','Lob Wedge','Chipper','Putter']
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??f}catch{return f}}
const profile=()=>read(PROFILE_KEY,{})
const bag=()=>read(BAG_KEY,[])
const distances=()=>read(CLUBS_KEY,{})
const walletReady=()=>Boolean(document.querySelector('.wallet-chip.connected'))
const profileReady=()=>Boolean(profile()?.name)
const bagReady=()=>bag().length>0

function installStyles(){
  if(document.getElementById('pf-system-integrity-style'))return
  const s=document.createElement('style')
  s.id='pf-system-integrity-style'
  s.textContent=`
    .pf-app-page[data-page="play"] .pf-skins-setup{display:none!important}
    .pf-integrity-note{margin:10px 0;padding:10px 12px;border-radius:12px;background:rgba(239,211,117,.08);border:1px solid rgba(239,211,117,.18);color:#d7c77e;font-size:.75rem;line-height:1.4}
    .pf-bag-club{display:grid!important;grid-template-columns:1fr 96px!important;gap:8px;align-items:center;padding:9px 10px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);font-size:.78rem!important;color:#d6e0db!important}
    .pf-bag-club span{display:flex;align-items:center;gap:7px}.pf-bag-club [data-bag-check]{width:18px!important;height:18px;margin:0!important}.pf-bag-club [data-bag-yard]{margin:0!important;padding:8px!important}
    @media(max-width:620px){.pf-club-grid{grid-template-columns:1fr!important}.pf-bag-club{grid-template-columns:1fr 92px!important}}
  `
  document.head.appendChild(s)
}

function navigate(page){
  const b=document.querySelector(`.pf-nav-item[data-page="${page}"]`)||document.querySelector(`button[data-page="${page}"]`)
  if(b){b.click();return true}
  location.hash=`#/${page}`
  return false
}

function setupBag(){
  const grid=document.querySelector('#pfClubGrid'),section=document.querySelector('#pfMyClubs')
  if(!grid||grid.dataset.integrityBag==='1')return false
  grid.dataset.integrityBag='1'
  const saved=distances(),selected=new Set(bag().length?bag():Object.keys(saved).filter(k=>Number(saved[k])>0))
  grid.innerHTML=CLUBS.map(name=>`<label class="pf-bag-club"><span><input type="checkbox" data-bag-check="${esc(name)}" ${selected.has(name)?'checked':''}> ${esc(name)}</span><input data-bag-yard="${esc(name)}" type="number" min="1" max="400" inputmode="numeric" placeholder="${name==='Putter'?'Optional':'Carry yd'}" value="${Number(saved[name])>0?Number(saved[name]):''}"></label>`).join('')
  const intro=section?.querySelector('p:not(.eyebrow)')
  if(intro)intro.textContent='Check only the clubs that are actually in your bag. Enter your normal carry distance where useful. Unchecked clubs are not used during play.'
  const save=document.querySelector('#pfSaveClubs')
  if(save){
    const fresh=save.cloneNode(true);save.replaceWith(fresh);fresh.textContent='Save my golf bag'
    fresh.addEventListener('click',()=>{
      const names=[...grid.querySelectorAll('[data-bag-check]:checked')].map(i=>i.dataset.bagCheck)
      const d={}
      names.forEach(name=>{const input=grid.querySelector(`[data-bag-yard="${CSS.escape(name)}"]`),yards=Number(input?.value||0);if(yards>0)d[name]=yards})
      localStorage.setItem(BAG_KEY,JSON.stringify(names));localStorage.setItem(CLUBS_KEY,JSON.stringify(d))
      const status=document.querySelector('#pfClubStatus');if(status)status.textContent=`Golf bag saved · ${names.length} club${names.length===1?'':'s'} selected${Object.keys(d).length?` · ${Object.keys(d).length} carry distances`:''}.`
      syncReadiness();window.dispatchEvent(new CustomEvent('parfolio:clubs-updated',{detail:{bag:names,distances:d}}))
    })
  }
  return true
}

function syncReadiness(){
  document.querySelectorAll('.pf-play-path').forEach(box=>{
    const row=box.querySelector('.pf-play-readiness');if(!row)return
    let pill=row.querySelector('[data-ready-bag]')
    if(!pill){pill=document.createElement('span');pill.className='pf-ready-pill';pill.dataset.readyBag='';const match=[...row.children].find(x=>x.textContent.includes('Match terms'));match?match.before(pill):row.appendChild(pill)}
    pill.textContent=`${bagReady()?'✓':'○'} Golf bag`;pill.classList.toggle('ok',bagReady())
    ;[...row.children].forEach(x=>{if(x.textContent.includes('Match terms'))x.textContent='4 · Match terms';if(x.textContent.includes('Start round'))x.textContent='5 · Start round'})
  })
  const hub=document.querySelector('.pf-my-hub')
  if(hub){
    const rows=[...hub.querySelectorAll('.pf-status-row')],clubRow=rows.find(r=>/club/i.test(r.querySelector('span')?.textContent||''))
    if(clubRow){const label=clubRow.querySelector('span'),value=clubRow.querySelector('b');if(label)label.textContent='Golf bag';if(value)value.textContent=bagReady()?`${bag().length} clubs`:'Needed'}
  }
  document.querySelectorAll('.pf-my-quick').forEach(q=>{const old=[...q.children].find(x=>/clubs? (saved|in bag)/i.test(x.textContent));if(old)old.textContent=`${bag().length} clubs in bag`})
}

function explainJoinState(){
  const section=document.querySelector('#pfJoinRound');if(!section||section.dataset.integrityJoin==='1')return
  section.dataset.integrityJoin='1'
  const p=section.querySelector('p:not(.eyebrow)');if(p)p.textContent='Shared-round code and QR joining are not enabled in this Mini submission build yet. Start a local round from the course finder instead.'
  section.querySelectorAll('input,button').forEach(el=>{el.disabled=true})
  const status=section.querySelector('#pfJoinStatus');if(status)status.textContent='Coming after the core local round flow is verified.'
}

function gateCourseSelection(event){
  const course=event.target?.closest?.('[data-use-pf-course]');if(!course)return
  let page=null,message=''
  if(!profileReady()){page='wallet';message='Complete your My ParFolio profile before choosing a course.'}
  else if(!walletReady()){page='wallet';message='Connect Nimiq Pay before choosing a course.'}
  else if(!bagReady()){page='clubs';message='Set up your golf bag before starting a round.'}
  if(!page)return
  event.preventDefault();event.stopImmediatePropagation();event.stopPropagation();navigate(page);setTimeout(()=>window.alert(message),80)
}
window.addEventListener('click',gateCourseSelection,true)

function bestClub(yards){
  const d=distances(),selected=new Set(bag())
  const candidates=Object.entries(d).filter(([name,y])=>selected.has(name)&&Number(y)>0&&name!=='Putter').map(([name,y])=>[name,Number(y)])
  if(!candidates.length)return null
  let best=candidates[0],delta=Infinity
  candidates.forEach(c=>{const x=Math.abs(c[1]-yards);if(x<delta){delta=x;best=c}})
  return best[0]
}
function syncClubSuggestion(){
  const chip=document.querySelector('.pf-round-shell .pf-club-chip');if(!chip)return
  const aim=document.querySelector('.pf-round-shell .pf-planner-card b')?.textContent||'',center=document.querySelector('.pf-round-shell .pf-live-yardage b')?.textContent||''
  const yards=Number((aim.match(/(\d+)/)||center.match(/(\d+)/)||[])[1]||0),club=bestClub(yards)
  if(!club)return
  const shots=(chip.textContent.match(/·\s*(\d+)\s+shot/)||[])[1]
  const desired=`Suggested club · ${club}${shots?` · ${shots} shot${Number(shots)===1?'':'s'} tracked`:''}`
  if(chip.dataset.bagText===desired)return
  chip.dataset.bagText=desired;chip.innerHTML=`Suggested club · <b>${esc(club)}</b>${shots?` · ${shots} shot${Number(shots)===1?'':'s'} tracked`:''}`
}
setInterval(syncClubSuggestion,500)

let suppressBaseBind=false
function installBaseRenderGuard(){
  const app=document.querySelector('#app');if(!app||app.dataset.integrityGuard==='1')return
  const desc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');if(!desc?.get||!desc?.set)return
  app.dataset.integrityGuard='1'
  Object.defineProperty(app,'innerHTML',{configurable:true,get(){return desc.get.call(this)},set(value){
    const preserve=this.querySelector('.pf-pages')&&typeof value==='string'&&value.includes('<main class="shell">')
    if(!preserve){desc.set.call(this,value);return}
    suppressBaseBind=true
    const temp=document.createElement('div');temp.innerHTML=value
    const incomingChip=temp.querySelector('.wallet-chip'),incomingMsg=temp.querySelector('#walletMessage'),incomingConnect=temp.querySelector('#connectWallet')
    const liveChip=document.querySelector('.wallet-chip'),liveMsg=document.querySelector('#walletMessage'),liveConnect=document.querySelector('#connectWallet')
    if(incomingChip&&liveChip){liveChip.className=incomingChip.className;liveChip.innerHTML=incomingChip.innerHTML}
    if(incomingMsg&&liveMsg)liveMsg.textContent=incomingMsg.textContent
    if(incomingConnect&&liveConnect){liveConnect.innerHTML=incomingConnect.innerHTML;liveConnect.disabled=incomingConnect.disabled}
    const incomingRecords=temp.querySelector('.records-section .records'),liveRecords=document.querySelector('.records-section .records');if(incomingRecords&&liveRecords)liveRecords.innerHTML=incomingRecords.innerHTML
    const incomingCount=temp.querySelector('.records-section .count'),liveCount=document.querySelector('.records-section .count');if(incomingCount&&liveCount)liveCount.textContent=incomingCount.textContent
    const incomingSubmit=temp.querySelector('#roundForm button[type="submit"]'),liveSubmit=document.querySelector('#roundForm button[type="submit"]');if(incomingSubmit&&liveSubmit)liveSubmit.disabled=incomingSubmit.disabled
    const connected=Boolean(incomingChip?.classList.contains('connected'))
    if(connected){document.querySelectorAll('[data-pf-connect-now],[data-connect-profile-wallet],[data-pf-nimiq-connect]').forEach(b=>b.textContent='Wallet connected ✓');const mini=document.querySelector('.pf-wallet-mini');if(mini)mini.textContent=incomingChip.textContent.trim();queueMicrotask(()=>window.dispatchEvent(new CustomEvent('parfolio:wallet-updated')))}
    const newCount=read(ROUNDS_KEY,[]).length;if(newCount){queueMicrotask(()=>window.dispatchEvent(new CustomEvent('parfolio:rounds-updated',{detail:{count:newCount}})))}
    setTimeout(()=>{suppressBaseBind=false;syncReadiness()},0)
  }})

  const original=EventTarget.prototype.addEventListener
  if(!EventTarget.prototype.__pfIntegrityWrapped){
    Object.defineProperty(EventTarget.prototype,'__pfIntegrityWrapped',{value:true,configurable:true})
    EventTarget.prototype.addEventListener=function(type,listener,options){
      if(suppressBaseBind&&this instanceof Element&&app.contains(this)){
        const blocked=this.matches?.('#connectWallet,#roundForm,#caRegion,#searchCourses,#nearbyCourses,#courseResults,input[name="course"],[data-share-round]')
        if(blocked&&['click','submit','input','change'].includes(type))return
      }
      return original.call(this,type,listener,options)
    }
  }
}

function shareSignedRound(index){
  const item=read(ROUNDS_KEY,[])[index];if(!item)return
  const text=['ParFolio Mini · Player-entered, wallet-signed round',item.message||'',`publicKey=${item.publicKey||'not available'}`,`signature=${item.signature||''}`,'The wallet signature does not independently confirm the golf score.'].filter(Boolean).join('\n')
  if(navigator.share)navigator.share({title:`ParFolio Mini · ${item.course||'Round'}`,text}).catch(()=>{})
  else navigator.clipboard?.writeText(text).then(()=>window.alert('Signed round copied.')).catch(()=>{})
}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-share-round]');if(b){e.preventDefault();shareSignedRound(Number(b.dataset.shareRound))}},true)

function onRoundSigned(){
  syncReadiness();const n=read(ROUNDS_KEY,[]).length
  document.querySelectorAll('.pf-my-quick').forEach(q=>{const el=[...q.children].find(x=>/signed rounds/i.test(x.textContent));if(el)el.textContent=`${n} signed rounds`})
  const row=[...document.querySelectorAll('.pf-my-hub .pf-status-row')].find(r=>/signed rounds/i.test(r.querySelector('span')?.textContent||''));if(row?.querySelector('b'))row.querySelector('b').textContent=String(n)
}
window.addEventListener('parfolio:rounds-updated',onRoundSigned)
window.addEventListener('parfolio:profile-updated',syncReadiness)
window.addEventListener('parfolio:wallet-updated',syncReadiness)
window.addEventListener('parfolio:clubs-updated',syncReadiness)

function run(){installStyles();installBaseRenderGuard();setupBag();syncReadiness();explainJoinState()}
let tries=0;const boot=setInterval(()=>{tries++;run();if(tries>=50)clearInterval(boot)},120)
document.addEventListener('click',e=>{if(e.target.closest?.('button[data-page],.pf-nav-item[data-page]'))setTimeout(run,30)},true)
run()
