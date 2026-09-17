// Final competition audit normalization.
// Loaded last so older optional/experimental layers cannot override the judged experience.

const faqCopy=[
  ['Getting started',[
    ['What is ParFolio Mini?','ParFolio Mini is a focused golf Mini App: choose a GPS-ready California course, play and score hole by hole, then sign the completed round with a Nimiq wallet.'],
    ['What do I need before I play?','Complete your player profile, connect Nimiq Pay, save the clubs you actually carry, then open Play and choose a GPS-ready course.'],
    ['Do I need a wallet just to browse?','No. You can browse the app first. The Nimiq wallet is required for the signed-round flow and is checked before starting the competition round.']
  ]],
  ['Courses & GPS',[
    ['How do I find a course?','Search by course name, city, or ZIP code. The competition build intentionally limits playable courses to GPS-ready California courses with reviewed hole geometry.'],
    ['What does GPS Ready mean?','The course has complete mapped hole geometry needed for the Mini active-round experience, including valid tee and green positions.'],
    ['What if Near Me is denied?','Search manually by course, city, or ZIP. Location is only required for Near Me and live on-course GPS features.'],
    ['Can I review a course away from the course?','Yes. The app can show mapped hole positions remotely. Live GPS yardage and shot tracking only become meaningful when you are physically near the course.']
  ]],
  ['Nimiq & signatures',[
    ['Why does ParFolio Mini use Nimiq?','Nimiq provides the wallet identity and signature layer for the completed golf record. The golfer explicitly approves the signature in Nimiq Pay.'],
    ['What does the wallet signature prove?','It proves which wallet signed the exact round message shown in the saved record. It does not independently prove that the golfer’s entered score is true.'],
    ['Does ParFolio Mini store private keys?','No. Private keys remain in the Nimiq wallet. Mini only requests wallet actions through the supported integration.'],
    ['Can the app sign without my approval?','No. The player approves the wallet action in Nimiq Pay.']
  ]],
  ['Full-screen play',[
    ['Why does play open full-screen?','The map, yardage, planner, score controls, wind, club suggestion, shot tracking, hole navigation, and scorecard need the full mobile screen.'],
    ['What if Google Maps cannot load?','The app reports the problem and can use the ParFolio-hosted map fallback when the interactive map does not initialize.'],
    ['Will losing location permission erase my score?','No. Location-dependent features may stop updating, but your current scoring state is separate from the device-location request.']
  ]],
  ['Rounds & records',[
    ['What happens when I finish?','ParFolio Mini totals the round, moves the completed result into the signing form, and asks the connected Nimiq wallet to sign the entered round message.'],
    ['Where are signed rounds stored?','Signed rounds are kept on the device and can also sync to the player account when signed in. Clearing local app/browser storage can remove local-only data.'],
    ['Can I share a signed round?','Yes. My Rounds provides a shareable record containing the entered round details and wallet-signature proof.']
  ]],
  ['Privacy & troubleshooting',[
    ['When is my location used?','Only when you choose location-dependent features such as Near Me, live GPS, maps, wind, or shot tracking. Precise movement history is not part of the standard signed-round record.'],
    ['What if the wallet does not connect?','Open ParFolio Mini inside Nimiq Pay, retry the connection, and approve the account request. If no prompt appears, close and reopen the Mini App inside Nimiq Pay.'],
    ['What if a course does not start?','Return to Play, confirm that your profile, wallet, and golf bag are ready, then choose another GPS-ready result or retry the course. The app should display a visible error rather than leave a blank screen.']
  ]]
]

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))

function installStyles(){
  if(document.getElementById('pf-deadline-audit-style'))return
  const s=document.createElement('style');s.id='pf-deadline-audit-style';s.textContent=`
  html,body{max-width:100%;overflow-x:hidden}.pf-pages,.pf-app-page,.panel,.records-section,.pf-extra-section{min-width:0;max-width:100%}img,svg,video,canvas,iframe{max-width:100%}.pf-nav-item,.pf-owner-course-main,.pf-profile-actions button,.pf-auth-actions button{overflow-wrap:anywhere}.pf-app-page[data-page="skins"],.pf-skins-home,#pfJoinRound{display:none!important}
  @media(max-width:420px){.pf-floatbar{width:calc(100vw - 12px)!important;max-width:calc(100vw - 12px)!important}.pf-page-title h1{overflow-wrap:anywhere}.pf-owner-search button{min-width:0!important;padding-left:8px!important;padding-right:8px!important}}
  `;document.head.appendChild(s)
}

