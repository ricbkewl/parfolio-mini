// ParFolio Mini landing-page visual upgrade.
// Uses the vertical Home artwork and routes actions through the app navigation.

const HOME_ART='/9B68D5FF-8CCE-40FA-8F35-7F5828913002.png'

function ensureHeroStyles(){
  if(document.getElementById('pf-mini-landing-hero-v2'))return
  const style=document.createElement('style')
  style.id='pf-mini-landing-hero-v2'
  style.textContent=`
    .hero.pf-visual-hero{display:block!important;width:min(100%,620px);margin:0 auto!important;padding:0!important;border-radius:34px!important;overflow:hidden!important;background:#071c15!important;border:1px solid rgba(230,198,93,.28)!important;box-shadow:0 34px 90px rgba(0,0,0,.34)!important}
    .hero.pf-visual-hero:before,.hero.pf-visual-hero:after{display:none!important}
    .pf-hero-art-wrap{position:relative;width:100%;background:#0a241b;overflow:hidden}
    .pf-hero-art{display:block;width:100%;height:auto;aspect-ratio:auto!important;object-fit:contain!important;object-position:center;filter:saturate(1.03) contrast(1.02);background:#071c15}
    .pf-hero-live-actions{position:relative;z-index:2;display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:10px;padding:14px;background:linear-gradient(180deg,#0b2b20,#061c15);border-top:1px solid rgba(255,255,255,.08)}
    .pf-hero-live-actions button{min-height:50px;border-radius:15px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.055);color:#fff;font-weight:850;font-size:.9rem;letter-spacing:-.01em;box-shadow:inset 0 1px rgba(255,255,255,.05)}
    .pf-hero-live-actions button:first-child{background:linear-gradient(135deg,#efd57a,#c59431);border-color:#efd57a;color:#102218;box-shadow:0 8px 24px rgba(210,173,67,.18),inset 0 1px rgba(255,255,255,.45)}
    .pf-hero-live-actions button:hover{transform:translateY(-1px);filter:brightness(1.04)}
    .pf-hero-caption{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 16px 13px;background:#061c15;color:#aebeb6;font-size:.72rem}
    .pf-hero-caption strong{color:#f0d276;font-size:.74rem;letter-spacing:.04em;text-transform:uppercase}
    .pf-hero-caption span:last-child{text-align:right}
    .hero.pf-visual-hero .hero-copy,.hero.pf-visual-hero .hero-visual{display:none!important}
    @media(max-width:720px){
      .hero.pf-visual-hero{width:100%;border-radius:22px!important;margin:0!important}
      .pf-hero-art{width:100%;height:auto;aspect-ratio:auto!important;object-fit:contain!important;object-position:center}
      .pf-hero-live-actions{grid-template-columns:1fr 1fr;padding:10px;gap:8px}
      .pf-hero-live-actions button{min-height:47px;font-size:.82rem}
      .pf-hero-live-actions button:first-child{grid-column:1/-1}
      .pf-hero-caption{padding:8px 11px 11px;font-size:.64rem;align-items:flex-start}
      .pf-hero-caption span:last-child{max-width:58%;text-align:right}
    }
  `
  document.head.appendChild(style)
}

function upgradeHero(){
  ensureHeroStyles()
  const hero=document.querySelector('.hero')
  if(!hero||hero.dataset.pfHeroUpgraded==='1')return
  hero.dataset.pfHeroUpgraded='1'
  hero.classList.add('pf-visual-hero')

  const art=document.createElement('div')
  art.className='pf-hero-art-wrap'
  art.innerHTML=`<img class="pf-hero-art" src="${HOME_ART}" alt="ParFolio Mini golf, GPS play, competition and NIM settlement" fetchpriority="high" decoding="async">`

  const actions=document.createElement('div')
  actions.className='pf-hero-live-actions'
  actions.innerHTML=`
    <button type="button" data-page="play">Start a Round →</button>
    <button type="button" data-page="how">How It Works</button>
    <button type="button" data-page="wallet">Wallet & NIM</button>
  `

  const caption=document.createElement('div')
  caption.className='pf-hero-caption'
  caption.innerHTML=`<strong>Golf. Compete. Settle in NIM.</strong><span>GPS-ready courses · live scoring · optional skins · peer-to-peer settlement</span>`

  hero.append(art,actions,caption)
}

let queued=false
function scheduleUpgrade(){
  if(queued)return
  queued=true
  requestAnimationFrame(()=>{queued=false;upgradeHero()})
}

new MutationObserver(scheduleUpgrade).observe(document.getElementById('app')||document.body,{childList:true,subtree:true})
upgradeHero()
