const FAQ_PAGE='faq'
const PAGE_KEY='parfolio-mini:page-v1'

const faqSections=[
  ['Getting started',[
    ['What do I need before I can play?','Complete your My ParFolio profile, connect your Nimiq wallet, set up the clubs that are actually in your golf bag, then go to Play and choose a GPS-ready course. Match terms are agreed before the round starts.'],
    ['Do I need Nimiq just to browse the app?','No. You can browse ParFolio Mini without connecting a wallet. A connected Nimiq wallet is required before starting a competition round because it is used as the playing credential and for signing/settlement actions.'],
    ['Where should a new player begin?','Open My ParFolio first. Finish the profile, follow the Nimiq setup links if needed, connect Nimiq Pay, then open My Clubs and save your golf bag. After those steps show ready, use Play.']
  ]],
  ['Courses, Search & Near Me',[
    ['How do I search for a course?','On Play, enter a course name, city, or ZIP code and tap Search. Results are limited to California courses currently marked GPS Ready in the ParFolio course catalog.'],
    ['Why can’t I find every golf course?','ParFolio Mini currently exposes only GPS-ready California courses whose hole geometry has been reviewed for the active-round experience. A course may exist in the larger catalog but not yet be GPS Ready.'],
    ['What does Near Me do?','Near Me asks your device for location permission and ranks GPS-ready courses by distance from your current position. Your live location is used for that request and on-course GPS features; it is not added to your public signed-round record.'],
    ['What if Near Me does nothing?','Check that location permission is enabled for the browser or Nimiq Pay Mini App, then try again. If location is unavailable or denied, search by city or ZIP instead. The app should display a visible error or permission message rather than fail silently.'],
    ['What happens when I choose a course?','If your profile, wallet, and golf bag are ready, ParFolio Mini opens the pre-round agreement. After all players agree, the selected course loads into the full-screen ParFolio playing experience.']
  ]],
  ['Nimiq, Wallets & NIM',[
    ['What is Nimiq Pay?','Nimiq Pay is the wallet/payment environment ParFolio Mini uses to request account access, sign a completed round, and approve direct NIM transfers. Your private keys remain in your wallet.'],
    ['What is NIM?','NIM is the native currency of the Nimiq blockchain. In ParFolio Mini it can be used for optional, skill-based golf rewards agreed before play.'],
    ['Does ParFolio Mini hold my NIM?','No. ParFolio Mini is non-custodial. It calculates the agreed result, but funds remain in each player’s wallet until that player approves a transfer in Nimiq Pay.'],
    ['Can ParFolio Mini send a payment without my approval?','No. A paying player must approve the transaction in their own Nimiq wallet.'],
    ['Why is the wallet required before a round?','The wallet is the Mini App credential used for the competition build. It also allows the finished round to be signed and provides the payment path if players chose a NIM-based match.']
  ]],
  ['Skill Competition & Match Rules',[
    ['Is ParFolio Mini gambling or a game of chance?','No random outcome, odds, spin, draw, or house edge determines the result. The competition is based on golf scores under rules the players agree to before the first shot.'],
    ['What match formats are available?','Players can choose a per-hole skill challenge, a whole-round lowest-score challenge, or golf-only with no NIM reward.'],
    ['How do per-hole rewards work?','The agreed NIM amount is tied to the hole result. Lowest golf score wins the hole. If the hole is tied, the reward carries according to the agreed format.'],
    ['How does a whole-round reward work?','The lowest total golf score wins under the locked agreement. If the final result is tied, no winner is declared for that whole-round reward.'],
    ['Can match terms change after play begins?','The intent is no. Players review and agree to the same terms before the round starts so the scoring and settlement calculation are based on one locked agreement.'],
    ['Does ParFolio Mini guarantee that entered scores are true?','No. The app records the scores entered during play. A wallet signature proves which wallet signed the submitted round record; it does not independently prove that the golf score itself is accurate.']
  ]],
  ['Golf Bag & Club Suggestions',[
    ['Why do I need to set up My Clubs?','Your bag tells ParFolio Mini which clubs you actually carry. Carry distances let the active-round screen give a more useful club suggestion for the remaining yardage.'],
    ['Do I have to enter every club?','No. Check only the clubs that are actually in your bag. Unchecked clubs are not supposed to appear in on-course suggestions.'],
    ['What if I leave a carry distance blank?','The club can still be part of your bag, but a club without a useful carry distance cannot be reliably matched to a yardage recommendation.'],
    ['Can I change my golf bag later?','Yes. Return to My Clubs, change the selected clubs or carry distances, and save the bag again.']
  ]],
  ['GPS, Maps & Active Play',[
    ['What does GPS Ready mean?','The course has validated hole geometry sufficient for the Mini active-round experience, including tee and green positioning required by the course payload.'],
    ['Why does the round open full-screen?','Active golf is intentionally modeled after the main ParFolio experience so the map, yardage, planner, score controls, wind, hole navigation, club suggestion, and scorecard get the full screen.'],
    ['Can I use the app away from the golf course?','You can review a mapped hole remotely, but live GPS yardage and shot tracking depend on being physically near the course. When you are outside the course area, Mini uses mapped positions instead of pretending your remote GPS position is on the hole.'],
    ['What if the satellite map cannot load?','The app first attempts the full interactive ParFolio map stack. A hosted ParFolio map is available as a fallback when the direct map cannot initialize.']
  ]],
  ['Rounds, Signatures & Records',[
    ['What gets saved when I finish?','A completed round can be signed with the connected Nimiq wallet and saved to My Rounds on the device, including the course, date, score, par, and cryptographic signature information used for the shareable record.'],
    ['What does the signature prove?','It proves that the associated wallet signed the exact round message shown in the record. It does not independently verify that the underlying golf performance occurred exactly as entered.'],
    ['Where are my rounds stored?','The current competition build keeps signed-round history in local device storage. Clearing browser/app storage may remove locally stored profile, golf-bag, match, and round-history information.'],
    ['Can I share a signed round?','Yes. My Rounds provides a shareable record containing the entered round information and wallet-signature proof.']
  ]],
  ['Privacy & Data Use',[
    ['What personal information does Mini use?','Depending on what you choose to enter, Mini may use your name, optional contact/profile details, Nimiq wallet address, golf-bag selections and carry distances, round records, match terms, and device location for location-dependent golf features.'],
    ['Where is my profile information stored?','The current submission build stores profile, bag, match, and signed-round state primarily on the local device. Public course-reference data and reviewed GPS geometry are retrieved from the ParFolio course catalog.'],
    ['Is my precise location put into my signed golf record?','No. Location is used for Near Me, live GPS yardage, and related on-course functionality. The standard signed-round record is about the round result and signing wallet, not a history of your precise movements.'],
    ['Does ParFolio Mini store private keys?','No. Private keys stay with the Nimiq wallet. Mini requests wallet actions through the Nimiq Mini App integration.'],
    ['Why is there a data-use consent step?','The app explains what information it uses before profile setup so the player can make an informed choice before storing personal/profile data and using location-dependent functions.']
  ]],
  ['Troubleshooting',[
    ['Search returned no results. What should I try?','Use a city or ZIP without extra wording, try the exact course name, or use Near Me. Remember that only GPS-ready California courses are included in this build.'],
    ['I tap a course but cannot start. Why?','Check My ParFolio readiness. Profile, Nimiq wallet, and Golf Bag must be ready before match setup can begin.'],
    ['My wallet is not connecting. What should I do?','Open the Mini inside Nimiq Pay, retry Connect Nimiq Pay, and approve the account request. If no wallet prompt appears, close and reopen the Mini App inside Nimiq Pay.'],
    ['The app asks for location permission. Is that required?','It is required for Near Me and live on-course GPS features, but not for browsing the app or manually searching by course/city/ZIP.'],
    ['Can I join another player by QR/code right now?','Not in the current submission build. Shared-round code/QR synchronization is intentionally disabled until the core local round flow is fully verified.'],
    ['What should I do if a control appears broken?','First return to the menu and reopen the page. If the issue persists, note the exact page, button, and action you took. A short screen recording is especially useful for reproducing mobile/Nimiq Pay issues.']
  ]]
]