function normalizeHome(){
  const brand=document.querySelector('.pf-floatbrand small');if(brand&&brand.textContent!=='GPS golf · wallet-signed rounds')brand.textContent='GPS golf · wallet-signed rounds'
  const intro=document.querySelector('.pf-home-intro');if(intro&&!intro.dataset.auditFixed){intro.dataset.auditFixed='1';intro.innerHTML=`<p class="eyebrow">ParFolio Mini · Competition Edition</p><h2>Play the round. <span>Own the record.</span></h2><p>Choose a GPS-ready California course, use the full-screen ParFolio golf experience, score the round hole by hole, then sign the completed result with your Nimiq wallet.</p><div class="pf-home-cards"><article><b>GPS-ready golf</b><span>Reviewed course geometry, satellite mapping, yardage, planning and on-course controls.</span></article><article><b>Hole-by-hole scoring</b><span>Keep the round moving with a full-screen score experience and live scorecard.</span></article><article><b>Wallet-signed record</b><span>Finish the round, review the total, and explicitly sign the entered result in Nimiq Pay.</span></article></div><div class="pf-demo-hole"><span><strong>Play → Score → Sign</strong><small>The wallet signature identifies the signing wallet; it does not independently certify the golf score.</small></span><span class="pf-demo-pot">✓ SIGNED</span></div>`}
  const hero=document.querySelector('.hero.pf-visual-hero');if(hero){const img=hero.querySelector('.pf-hero-art');if(img){img.alt='ParFolio Mini GPS golf and wallet-signed round';if(!img.src.endsWith('/9B68D5FF-8CCE-40FA-8F35-7F5828913002.png'))img.src='/9B68D5FF-8CCE-40FA-8F35-7F5828913002.png'}const buttons=hero.querySelectorAll('.pf-hero-live-actions button');if(buttons[0]&&buttons[0].textContent!=='Start a Round →')buttons[0].textContent='Start a Round →';if(buttons[1]&&buttons[1].textContent!=='How It Works')buttons[1].textContent='How It Works';if(buttons[2]){if(buttons[2].textContent!=='My ParFolio')buttons[2].textContent='My ParFolio';buttons[2].dataset.page='wallet'}const cap=hero.querySelector('.pf-hero-caption');const wanted='<strong>Play. Score. Sign.</strong><span>GPS-ready golf · full-screen scoring · Nimiq wallet signature</span>';if(cap&&cap.innerHTML!==wanted)cap.innerHTML=wanted}
}

function normalizePlay(){
  const path=document.querySelector('.pf-play-path');if(path){const b=path.querySelector('b');const t=path.querySelector('span');if(b&&b.textContent!=='One clean path to the first tee')b.textContent='One clean path to the first tee';if(t&&t.textContent!=='Choose a GPS-ready course. ParFolio checks your player profile, Nimiq wallet and golf bag, then opens the full-screen round.')t.textContent='Choose a GPS-ready course. ParFolio checks your player profile, Nimiq wallet and golf bag, then opens the full-screen round.';const pills=[...path.querySelectorAll('.pf-ready-pill')];pills.forEach(p=>{if(/match terms/i.test(p.textContent))p.textContent='4 · Choose course';if(/start round/i.test(p.textContent))p.textContent='5 · Start round'})}
  const finder=document.querySelector('.ca-course-finder');if(finder){const note=finder.querySelector('.course-finder-note');if(note){const wanted='Type a course, city, or ZIP, then tap <b>Search</b>. Choose a GPS-ready result to start the round.';if(note.innerHTML!==wanted)note.innerHTML=wanted}}
}

