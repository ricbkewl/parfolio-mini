import { init } from '@nimiq/mini-app-sdk'

const KEY='parfolio-mini:skins-v1'
const LUNA=100000
let nimiqProvider=null
let installing=false

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))

function defaultState(){return {enabled:false,stake:1,players:[{name:'You',wallet:''},{name:'Player 2',wallet:''}],holes:{},course:'',lastSettlement:null}}
function load(){try{return {...defaultState(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return defaultState()}}
function save(state){localStorage.setItem(KEY,JSON.stringify(state))}
function state(){const s=load();if(!Array.isArray(s.players)||s.players.length<2)s.players=defaultState().players;return s}
function holeNumber(){const text=document.querySelector('.pf-hole-strip strong')?.textContent||'';return Number((text.match(/\d+/)||[])[0]||0)}
function mainScore(){return Number(document.querySelector('.pf-score-value strong')?.textContent||0)}
function potPerHole(s){return Number(s.stake||0)*s.players.length}

function outcomeForHole(s,hole){
  const rec=s.holes?.[hole]
  if(!rec?.locked||!Array.isArray(rec.scores)||rec.scores.some(v=>!Number.isFinite(Number(v))))return null
  const values=rec.scores.map(Number),low=Math.min(...values),winners=values.map((v,i)=>v===low?i:-1).filter(i=>i>=0)
  return winners.length===1?{winner:winners[0],tie:false}:{winner:null,tie:true}
}

function ledger(s){
  const net=s.players.map(()=>0),wins=s.players.map(()=>0),results=[]
  let carry=0
  const max=Math.max(18,...Object.keys(s.holes||{}).map(Number).filter(Number.isFinite))
  for(let hole=1;hole<=max;hole++){
    const outcome=outcomeForHole(s,hole);if(!outcome)continue
    const base=potPerHole(s);s.players.forEach((_,i)=>net[i]-=Number(s.stake||0));carry+=base
    if(outcome.tie){results.push({hole,tie:true,pot:carry});continue}
    net[outcome.winner]+=carry;wins[outcome.winner]+=1;results.push({hole,winner:outcome.winner,pot:carry});carry=0
  }
  return {net,wins,results,carry}
}

function transfers(s){
  const {net}=ledger(s);const debtors=[],creditors=[]
  net.forEach((amount,i)=>{if(amount<-.000001)debtors.push({i,amount:-amount});else if(amount>.000001)creditors.push({i,amount})})
  const out=[];let d=0,c=0
  while(d<debtors.length&&c<creditors.length){const amount=Math.min(debtors[d].amount,creditors[c].amount);out.push({from:debtors[d].i,to:creditors[c].i,amount});debtors[d].amount-=amount;creditors[c].amount-=amount;if(debtors[d].amount<.000001)d++;if(creditors[c].amount<.000001)c++}
  return out
}

function ensureStyles(){if(document.getElementById('pf-skins-style'))return;const style=document.createElement('style');style.id='pf-skins-style';style.textContent=`
.pf-skins-home{margin:22px 0;border:1px solid rgba(242,210,112,.26);background:linear-gradient(145deg,#09291f,#0d3528);border-radius:24px;padding:24px;color:#f8f6ee}.pf-skins-home h2{font:700 clamp(1.7rem,4vw,2.7rem)/1.05 Georgia,serif;margin:5px 0 10px}.pf-skins-home .gold{color:#f1d576}.pf-skins-home>p{color:#b8c8c0;line-height:1.6;max-width:760px}.pf-skins-story{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}.pf-skins-story article{padding:16px;border-radius:16px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08)}.pf-skins-story b{display:block;color:#f1d576;margin-bottom:5px}.pf-skins-story span{font-size:.82rem;color:#b6c4bd;line-height:1.45}.pf-skins-example{margin-top:16px;padding:15px;border-radius:16px;background:#061d16;display:flex;justify-content:space-between;gap:10px;align-items:center}.pf-skins-example strong{color:#f1d576}.pf-skins-setup{margin:14px 0 20px;padding:18px;border-radius:18px;background:#0b2d22;border:1px solid rgba(242,210,112,.2)}.pf-skins-setup h3{margin:0 0 6px}.pf-skins-setup p{margin:0 0 14px;color:#aebdb6;font-size:.83rem}.pf-skins-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.pf-skins-toggle input{width:22px;height:22px}.pf-skins-fields{display:grid;grid-template-columns:110px 1fr;gap:10px}.pf-skins-fields input{width:100%;border:1px solid rgba(255,255,255,.15);background:#061f18;color:#fff;border-radius:12px;padding:11px}.pf-player-row{display:grid;grid-template-columns:1fr 1.25fr auto;gap:8px;margin-top:8px}.pf-player-row button{border:0;background:#173b2f;color:#fff;border-radius:10px;padding:0 10px}.pf-add-player{margin-top:10px;border:1px solid rgba(242,210,112,.35);background:transparent;color:#f1d576;border-radius:11px;padding:9px 12px;font-weight:800}.pf-skins-disclosure{font-size:.72rem!important;color:#8fa39a!important;margin-top:12px!important}.pf-skins-panel{margin:0 12px 10px;padding:12px;border:1px solid rgba(242,210,112,.32);background:rgba(6,29,22,.96);border-radius:16px}.pf-skins-head{display:flex;justify-content:space-between;gap:10px;align-items:center}.pf-skins-head b{color:#f1d576}.pf-skins-head span{font-size:.72rem;color:#a9b8b1}.pf-skins-player{display:grid;grid-template-columns:1fr auto auto auto;gap:7px;align-items:center;margin-top:8px}.pf-skins-player small{color:#9eafa7}.pf-skins-player button{width:34px;height:34px;border:0;border-radius:9px;background:#15382d;color:#fff;font-weight:900}.pf-skins-player strong{min-width:24px;text-align:center}.pf-lock-hole{width:100%;margin-top:10px;border:1px solid #ead173;border-radius:11px;background:#e2c76e;color:#102017;padding:9px;font-weight:900}.pf-skins-running{display:flex;justify-content:space-between;gap:8px;margin-top:9px;font-size:.72rem;color:#b8c5bf}.pf-settle-overlay{position:fixed;inset:0;z-index:11000;background:rgba(2,13,10,.94);color:#fff;display:grid;place-items:center;padding:18px}.pf-settle-card{width:min(520px,100%);max-height:90vh;overflow:auto;border:1px solid rgba(242,210,112,.3);background:#09271e;border-radius:22px;padding:20px}.pf-settle-card h2{margin:0 0 7px}.pf-settle-card p{color:#b7c5be;line-height:1.5}.pf-net-row,.pf-transfer-row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08)}.pf-transfer-row button{border:0;border-radius:10px;background:#e2c66d;color:#102017;padding:8px 10px;font-weight:900}.pf-close-settle{width:100%;margin-top:14px;padding:11px;border-radius:11px;border:1px solid rgba(255,255,255,.18);background:#15372c;color:#fff;font-weight:800}
@media(max-width:720px){.pf-skins-story{grid-template-columns:1fr}.pf-skins-fields{grid-template-columns:1fr}.pf-player-row{grid-template-columns:1fr}.pf-player-row button{min-height:36px}.pf-skins-home{padding:18px}}
`;document.head.appendChild(style)}

function injectHome(){
  const hero=document.querySelector('.hero');if(!hero||document.querySelector('.pf-skins-home'))return
  const title=hero.querySelector('h1');if(title)title.innerHTML='Play better.<br>Compete hole by hole.<br><span>Settle in NIM.</span>'
  const lede=hero.querySelector('.hero-lede');if(lede)lede.textContent='ParFolio gives golfers GPS yardage, satellite hole views and scoring. ParFolio Skins adds a skill-based NIM challenge to every hole, then calculates one clear peer-to-peer settlement after the round.'
  const section=document.createElement('section');section.className='pf-skins-home';section.innerHTML=`<p class="eyebrow">Introducing ParFolio Skins · Powered by Nimiq Pay</p><h2>Every hole can have a <span class="gold">reward.</span></h2><p>Choose a NIM value per hole, agree on the players, then golf decides the outcome. Lowest score wins the hole. Ties carry the reward forward. ParFolio tracks the running result and calculates who settles with whom when the round is finished.</p><div class="pf-skins-story"><article><b>Golf comes first</b><span>Use the same ParFolio GPS-ready course map, yardage and hole-by-hole scoring experience.</span></article><article><b>Skill decides</b><span>No random outcome or odds. The agreed golf scores determine each hole winner.</span></article><article><b>Nimiq settles</b><span>Final net balances become direct wallet-to-wallet NIM payments. ParFolio never holds player funds.</span></article></div><div class="pf-skins-example"><span><b>Example</b><br><small>2 players · 1 NIM each per hole · tie carries forward</small></span><strong>Hole winner → 2 NIM pot</strong></div>`
  hero.insertAdjacentElement('afterend',section)
}

function injectSetup(){
  const finder=document.querySelector('.ca-course-finder');if(!finder||document.querySelector('.pf-skins-setup'))return
  const s=state(),box=document.createElement('section');box.className='pf-skins-setup';box.innerHTML=`<div class="pf-skins-toggle"><div><h3>ParFolio Skins</h3><p>Optional skill competition with hole-by-hole NIM rewards.</p></div><input type="checkbox" data-skins-enabled ${s.enabled?'checked':''} aria-label="Enable ParFolio Skins"></div><div data-skins-config ${s.enabled?'':'hidden'}><div class="pf-skins-fields"><label>NIM per player / hole<input data-skins-stake type="number" min="0.01" step="0.01" value="${Number(s.stake||1)}"></label><label>Format<input value="Lowest score wins · ties carry" disabled></label></div><div data-skins-players>${s.players.map((p,i)=>playerRow(p,i)).join('')}</div><button type="button" class="pf-add-player" data-add-player ${s.players.length>=4?'hidden':''}>+ Add player</button><p class="pf-skins-disclosure">Players agree to the rules before play. ParFolio only records the competition and calculates settlement; funds stay in each player's Nimiq wallet until a player approves a payment.</p></div>`
  finder.parentElement.insertBefore(box,finder)
  bindSetup(box)
}
function playerRow(p,i){return `<div class="pf-player-row" data-player="${i}"><input data-player-name value="${esc(p.name)}" placeholder="Player name"><input data-player-wallet value="${esc(p.wallet||'')}" placeholder="Nimiq address${i===0?' (your wallet)':''}"><button type="button" data-remove-player ${i===0?'disabled':''}>×</button></div>`}
function bindSetup(box){
  const persist=()=>{const s=state();s.enabled=box.querySelector('[data-skins-enabled]').checked;s.stake=Math.max(.01,Number(box.querySelector('[data-skins-stake]')?.value||1));s.players=[...box.querySelectorAll('[data-player]')].map((row,i)=>({name:row.querySelector('[data-player-name]').value.trim()||`Player ${i+1}`,wallet:row.querySelector('[data-player-wallet]').value.trim()}));save(s);box.querySelector('[data-skins-config]').hidden=!s.enabled}
  box.addEventListener('input',persist);box.addEventListener('change',persist)
  box.querySelector('[data-add-player]')?.addEventListener('click',()=>{const s=state();if(s.players.length>=4)return;s.players.push({name:`Player ${s.players.length+1}`,wallet:''});save(s);box.querySelector('[data-skins-players]').insertAdjacentHTML('beforeend',playerRow(s.players.at(-1),s.players.length-1));if(s.players.length>=4)box.querySelector('[data-add-player]').hidden=true;bindSetup(box)})
  box.addEventListener('click',e=>{const btn=e.target.closest('[data-remove-player]');if(!btn||btn.disabled)return;const row=btn.closest('[data-player]');row.remove();persist()})
}

function injectRound(){
  const shell=document.querySelector('.pf-round-shell');if(!shell)return
  const s=state();if(!s.enabled||s.players.length<2)return
  const n=holeNumber();if(!n||shell.querySelector(`.pf-skins-panel[data-hole="${n}"]`))return
  shell.querySelectorAll('.pf-skins-panel').forEach(el=>el.remove())
  const your=mainScore();const rec=s.holes[n]||{scores:s.players.map((_,i)=>i===0?your:4),locked:false};rec.scores[0]=your;s.holes[n]=rec;save(s)
  const {net,carry}=ledger(s),panel=document.createElement('div');panel.className='pf-skins-panel';panel.dataset.hole=String(n);panel.innerHTML=`<div class="pf-skins-head"><div><b>Hole ${n} · ${potPerHole(s).toFixed(2)} NIM</b><span> base pot</span></div><span>${carry>0?`${carry.toFixed(2)} NIM carry waiting`: 'Lowest score wins'}</span></div>${s.players.map((p,i)=>`<div class="pf-skins-player" data-skin-player="${i}"><span>${esc(p.name)}${i===0?' <small>(you)</small>':''}</span><button type="button" data-skin-delta="-1" ${i===0?'disabled':''}>−</button><strong>${Number(rec.scores[i]??4)}</strong><button type="button" data-skin-delta="1" ${i===0?'disabled':''}>+</button></div>`).join('')}<button type="button" class="pf-lock-hole" data-lock-hole>${rec.locked?'✓ Hole result locked':'Lock hole result'}</button><div class="pf-skins-running"><span>Running net</span><span>${s.players.map((p,i)=>`${esc(p.name)} ${net[i]>=0?'+':''}${net[i].toFixed(2)}`).join(' · ')} NIM</span></div>`
  shell.querySelector('.pf-score-panel')?.insertAdjacentElement('beforebegin',panel)
  panel.addEventListener('click',e=>{const delta=e.target.closest('[data-skin-delta]');if(delta&&!delta.disabled){const row=delta.closest('[data-skin-player]'),i=Number(row.dataset.skinPlayer),s2=state(),r=s2.holes[n]||rec;r.scores[i]=Math.max(1,Math.min(15,Number(r.scores[i]||4)+Number(delta.dataset.skinDelta)));r.locked=false;s2.holes[n]=r;save(s2);panel.remove();injectRound();return}if(e.target.closest('[data-lock-hole]')){const s2=state(),r=s2.holes[n]||rec;r.scores[0]=mainScore();r.locked=true;s2.holes[n]=r;s2.course=document.querySelector('.pf-round-course b')?.textContent||'';save(s2);panel.remove();injectRound()}})
}

async function getNimiq(){if(nimiqProvider)return nimiqProvider;nimiqProvider=await init();return nimiqProvider}
async function payTransfer(s,t,button){const recipient=s.players[t.to]?.wallet?.trim();if(!recipient){button.textContent='Add recipient wallet first';return}button.disabled=true;button.textContent='Approve in Nimiq Pay…';try{const provider=await getNimiq();const hash=await provider.sendBasicTransactionWithData({recipient,value:Math.round(t.amount*LUNA),data:`ParFolio Skins settlement · ${s.course||'golf round'}`});button.textContent='✓ Paid';button.title=hash||''}catch(err){button.disabled=false;button.textContent=err?.name==='PermissionDeniedError'?'Payment cancelled':'Try payment again'}}

function showSettlement(){
  const s=state();if(!s.enabled||!Object.values(s.holes||{}).some(r=>r.locked))return
  document.querySelector('.pf-settle-overlay')?.remove();const {net,wins,carry}=ledger(s),tx=transfers(s),overlay=document.createElement('div');overlay.className='pf-settle-overlay';overlay.innerHTML=`<div class="pf-settle-card"><p class="eyebrow">Round complete · ParFolio Skins</p><h2>Settle the round in NIM</h2><p>${esc(s.course||'Golf round')} · ${Number(s.stake).toFixed(2)} NIM per player per resolved hole. ${carry>0?`${carry.toFixed(2)} NIM remains tied/unresolved.`:''}</p><div>${s.players.map((p,i)=>`<div class="pf-net-row"><span><b>${esc(p.name)}</b><br><small>${wins[i]} hole win${wins[i]===1?'':'s'}</small></span><strong>${net[i]>=0?'+':''}${net[i].toFixed(2)} NIM</strong></div>`).join('')}</div><h3>Peer-to-peer settlement</h3>${tx.length?tx.map((t,i)=>`<div class="pf-transfer-row"><span>${esc(s.players[t.from].name)} → ${esc(s.players[t.to].name)}<br><small>${t.amount.toFixed(2)} NIM</small></span>${t.from===0?`<button type="button" data-pay-transfer="${i}">Pay with Nimiq</button>`:'<small>Recipient/player settles from their wallet</small>'}</div>`).join(''):'<p>No payment is due from the resolved holes.</p>'}<p class="pf-skins-disclosure">Non-custodial: ParFolio never holds the prize pool. Each NIM transfer requires the paying player to approve the transaction in Nimiq Pay.</p><button type="button" class="pf-close-settle">Close</button></div>`;document.body.appendChild(overlay);overlay.querySelector('.pf-close-settle').addEventListener('click',()=>overlay.remove());overlay.querySelectorAll('[data-pay-transfer]').forEach(btn=>btn.addEventListener('click',()=>payTransfer(s,tx[Number(btn.dataset.payTransfer)],btn)))
}

function observe(){if(installing)return;installing=true;const run=()=>{injectHome();injectSetup();injectRound()};new MutationObserver(()=>requestAnimationFrame(run)).observe(document.body,{childList:true,subtree:true});document.addEventListener('click',e=>{if(e.target.closest('[data-pf-finish]'))setTimeout(showSettlement,500)} ,true);run();installing=false}

ensureStyles();observe()
