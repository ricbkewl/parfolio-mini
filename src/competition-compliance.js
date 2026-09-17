const CONSENT_KEY='parfolio-mini:competition-consent-v1'

function consented(){try{return localStorage.getItem(CONSENT_KEY)==='yes'}catch{return false}}
function saveConsent(){try{localStorage.setItem(CONSENT_KEY,'yes');return true}catch{return false}}

function installStyles(){
  if(document.getElementById('pf-competition-compliance-style'))return
  const s=document.createElement('style')
  s.id='pf-competition-compliance-style'
  s.textContent=`
    .pf-data-disclosure,.pf-skill-disclosure{margin:12px 0;padding:13px 14px;border-radius:14px;border:1px solid rgba(239,211,117,.22);background:rgba(239,211,117,.07);color:#c9d6cf;font-size:.76rem;line-height:1.5}
    .pf-data-disclosure b,.pf-skill-disclosure b{color:#efd476}.pf-data-consent{display:flex;align-items:flex-start;gap:8px;margin:11px 0 2px;color:#e7ddd0;font-size:.76rem;line-height:1.4}.pf-data-consent input{width:18px!important;height:18px!important;flex:0 0 18px;margin:1px 0 0!important}.pf-consent-warning{color:#f0c77a!important;font-size:.75rem!important;margin-top:7px!important}
  `
  document.head.appendChild(s)
}

function installProfileDisclosure(){
  const card=document.querySelector('.pf-my-hub .pf-my-card')
  if(!card||card.querySelector('.pf-data-disclosure'))return false
  const actions=card.querySelector('.pf-profile-actions')
  if(!actions)return false
  const box=document.createElement('div')
  box.className='pf-data-disclosure'
  box.innerHTML=`<b>Data & privacy</b><br>Profile details, golf-bag selections and signed-round history are stored on this device. Signed records include the connected wallet address and signature. ParFolio Mini never stores your private keys and never takes custody of funds. Course search reads the public course catalog. If you use Near Me, live GPS, maps or wind, your device location is used for that feature and coordinates may be sent to the map/weather providers needed to deliver it.<label class="pf-data-consent"><input type="checkbox" data-pf-data-consent ${consented()?'checked':''}> <span>I understand this data use and consent to saving my ParFolio Mini profile and round information on this device.</span></label><p class="pf-consent-warning" data-pf-consent-warning></p>`
  actions.before(box)
  box.querySelector('[data-pf-data-consent]')?.addEventListener('change',e=>{if(e.target.checked)saveConsent();const w=box.querySelector('[data-pf-consent-warning]');if(w)w.textContent=''})
  return true
}

function installCourseDisclosure(){
  const finder=document.querySelector('.ca-course-finder')
  if(!finder||finder.querySelector('.pf-location-disclosure'))return
  const p=document.createElement('p')
  p.className='pf-integrity-note pf-location-disclosure'
  p.textContent='Location privacy: Search does not need your GPS. Near Me and live-play GPS request device location only when you choose those features.'
  const controls=finder.querySelector('.pf-owner-search')
  controls?.insertAdjacentElement('afterend',p)
}

function installMatchDisclosure(){
  const card=document.querySelector('.pf-match-card')
  if(!card||card.querySelector('.pf-skill-disclosure'))return
  const summary=card.querySelector('[data-match-summary]')
  const box=document.createElement('div')
  box.className='pf-skill-disclosure'
  box.innerHTML='<b>Skill-based challenge only.</b> Results are determined by the players’ entered golf scores under fixed rules agreed before play. There are no random outcomes, odds, house edge, pooled custody, or house-held prize funds. Each player keeps control of their NIM and separately approves any peer-to-peer transfer in Nimiq Pay. Players are responsible for using NIM rewards only where lawful.'
  summary?.insertAdjacentElement('afterend',box)
}

document.addEventListener('click',e=>{
  const save=e.target.closest?.('[data-save-profile]')
  if(save&&!consented()){
    const check=document.querySelector('[data-pf-data-consent]')
    if(!check?.checked){
      e.preventDefault();e.stopImmediatePropagation();e.stopPropagation()
      const w=document.querySelector('[data-pf-consent-warning]');if(w)w.textContent='Please review and accept the data-use disclosure before saving your profile.'
      check?.scrollIntoView({behavior:'smooth',block:'center'})
      return
    }
    saveConsent()
  }
  if(e.target.closest?.('[data-use-pf-course]'))setTimeout(installMatchDisclosure,40)
},true)

function run(){installStyles();installProfileDisclosure();installCourseDisclosure();installMatchDisclosure()}
let tries=0;const timer=setInterval(()=>{tries++;run();if(tries>=60)clearInterval(timer)},120)
window.addEventListener('parfolio:profile-updated',()=>setTimeout(run,30))
document.addEventListener('click',e=>{if(e.target.closest?.('button[data-page],.pf-nav-item[data-page]'))setTimeout(run,30)},true)
run()