function installFaqStyles(){
  if(document.getElementById('pf-faq-style'))return
  const s=document.createElement('style');s.id='pf-faq-style';s.textContent=`
  .pf-faq-page{max-width:900px;margin:0 auto}.pf-faq-intro{margin-bottom:16px;padding:18px;border:1px solid rgba(239,211,117,.2);border-radius:20px;background:linear-gradient(145deg,rgba(10,45,34,.94),rgba(5,27,20,.94))}.pf-faq-intro h1{margin:4px 0 8px;font-size:clamp(2rem,7vw,3.6rem);line-height:1}.pf-faq-intro p{margin:0;color:#afc0b8;line-height:1.55}.pf-faq-search{width:100%;margin:14px 0 18px;min-height:48px;border-radius:13px;border:1px solid rgba(255,255,255,.14);background:#061d16;color:#fff;padding:0 14px;font-size:16px}.pf-faq-section{margin:14px 0;padding:16px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:rgba(7,31,24,.9)}.pf-faq-section h2{margin:0 0 10px;color:#efd476;font-size:1.2rem}.pf-faq-item{border-top:1px solid rgba(255,255,255,.07)}.pf-faq-item:first-of-type{border-top:0}.pf-faq-item summary{cursor:pointer;list-style:none;padding:13px 2px;font-weight:850;color:#fff}.pf-faq-item summary::-webkit-details-marker{display:none}.pf-faq-item summary:after{content:'＋';float:right;color:#efd476}.pf-faq-item[open] summary:after{content:'−'}.pf-faq-item p{margin:0 0 14px;color:#b7c5be;line-height:1.55;font-size:.88rem}.pf-faq-empty{display:none;padding:18px;text-align:center;color:#aebdb6}.pf-faq-legal{margin-top:16px;padding:12px 14px;border-radius:14px;background:rgba(239,211,117,.08);border:1px solid rgba(239,211,117,.2);color:#d7c77e;font-size:.78rem;line-height:1.5}
  `;document.head.appendChild(s)
}

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function buildFaq(){
  if(document.querySelector('.pf-app-page[data-page="faq"]'))return true
  const pages=document.querySelector('.pf-pages');if(!pages)return false
  installFaqStyles()
  const page=document.createElement('section');page.className='pf-app-page pf-faq-page';page.dataset.page='faq'
  page.innerHTML=`<div class="pf-faq-intro"><p class="eyebrow">Help · Privacy · Rules</p><h1>ParFolio Mini FAQ</h1><p>Everything a player should know before connecting a wallet, choosing a course, starting a skill-based match, using GPS, signing a round, or approving a NIM settlement.</p></div><input class="pf-faq-search" type="search" placeholder="Search FAQ…" aria-label="Search FAQ"><div class="pf-faq-sections">${faqSections.map(([title,items])=>`<section class="pf-faq-section" data-faq-section><h2>${esc(title)}</h2>${items.map(([q,a])=>`<details class="pf-faq-item" data-faq-item><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>`).join('')}</div><div class="pf-faq-empty">No FAQ answers match that search.</div><div class="pf-faq-legal"><b>Important:</b> ParFolio Mini records player-entered golf results and can calculate optional skill-based NIM settlement. It does not independently certify golf performance, hold player funds, or control a player’s private wallet keys.</div>`
  pages.appendChild(page)
  const input=page.querySelector('.pf-faq-search'),empty=page.querySelector('.pf-faq-empty')
  input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();let visible=0;page.querySelectorAll('[data-faq-section]').forEach(section=>{let sectionCount=0;section.querySelectorAll('[data-faq-item]').forEach(item=>{const show=!q||item.textContent.toLowerCase().includes(q);item.style.display=show?'':'none';if(show)sectionCount++});section.style.display=sectionCount?'':'none';visible+=sectionCount});empty.style.display=visible?'none':'block'})
  return true
}
function addFaqNav(){
  const drawer=document.querySelector('.pf-drawer');if(!drawer||drawer.querySelector('[data-faq-page]'))return false
  const group=drawer.querySelector('.pf-nav-group');if(!group)return false
  const b=document.createElement('button');b.className='pf-nav-item';b.type='button';b.dataset.faqPage='';b.innerHTML='<i>?</i>FAQ';group.appendChild(b);return true
}
function openFaq(push=true){
  if(!buildFaq())return
  document.querySelectorAll('.pf-app-page').forEach(p=>p.classList.toggle('active',p.dataset.page===FAQ_PAGE))
  document.querySelectorAll('.pf-nav-item').forEach(b=>b.classList.toggle('active',b.hasAttribute('data-faq-page')))
  document.querySelector('.pf-drawer')?.classList.remove('open');document.querySelector('.pf-drawer-backdrop')?.classList.remove('open')
  localStorage.setItem(PAGE_KEY,FAQ_PAGE);if(push&&location.hash!=='#/faq')history.pushState({page:'faq'},'', '#/faq')
  window.scrollTo({top:0,behavior:'instant'});document.title='ParFolio Mini · FAQ'
}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-faq-page]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();openFaq()},true)
window.addEventListener('popstate',()=>{if(location.hash==='#/faq')setTimeout(()=>openFaq(false),0)})
function run(){buildFaq();addFaqNav();if(location.hash==='#/faq')openFaq(false)}
let tries=0;const timer=setInterval(()=>{tries++;run();if((document.querySelector('[data-faq-page]')&&document.querySelector('.pf-app-page[data-page="faq"]'))||tries>50)clearInterval(timer)},120)
run()