function normalizeMy(){
  document.querySelectorAll('[data-scroll-wallet]').forEach(b=>{const span=b.querySelector('span');if(span&&span.textContent!=='◈')span.textContent='◈';if(b.lastChild&&b.lastChild.textContent!==' Wallet')b.lastChild.textContent=' Wallet'})
  const sub=document.querySelector('.pf-wallet-subhead');if(sub&&!sub.dataset.auditFixed){sub.dataset.auditFixed='1';sub.innerHTML='<p class="eyebrow">Nimiq wallet</p><h2>Connect and sign your finished round.</h2><p>The wallet is the identity/signature layer for the competition build. Private keys remain in Nimiq Pay.</p>'}
  const title=document.querySelector('.pf-app-page[data-page="wallet"] .pf-page-title p:last-child');const wanted='Keep your player details, Nimiq wallet, clubs and signed rounds together. Your wallet signs the completed round you choose to save.';if(title&&title.textContent!==wanted)title.textContent=wanted
}

function normalizeAuth(){
  const panel=document.querySelector('.pf-auth-panel');if(!panel)return
  const h=panel.querySelector('h2'),p=panel.querySelector(':scope>p:not(.eyebrow)')
  if(h&&/sign up or sign in before you play/i.test(h.textContent))h.textContent='Optional account sync.'
  if(p&&/Create your ParFolio Mini account first/i.test(p.textContent))p.textContent='You can use the core Mini locally. Sign up or sign in if you want profile, golf-bag and signed-round data to sync to your ParFolio Mini account.'
}

function normalizeFaq(){
  const page=document.querySelector('.pf-app-page[data-page="faq"]');if(!page||page.dataset.auditFixed==='1')return
  page.dataset.auditFixed='1'
  const intro=page.querySelector('.pf-faq-intro');if(intro)intro.innerHTML='<p class="eyebrow">Help · Privacy · Round signing</p><h1>ParFolio Mini FAQ</h1><p>What players should know before connecting a wallet, choosing a course, using GPS, playing a round, and signing the finished record.</p>'
  const sections=page.querySelector('.pf-faq-sections');if(sections)sections.innerHTML=faqCopy.map(([title,items])=>`<section class="pf-faq-section" data-faq-section><h2>${esc(title)}</h2>${items.map(([q,a])=>`<details class="pf-faq-item" data-faq-item><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>`).join('')
  const legal=page.querySelector('.pf-faq-legal');if(legal)legal.innerHTML='<b>Important:</b> ParFolio Mini records player-entered golf results. A Nimiq wallet signature proves which wallet signed the submitted round message; it does not independently certify the underlying golf performance.'
}

function removeStaleCompetitionUI(){
  document.querySelectorAll('.pf-app-page[data-page="skins"],.pf-nav-item[data-page="skins"],#pfJoinRound,.pf-skins-home').forEach(el=>el.remove())
  document.querySelectorAll('.pf-nav-item').forEach(btn=>{if(/Wallet\s*&\s*NIM|Skins|Join with Code|Skins Rules/i.test(btn.textContent))btn.remove()})
}

function normalizeTitle(){const n=location.hash.replace('#/','')||'home';const t={home:'Play. Score. Sign.',play:'Play',wallet:'My ParFolio',rounds:'My Rounds',clubs:'My Clubs',how:'How It Works',faq:'FAQ'}[n]||'Play. Score. Sign.';const wanted=`ParFolio Mini · ${t}`;if(document.title!==wanted)document.title=wanted}

function run(){installStyles();removeStaleCompetitionUI();normalizeHome();normalizePlay();normalizeMy();normalizeAuth();normalizeFaq();normalizeTitle()}

// IMPORTANT: no document-wide MutationObserver here. Earlier builds crashed on
// mobile because DOM normalization rewrites recursively triggered the observer.
// A short bounded startup pass plus explicit app events is enough.
let passes=0;const timer=setInterval(()=>{passes++;run();if(passes>=48)clearInterval(timer)},125)
document.addEventListener('click',()=>setTimeout(run,20),true)
window.addEventListener('hashchange',()=>setTimeout(run,0))
window.addEventListener('parfolio:wallet-updated',()=>setTimeout(run,0))
window.addEventListener('parfolio:profile-updated',()=>setTimeout(run,0))
window.addEventListener('parfolio:auth-updated',()=>setTimeout(run,0))
run()
