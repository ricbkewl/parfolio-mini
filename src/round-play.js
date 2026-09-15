const PARFOLIO_SUPABASE_URL='https://unsysuuhykdmbsasdhzg.supabase.co'
const PARFOLIO_PUBLISHABLE_KEY='sb_publishable_lNH7z0PA6wVEztP3Bp4IUQ_xxBa38_f'

let active=null
let watchId=null

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]))
const validPoint=value=>value&&Number.isFinite(Number(value.lat))&&Number.isFinite(Number(value.lng))&&Math.abs(Number(value.lat))<=90&&Math.abs(Number(value.lng))<=180&&!(Number(value.lat)===0&&Number(value.lng)===0)
const rad=value=>Number(value)*Math.PI/180
function yardsBetween(a,b){const lat1=rad(a.lat),lat2=rad(b.lat),dLat=lat2-lat1,dLng=rad(b.lng)-rad(a.lng),h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;return 6371008.8*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))*1.0936133}

async function rpc(name,body){
  const response=await fetch(`${PARFOLIO_SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:PARFOLIO_PUBLISHABLE_KEY,Authorization:`Bearer ${PARFOLIO_PUBLISHABLE_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(body)})
  if(!response.ok)throw new Error(`Course data request failed (${response.status})`)
  return response.json()
}

function validatePayload(payload,course){
  if(!payload||String(payload.mapping_class||'')!=='gps_ready')throw new Error('This course is no longer marked GPS Ready.')
  if(String(payload.catalog_id||'')!==String(course.id||''))throw new Error('Course geometry did not match the selected course.')
  const holes=Number(payload.holes)||Number(course.holes)||0
  const greens=Array.isArray(payload.greens)?payload.greens.slice().sort((a,b)=>Number(a.hole)-Number(b.hole)):[]
  if(![9,18].includes(holes)||greens.length!==holes)throw new Error('This GPS course does not have a complete 9- or 18-hole map.')
  greens.forEach((hole,index)=>{
    if(Number(hole.hole)!==index+1)throw new Error('Course hole numbers are incomplete.')
    if(!validPoint(hole.tee)||!validPoint(hole.center))throw new Error(`Hole ${index+1} is missing valid tee or green GPS coordinates.`)
    const yards=yardsBetween(hole.tee,hole.center)
    if(yards<20||yards>1000)throw new Error(`Hole ${index+1} has invalid GPS geometry.`)
  })
  return {holes,greens}
}

function bboxForHole(hole){
  const points=[hole.tee,hole.center,hole.front,hole.back,hole.aim1,hole.aim2].filter(validPoint)
  let minLat=Math.min(...points.map(p=>Number(p.lat))),maxLat=Math.max(...points.map(p=>Number(p.lat)))
  let minLng=Math.min(...points.map(p=>Number(p.lng))),maxLng=Math.max(...points.map(p=>Number(p.lng)))
  const latPad=Math.max((maxLat-minLat)*0.45,0.0012),lngPad=Math.max((maxLng-minLng)*0.45,0.0012)
  minLat-=latPad;maxLat+=latPad;minLng-=lngPad;maxLng+=lngPad
  return `${minLng},${minLat},${maxLng},${maxLat}`
}

function mapEmbed(hole){
  const bbox=encodeURIComponent(bboxForHole(hole))
  const center=hole.center
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${encodeURIComponent(center.lat)}%2C${encodeURIComponent(center.lng)}`
}

function parFor(hole){const par=Number(hole?.par);return Number.isFinite(par)&&par>=2&&par<=7?par:4}
function currentHole(){return active?.greens?.[active.index]}
function currentScore(){return active?.scores?.[active.index]??parFor(currentHole())}
function totalScore(){return active.scores.reduce((sum,value,index)=>sum+(value??parFor(active.greens[index])),0)}
function totalPar(){return active.greens.reduce((sum,hole)=>sum+parFor(hole),0)}
function birdies(){return active.scores.reduce((sum,value,index)=>sum+((value??parFor(active.greens[index]))<parFor(active.greens[index])?1:0),0)}

function ensureStyles(){
  if(document.getElementById('pf-round-play-style'))return
  const style=document.createElement('style')
  style.id='pf-round-play-style'
  style.textContent=`
  .pf-round-shell{position:fixed;inset:0;z-index:9999;background:#061c15;color:#f8f7ef;display:flex;flex-direction:column;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  .pf-round-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:calc(10px + env(safe-area-inset-top)) 14px 10px;background:rgba(4,24,18,.97);border-bottom:1px solid rgba(255,255,255,.1)}
  .pf-round-top button{border:0;background:rgba(255,255,255,.08);color:#fff;border-radius:12px;padding:10px 12px;font-weight:800}.pf-round-course{min-width:0}.pf-round-course b,.pf-round-course span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pf-round-course span{font-size:.72rem;color:#a9b7b1;margin-top:2px}
  .pf-hole-strip{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:10px 14px;background:#0b2c21}.pf-hole-strip strong{text-align:center;font-size:1.05rem}.pf-hole-strip span:last-child{text-align:right}.pf-hole-strip span{font-size:.76rem;color:#d9c477;font-weight:800}
  .pf-round-map{position:relative;flex:1;min-height:300px;background:#10251e;overflow:hidden}.pf-round-map iframe{width:100%;height:100%;border:0;display:block;filter:saturate(.82) contrast(1.03)}
  .pf-yardage{position:absolute;left:14px;top:14px;background:rgba(3,20,15,.9);border:1px solid rgba(236,206,113,.42);border-radius:16px;padding:10px 13px;box-shadow:0 8px 24px rgba(0,0,0,.24)}.pf-yardage b{display:block;font-size:1.5rem;color:#f0d274}.pf-yardage span{display:block;font-size:.66rem;color:#b8c3be;text-transform:uppercase;letter-spacing:.08em}
  .pf-gps-btn{position:absolute;right:14px;top:14px;border:1px solid rgba(255,255,255,.2);background:rgba(3,20,15,.9);color:#fff;border-radius:14px;padding:10px 12px;font-weight:800}.pf-gps-status{position:absolute;left:14px;bottom:14px;right:14px;background:rgba(3,20,15,.86);border-radius:12px;padding:9px 11px;font-size:.72rem;color:#c9d3ce}
  .pf-score-panel{padding:12px 14px calc(12px + env(safe-area-inset-bottom));background:#071b15;border-top:1px solid rgba(255,255,255,.1)}.pf-score-summary{display:flex;justify-content:space-between;gap:10px;margin-bottom:10px;font-size:.8rem;color:#c6d0cb}.pf-score-summary b{color:#fff}
  .pf-score-row{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center}.pf-score-row button{min-height:52px;border-radius:15px;border:1px solid rgba(255,255,255,.16);background:#113429;color:#fff;font-size:1.45rem;font-weight:900}.pf-score-value{text-align:center}.pf-score-value strong{display:block;font-size:2rem}.pf-score-value span{font-size:.7rem;color:#aebbb5}
  .pf-round-actions{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:8px;margin-top:10px}.pf-round-actions button{min-height:46px;border-radius:13px;border:1px solid rgba(255,255,255,.13);background:#0d3025;color:#fff;font-weight:850}.pf-round-actions .finish{background:linear-gradient(135deg,#d5b85d,#f3dc89);color:#102016;border-color:#ead379}.pf-round-actions button:disabled{opacity:.35}
  .pf-round-loading{position:fixed;inset:0;z-index:9999;background:#061c15;color:#fff;display:grid;place-items:center;text-align:center;padding:28px}.pf-round-loading div{max-width:360px}.pf-round-loading strong{display:block;font-size:1.25rem;margin-bottom:8px}.pf-round-loading p{color:#b7c2bd;line-height:1.45}.pf-round-loading button{margin-top:14px;border:1px solid rgba(255,255,255,.18);background:#103328;color:#fff;border-radius:12px;padding:11px 14px;font-weight:800}
  @media(min-width:780px){.pf-round-shell{left:50%;right:auto;width:min(520px,100vw);transform:translateX(-50%);box-shadow:0 0 60px rgba(0,0,0,.45)}}
  `
  document.head.appendChild(style)
}

function renderRound(){
  if(!active)return
  ensureStyles()
  let shell=document.querySelector('.pf-round-shell')
  if(!shell){shell=document.createElement('section');shell.className='pf-round-shell';document.body.appendChild(shell)}
  const hole=currentHole(),par=parFor(hole),score=currentScore(),toPar=totalScore()-totalPar()
  const teeYards=Math.round(yardsBetween(hole.tee,hole.center))
  const liveYards=active.position&&validPoint(active.position)?Math.round(yardsBetween(active.position,hole.center)):null
  shell.innerHTML=`
    <div class="pf-round-top"><button type="button" data-pf-exit>× Exit</button><div class="pf-round-course"><b>${esc(active.course.name)}</b><span>${esc([active.course.city,active.course.state].filter(Boolean).join(', '))} · GPS Ready</span></div><button type="button" data-pf-scorecard>${active.index+1}/${active.holes}</button></div>
    <div class="pf-hole-strip"><span>PAR ${par}</span><strong>Hole ${active.index+1}</strong><span>${teeYards} yd tee→green</span></div>
    <div class="pf-round-map"><iframe title="Hole ${active.index+1} map" src="${mapEmbed(hole)}" loading="eager" referrerpolicy="no-referrer"></iframe><div class="pf-yardage"><span>to green center</span><b>${liveYards??teeYards} yd</b><span>${liveYards?'from your GPS':'from mapped tee'}</span></div><button class="pf-gps-btn" type="button" data-pf-gps>${active.position?'GPS ✓':'Use GPS'}</button><div class="pf-gps-status">${esc(active.gpsMessage||'Tap Use GPS for live distance to the green center. Map geometry comes from ParFolio’s validated course catalog.')}</div></div>
    <div class="pf-score-panel"><div class="pf-score-summary"><span>Running score <b>${totalScore()}</b></span><span>${toPar===0?'Even':`${toPar>0?'+':''}${toPar}`} to par</span></div><div class="pf-score-row"><button type="button" data-score-delta="-1">−</button><div class="pf-score-value"><strong>${score}</strong><span>${score-par===0?'PAR':score-par<0?`${Math.abs(score-par)} UNDER`:`${score-par} OVER`}</span></div><button type="button" data-score-delta="1">+</button></div><div class="pf-round-actions"><button type="button" data-pf-prev ${active.index===0?'disabled':''}>← Prev</button><button type="button" data-pf-next ${active.index===active.holes-1?'disabled':''}>Next →</button><button class="finish" type="button" data-pf-finish>Finish round</button></div></div>`
  bindRoundControls(shell)
}

function bindRoundControls(shell){
  shell.querySelector('[data-pf-exit]')?.addEventListener('click',closeRound)
  shell.querySelector('[data-pf-prev]')?.addEventListener('click',()=>{if(active.index>0){active.index--;renderRound()}})
  shell.querySelector('[data-pf-next]')?.addEventListener('click',()=>{if(active.index<active.holes-1){active.index++;renderRound()}})
  shell.querySelectorAll('[data-score-delta]').forEach(button=>button.addEventListener('click',()=>{const delta=Number(button.dataset.scoreDelta),next=Math.max(1,Math.min(15,currentScore()+delta));active.scores[active.index]=next;active.touched[active.index]=true;renderRound()}))
  shell.querySelector('[data-pf-gps]')?.addEventListener('click',startGps)
  shell.querySelector('[data-pf-finish]')?.addEventListener('click',finishRound)
  shell.querySelector('[data-pf-scorecard]')?.addEventListener('click',()=>{const completed=active.touched.filter(Boolean).length;active.gpsMessage=`${completed}/${active.holes} holes edited · current total ${totalScore()} (${totalScore()-totalPar()>=0?'+':''}${totalScore()-totalPar()}).`;renderRound()})
}

function startGps(){
  if(!navigator.geolocation){active.gpsMessage='Live GPS is unavailable on this device.';renderRound();return}
  if(watchId!==null){navigator.geolocation.clearWatch(watchId);watchId=null}
  active.gpsMessage='Acquiring your location…'
  renderRound()
  watchId=navigator.geolocation.watchPosition(({coords})=>{active.position={lat:coords.latitude,lng:coords.longitude};active.gpsMessage=`Live GPS · accuracy about ${Math.round(coords.accuracy)} m`;renderRound()},()=>{active.gpsMessage='Location was unavailable or denied. Showing mapped tee-to-green yardage.';renderRound()},{enableHighAccuracy:true,timeout:15000,maximumAge:5000})
}

function closeRound(){
  if(watchId!==null&&navigator.geolocation){navigator.geolocation.clearWatch(watchId);watchId=null}
  document.querySelector('.pf-round-shell')?.remove();active=null
}

function finishRound(){
  const score=totalScore(),par=totalPar(),holes=active.holes,birds=birdies(),course=active.course.name
  const form=document.querySelector('#roundForm')
  if(form){
    const values={course,holes:String(holes),score:String(score),par:String(par),birdies:String(birds)}
    Object.entries(values).forEach(([name,value])=>{const field=form.elements.namedItem(name);if(field){field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}))}})
    const date=form.elements.namedItem('date');if(date&&!date.value)date.value=new Date().toISOString().slice(0,10)
  }
  closeRound()
  const message=document.querySelector('#formMessage')
  if(message)message.textContent=`Round complete: ${score} on par ${par} at ${course}. Sign it with your Nimiq wallet to save the record.`
  form?.scrollIntoView({behavior:'smooth',block:'start'})
  const submit=form?.querySelector('button[type="submit"]')
  if(submit&&!submit.disabled)setTimeout(()=>form.requestSubmit(),450)
}

async function startRound(course){
  if(!course?.id)return
  ensureStyles()
  const loading=document.createElement('div');loading.className='pf-round-loading';loading.innerHTML=`<div><strong>Preparing ${esc(course.name)}</strong><p>Loading and validating the GPS-ready hole geometry before play.</p></div>`;document.body.appendChild(loading)
  try{
    const payload=await rpc('parfolio_course_payload',{p_course_id:course.id})
    const {holes,greens}=validatePayload(payload,course)
    active={course,holes,greens,index:0,scores:greens.map(h=>parFor(h)),touched:Array(holes).fill(false),position:null,gpsMessage:''}
    loading.remove();renderRound()
  }catch(error){
    loading.innerHTML=`<div><strong>Course could not start</strong><p>${esc(error?.message||'GPS geometry could not be loaded.')}</p><button type="button">Back to courses</button></div>`
    loading.querySelector('button')?.addEventListener('click',()=>loading.remove())
  }
}

window.addEventListener('parfolio:course-selected',event=>startRound(event.detail))
document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-use-pf-course]')
  if(!button)return
  const row=button.closest('.pf-mini-catalog-result,.course-result')
  const name=row?.querySelector('b')?.textContent?.trim()||'Golf Course'
  const meta=row?.querySelector('small')?.textContent||''
  const location=meta.split('·')[0].trim()
  const parts=location.split(',').map(value=>value.trim())
  setTimeout(()=>startRound({id:button.dataset.usePfCourse,name,city:parts[0]||'',state:(parts[1]||'CA').split(/\s+/)[0],holes:18}),0)
})
ensureStyles()
