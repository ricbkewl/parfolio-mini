/* ParFolio Mini active-round player.
   Goal: preserve the proven ParFolio full-screen golf experience and layer Mini/NIM competition on top.
   Mini owns only its session, wallet-signing handoff, and skins overlay. */
const PARFOLIO_SUPABASE_URL='https://unsysuuhykdmbsasdhzg.supabase.co'
const PARFOLIO_PUBLISHABLE_KEY='sb_publishable_lNH7z0PA6wVEztP3Bp4IUQ_xxBa38_f'
const PARFOLIO_RUNTIME_CONFIG='https://parfolio-iota.vercel.app/api/runtime-config'

let active=null
let watchId=null
let mapsPromise=null
let googleMap=null
let googleOverlays=[]
let plannerMarker=null
let positionMarker=null
let windAbort=null

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const validPoint=value=>value&&Number.isFinite(Number(value.lat))&&Number.isFinite(Number(value.lng))&&Math.abs(Number(value.lat))<=90&&Math.abs(Number(value.lng))<=180&&!(Number(value.lat)===0&&Number(value.lng)===0)
const cleanPoint=value=>validPoint(value)?{lat:Number(value.lat),lng:Number(value.lng)}:null
const rad=value=>Number(value)*Math.PI/180
function yardsBetween(a,b){if(!validPoint(a)||!validPoint(b))return 0;const lat1=rad(a.lat),lat2=rad(b.lat),dLat=lat2-lat1,dLng=rad(b.lng)-rad(a.lng),h=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;return 6371008.8*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))*1.0936133}
function bearingBetween(a,b){const y=Math.sin(rad(b.lng-a.lng))*Math.cos(rad(b.lat)),x=Math.cos(rad(a.lat))*Math.sin(rad(b.lat))-Math.sin(rad(a.lat))*Math.cos(rad(b.lat))*Math.cos(rad(b.lng-a.lng));return (Math.atan2(y,x)*180/Math.PI+360)%360}
function compass(deg){return ['N','NE','E','SE','S','SW','W','NW'][Math.round((((Number(deg)||0)%360)+360)%360/45)%8]}

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

function parFor(hole){const par=Number(hole?.par);return Number.isFinite(par)&&par>=2&&par<=7?par:4}
function currentHole(){return active?.greens?.[active.index]}
function currentScore(){return active?.scores?.[active.index]??parFor(currentHole())}
function totalScore(){return active.scores.reduce((sum,value,index)=>sum+(value??parFor(active.greens[index])),0)}
function totalPar(){return active.greens.reduce((sum,hole)=>sum+parFor(hole),0)}
function playedPar(){return active.greens.slice(0,active.index+1).reduce((sum,hole)=>sum+parFor(hole),0)}
function playedScore(){return active.scores.slice(0,active.index+1).reduce((sum,value,index)=>sum+(value??parFor(active.greens[index])),0)}
function birdies(){return active.scores.reduce((sum,value,index)=>sum+((value??parFor(active.greens[index]))<parFor(active.greens[index])?1:0),0)}
function basePosition(){return active?.position&&active.nearCourse?active.position:currentHole()?.tee}
function targetPoint(){return active?.planner&&validPoint(active.planner)?active.planner:currentHole()?.center}
function liveYards(){return Math.round(yardsBetween(basePosition(),currentHole()?.center))}
function routeYards(){const hole=currentHole(),start=basePosition();if(!hole||!validPoint(start))return 0;const route=[start,hole.aim1,hole.aim2,hole.center].filter(validPoint);let total=0;for(let i=0;i<route.length-1;i++)total+=yardsBetween(route[i],route[i+1]);return Math.round(total)}
function frontYards(){return validPoint(currentHole()?.front)?Math.round(yardsBetween(basePosition(),currentHole().front)):null}
function backYards(){return validPoint(currentHole()?.back)?Math.round(yardsBetween(basePosition(),currentHole().back)):null}

function loadGoogleMaps(){
  if(window.google?.maps?.Map)return Promise.resolve(window.google.maps)
  if(mapsPromise)return mapsPromise
  mapsPromise=new Promise((resolve,reject)=>{
    const callback='__parfolioMiniGoogleReady'
    const finish=()=>window.google?.maps?.Map?resolve(window.google.maps):reject(new Error('Google Maps did not initialize.'))
    const loadApi=()=>{
      const key=String(window.PARFOLIO_GOOGLE_MAPS_API_KEY||'').trim()
      if(!key){reject(new Error('ParFolio Google Maps configuration is unavailable.'));return}
      window[callback]=()=>{try{delete window[callback]}catch{};finish()}
      const script=document.createElement('script')
      script.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=${callback}`
      script.async=true;script.defer=true;script.onerror=()=>reject(new Error('Google Maps failed to load.'))
      document.head.appendChild(script)
    }
    if(window.PARFOLIO_GOOGLE_MAPS_API_KEY){loadApi();return}
    const config=document.createElement('script')
    config.src=`${PARFOLIO_RUNTIME_CONFIG}?v=${Date.now()}`
    config.async=true;config.onload=loadApi;config.onerror=()=>reject(new Error('ParFolio map configuration could not be loaded.'))
    document.head.appendChild(config)
  }).catch(error=>{mapsPromise=null;throw error})
  return mapsPromise
}

function clearGoogleOverlays(){
  googleOverlays.forEach(item=>{try{item.setMap(null)}catch{}})
  googleOverlays=[]
  if(plannerMarker){try{plannerMarker.setMap(null)}catch{};plannerMarker=null}
  if(positionMarker){try{positionMarker.setMap(null)}catch{};positionMarker=null}
}

function coursePoints(hole){return [hole.tee,hole.aim1,hole.aim2,hole.front,hole.center,hole.back].filter(validPoint).map(cleanPoint)}
function makeDot(position,fill,title,scale=7){const marker=new google.maps.Marker({map:googleMap,position:cleanPoint(position),title,icon:{path:google.maps.SymbolPath.CIRCLE,scale,fillColor:fill,fillOpacity:1,strokeColor:'#ffffff',strokeWeight:2}});googleOverlays.push(marker);return marker}

function drawGoogleHole(){
  const container=document.querySelector('#pfGoogleHoleMap'),hole=currentHole()
  if(!container||!hole||!window.google?.maps)return
  if(!googleMap){
    googleMap=new google.maps.Map(container,{mapTypeId:active.mapType||'satellite',disableDefaultUI:true,gestureHandling:'greedy',keyboardShortcuts:false,tilt:0,heading:0,backgroundColor:'#173c2b',clickableIcons:false})
    googleMap.addListener('click',event=>{if(!active||!event.latLng)return;active.planner={lat:event.latLng.lat(),lng:event.latLng.lng()};renderRound({keepMap:true})})
  }
  googleMap.setMapTypeId(active.mapType||'satellite')
  clearGoogleOverlays()
  const route=[hole.tee,hole.aim1,hole.aim2,hole.center].filter(validPoint).map(cleanPoint)
  if(route.length>=2)googleOverlays.push(new google.maps.Polyline({map:googleMap,path:route,strokeColor:'#f4d974',strokeOpacity:.96,strokeWeight:4,zIndex:800}))
  if(validPoint(hole.front)&&validPoint(hole.back))googleOverlays.push(new google.maps.Polyline({map:googleMap,path:[cleanPoint(hole.front),cleanPoint(hole.back)],strokeColor:'#ffffff',strokeOpacity:.78,strokeWeight:2,zIndex:700}))
  makeDot(hole.tee,'#ffffff','Tee',6)
  makeDot(hole.center,'#f2d675','Green center',8)
  if(validPoint(hole.front))makeDot(hole.front,'#65c88a','Green front',4)
  if(validPoint(hole.back))makeDot(hole.back,'#65c88a','Green back',4)
  if(active.position&&active.nearCourse){positionMarker=new google.maps.Marker({map:googleMap,position:cleanPoint(active.position),title:'You',zIndex:1200,icon:{path:google.maps.SymbolPath.CIRCLE,scale:8,fillColor:'#4ea8ff',fillOpacity:1,strokeColor:'#ffffff',strokeWeight:3}})}
  if(validPoint(active.planner))plannerMarker=new google.maps.Marker({map:googleMap,position:cleanPoint(active.planner),title:'Aim point',draggable:true,zIndex:1300,icon:{path:google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,scale:7,fillColor:'#ffd65c',fillOpacity:1,strokeColor:'#111111',strokeWeight:1.5,rotation:180}})
  if(plannerMarker)plannerMarker.addListener('dragend',event=>{active.planner={lat:event.latLng.lat(),lng:event.latLng.lng()};renderRound({keepMap:true})})
  const bounds=new google.maps.LatLngBounds();coursePoints(hole).forEach(point=>bounds.extend(point));if(active.position&&active.nearCourse)bounds.extend(cleanPoint(active.position));if(validPoint(active.planner))bounds.extend(cleanPoint(active.planner))
  googleMap.fitBounds(bounds,{top:115,right:42,bottom:150,left:42})
  google.maps.event.addListenerOnce(googleMap,'idle',()=>{const z=Number(googleMap.getZoom()||17);if(z>19)googleMap.setZoom(19);const heading=bearingBetween(hole.tee,hole.center);if(Number.isFinite(heading)&&googleMap.setHeading)googleMap.setHeading(heading)})
}

async function updateWind(){
  if(!active)return
  try{windAbort?.abort?.()}catch{}
  windAbort=new AbortController()
  const point=active.position&&active.nearCourse?active.position:currentHole()?.center
  if(!validPoint(point))return
  try{
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(point.lat)}&longitude=${encodeURIComponent(point.lng)}&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=mph`
    const response=await fetch(url,{signal:windAbort.signal});if(!response.ok)throw new Error('wind')
    const json=await response.json();active.wind={speed:Math.round(Number(json.current?.wind_speed_10m)||0),direction:Number(json.current?.wind_direction_10m)||0};refreshHudOnly()
  }catch(error){if(error?.name!=='AbortError'){active.wind=null;refreshHudOnly()}}
}

function suggestedClub(yards){
  const clubs=[['Driver',245],['3W',220],['5W',205],['4H',190],['5I',175],['6I',165],['7I',155],['8I',145],['9I',135],['PW',120],['GW',105],['SW',85],['LW',65]]
  let best=clubs[clubs.length-1],delta=Infinity
  clubs.forEach(club=>{const d=Math.abs(club[1]-yards);if(d<delta){delta=d;best=club}})
  return best[0]
}

function ensureStyles(){
  if(document.getElementById('pf-round-play-style'))return
  const style=document.createElement('style')
  style.id='pf-round-play-style'
  style.textContent=`
  html:has(.pf-round-shell),body:has(.pf-round-shell){width:100%;min-height:100%;margin:0;overflow:hidden;overscroll-behavior:none;background:#173c2b}body:has(.pf-round-shell){position:fixed;inset:0}
  .pf-round-shell{position:fixed;inset:0;z-index:9999;width:100vw;height:calc(100dvh + env(safe-area-inset-bottom));overflow:hidden;background:#173c2b;color:#fff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  .pf-round-map,.pf-google-map{position:absolute;inset:0;width:100%;height:100%;background:#173c2b}.pf-map-loading{position:absolute;inset:0;display:grid;place-items:center;background:#173c2b;color:#dce5df;font-size:.82rem;z-index:1}
  .round-course-name-strip{position:absolute;z-index:1605;top:max(24px,calc(env(safe-area-inset-top) - 21px));left:50%;transform:translateX(-50%);max-width:min(58vw,320px);height:20px;padding:1px 11px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:linear-gradient(155deg,rgba(20,45,36,.52),rgba(8,24,19,.66));backdrop-filter:blur(14px) saturate(135%);box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 4px 14px rgba(0,0,0,.18);font-size:10px;font-weight:800;text-overflow:ellipsis;white-space:nowrap}
  .round-map-summary{position:absolute;z-index:1600;top:max(6px,calc(env(safe-area-inset-top) + 6px));left:10px;right:10px;min-height:57px;border-radius:15px;background:rgba(0,0,0,.78);backdrop-filter:blur(10px);display:grid;grid-template-columns:repeat(4,1fr) auto;align-items:center;padding:9px 10px;box-shadow:0 6px 18px rgba(0,0,0,.28)}
  .round-map-summary .metric{padding:0 7px;border-right:1px solid rgba(255,255,255,.16)}.round-map-summary .metric:last-of-type{border-right:0}.round-map-summary small{display:block;color:#aab5b0;font-size:8px;font-weight:800;letter-spacing:.08em}.round-map-summary strong{display:block;margin-top:2px;font-size:16px}.round-map-summary .metric:nth-child(2) strong{color:#f3d976}.pf-exit{border:0;background:rgba(255,255,255,.09);color:#fff;width:36px;height:36px;border-radius:50%;font-size:18px}
  .pf-live-yardage{position:absolute;z-index:1550;left:12px;top:calc(max(6px,env(safe-area-inset-top) + 6px) + 69px);padding:8px 11px;border-radius:12px;background:rgba(2,18,13,.82);backdrop-filter:blur(8px);box-shadow:0 4px 12px rgba(0,0,0,.25)}.pf-live-yardage b{display:block;color:#f3d976;font-size:28px;line-height:.95}.pf-live-yardage span{font-size:9px;color:#d5ddd9;text-transform:uppercase;letter-spacing:.06em}
  .pf-green-yardages{position:absolute;z-index:1550;right:12px;top:calc(max(6px,env(safe-area-inset-top) + 6px) + 69px);display:flex;gap:6px}.pf-green-yardages span{padding:6px 8px;border-radius:10px;background:rgba(0,0,0,.72);font-size:10px;font-weight:800}.pf-green-yardages b{color:#f3d976}
  .pf-wind{position:absolute;z-index:1550;right:12px;top:calc(max(6px,env(safe-area-inset-top) + 6px) + 103px);padding:6px 9px;border-radius:10px;background:rgba(0,0,0,.7);font-size:10px;font-weight:800}.pf-wind .arrow{display:inline-block;margin-right:5px;transform-origin:center}
  .pf-planner-card{position:absolute;z-index:1550;left:12px;bottom:calc(126px + env(safe-area-inset-bottom));padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.74);backdrop-filter:blur(8px);font-size:10px;line-height:1.35;min-width:128px}.pf-planner-card b{color:#f3d976}.pf-planner-card button{margin-top:5px;border:0;background:transparent;color:#f3d976;font-weight:800;padding:0;font-size:10px}
  .pf-map-tools{position:absolute;z-index:1550;right:12px;bottom:calc(126px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:7px}.pf-map-tools button{width:42px;height:42px;border:1px solid rgba(255,255,255,.18);border-radius:12px;background:rgba(0,0,0,.74);color:#fff;font-weight:900}.pf-map-tools .active{color:#f3d976;border-color:#f3d976}
  .pf-club-chip{position:absolute;z-index:1550;left:12px;bottom:calc(87px + env(safe-area-inset-bottom));padding:7px 10px;border-radius:999px;background:rgba(0,0,0,.76);font-size:10px}.pf-club-chip b{color:#f3d976}
  .pf-score-panel{position:absolute;z-index:1650;left:0;right:0;bottom:0;padding:6px 10px calc(7px + env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(3,20,15,.25),rgba(3,20,15,.97) 28%);pointer-events:none}.pf-score-row,.pf-round-actions,.pf-score-summary{pointer-events:auto}.pf-score-summary{display:flex;justify-content:center;gap:14px;margin-bottom:4px;font-size:10px;color:#d7e0dc}.pf-score-summary b{color:#fff}.pf-score-row{display:grid;grid-template-columns:44px 1fr 44px;gap:8px;align-items:center;width:min(270px,76vw);margin:0 auto}.pf-score-row button{height:42px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(6,35,26,.9);color:#fff;font-size:24px;font-weight:900}.pf-score-value{text-align:center;padding:2px 10px;border-radius:12px;background:rgba(0,0,0,.58)}.pf-score-value strong{display:block;font-size:24px;line-height:1}.pf-score-value span{font-size:8px;color:#cad5d0}.pf-round-actions{display:grid;grid-template-columns:1fr 1.1fr 1fr;gap:7px;margin-top:6px}.pf-round-actions button{height:37px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:rgba(8,42,31,.9);color:#fff;font-size:10px;font-weight:850}.pf-round-actions .gold{background:#e1c768;color:#102017;border-color:#ecd87e}.pf-round-actions button:disabled{opacity:.32}
  .pf-scorecard-overlay{position:fixed;inset:0;z-index:12000;background:rgba(2,12,9,.94);display:grid;place-items:center;padding:18px}.pf-scorecard-card{width:min(650px,100%);max-height:88dvh;overflow:auto;border:1px solid rgba(242,210,112,.3);border-radius:20px;background:#09271e;padding:18px}.pf-scorecard-card h2{margin:0 0 5px}.pf-scorecard-card p{margin:0 0 12px;color:#aebdb6;font-size:12px}.pf-scorecard-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.pf-scorecard-grid div{padding:8px 4px;text-align:center;border-radius:9px;background:rgba(255,255,255,.06);font-size:11px}.pf-scorecard-grid b{display:block;color:#f2d675;font-size:13px}.pf-scorecard-close{width:100%;margin-top:12px;height:42px;border:1px solid rgba(255,255,255,.18);border-radius:11px;background:#15372c;color:#fff;font-weight:800}
  .pf-round-loading{position:fixed;inset:0;z-index:13000;background:#061c15;color:#fff;display:grid;place-items:center;text-align:center;padding:28px}.pf-round-loading div{max-width:360px}.pf-round-loading strong{display:block;font-size:1.25rem;margin-bottom:8px}.pf-round-loading p{color:#b7c2bd;line-height:1.45}.pf-round-loading button{margin-top:14px;border:1px solid rgba(255,255,255,.18);background:#103328;color:#fff;border-radius:12px;padding:11px 14px;font-weight:800}
  @media(max-width:390px){.round-course-name-strip{max-width:56vw;height:19px;padding:1px 9px;font-size:9px}.round-map-summary{left:7px;right:7px;padding:8px 7px}.round-map-summary .metric{padding:0 5px}.round-map-summary strong{font-size:14px}.pf-score-row{width:min(250px,76vw)}}
  `
  document.head.appendChild(style)
}

function refreshHudOnly(){if(!active)return;const wind=document.querySelector('.pf-wind');if(wind){const w=active.wind;wind.innerHTML=w?`<span class="arrow" style="transform:rotate(${Math.round(w.direction)}deg)">↑</span>${compass(w.direction)} ${w.speed} mph`:'Wind —'} }

function renderRound(options={}){
  if(!active)return
  ensureStyles()
  let shell=document.querySelector('.pf-round-shell')
  if(!shell){shell=document.createElement('section');shell.className='pf-round-shell';document.body.appendChild(shell)}
  const hole=currentHole(),par=parFor(hole),score=currentScore(),toPar=playedScore()-playedPar(),center=liveYards(),front=frontYards(),back=backYards(),target=targetPoint(),plannerFrom=Math.round(yardsBetween(basePosition(),target)),plannerTo=Math.round(yardsBetween(target,hole.center)),wind=active.wind
  shell.innerHTML=`
    <div class="pf-round-map"><div id="pfGoogleHoleMap" class="pf-google-map"></div><div class="pf-map-loading">Loading ParFolio satellite map…</div></div>
    <div class="round-course-name-strip"><b>${esc(active.course.name)}</b></div>
    <div class="round-map-summary pf-hole-strip"><div class="metric"><small>HOLE</small><strong>${active.index+1}</strong></div><div class="metric"><small>DISTANCE</small><strong>${center}</strong></div><div class="metric"><small>PAR</small><strong>${par}</strong></div><div class="metric"><small>ROUTE REMAINING</small><strong>${routeYards()}</strong></div><button class="pf-exit" type="button" data-pf-exit aria-label="Exit round">×</button></div>
    <div class="pf-live-yardage"><span>green center</span><b>${center}</b><span>yards ${active.position&&active.nearCourse?'live GPS':'mapped'}</span></div>
    <div class="pf-green-yardages">${front!==null?`<span>F <b>${front}</b></span>`:''}<span>C <b>${center}</b></span>${back!==null?`<span>B <b>${back}</b></span>`:''}</div>
    <div class="pf-wind">${wind?`<span class="arrow" style="transform:rotate(${Math.round(wind.direction)}deg)">↑</span>${compass(wind.direction)} ${wind.speed} mph`:'Wind —'}</div>
    <div class="pf-planner-card"><div><b>Aim ${plannerFrom} yd</b> · ${plannerTo} yd to green</div><div>Tap the map to move the planner.</div>${active.planner?'<button type="button" data-clear-planner>Reset to green</button>':''}</div>
    <div class="pf-club-chip">Suggested club · <b>${suggestedClub(plannerFrom||center)}</b></div>
    <div class="pf-map-tools"><button type="button" data-pf-gps title="Center on GPS">◎</button><button type="button" data-map-type class="${active.mapType==='roadmap'?'active':''}" title="Map / satellite">◫</button><button type="button" data-hole-jump title="Jump to hole">#</button></div>
    <div class="pf-score-panel"><div class="pf-score-summary"><span>Running <b>${playedScore()}</b></span><span>${toPar===0?'E':`${toPar>0?'+':''}${toPar}`} thru ${active.index+1}</span></div><div class="pf-score-row"><button type="button" data-score-delta="-1">−</button><div class="pf-score-value"><strong>${score}</strong><span>${score-par===0?'PAR':score-par===-1?'BIRDIE':score-par===1?'BOGEY':score-par<0?`${Math.abs(score-par)} UNDER`:`${score-par} OVER`}</span></div><button type="button" data-score-delta="1">+</button></div><div class="pf-round-actions"><button type="button" data-pf-prev ${active.index===0?'disabled':''}>← Hole</button><button type="button" class="gold" data-pf-scorecard>Scorecard</button><button type="button" data-pf-next ${active.index===active.holes-1?'disabled':''}>Hole →</button></div></div>`
  bindRoundControls(shell)
  loadGoogleMaps().then(()=>{document.querySelector('.pf-map-loading')?.remove();if(!options.keepMap)googleMap=null;drawGoogleHole()}).catch(error=>{const loading=document.querySelector('.pf-map-loading');if(loading)loading.textContent=`Google Maps unavailable: ${error.message}`})
  setTimeout(()=>window.dispatchEvent(new Event('parfolio:round-rendered')),0)
}

function showScorecard(){
  if(!active)return
  document.querySelector('.pf-scorecard-overlay')?.remove()
  const overlay=document.createElement('div');overlay.className='pf-scorecard-overlay'
  overlay.innerHTML=`<div class="pf-scorecard-card"><h2>${esc(active.course.name)}</h2><p>Live scorecard · ${active.holes} holes</p><div class="pf-scorecard-grid">${active.greens.map((hole,i)=>`<div><span>H${i+1}</span><b>${active.scores[i]??parFor(hole)}</b><span>Par ${parFor(hole)}</span></div>`).join('')}</div><button class="pf-scorecard-close" type="button">Back to map</button></div>`
  document.body.appendChild(overlay);overlay.querySelector('.pf-scorecard-close')?.addEventListener('click',()=>overlay.remove());overlay.addEventListener('click',event=>{if(event.target===overlay)overlay.remove()})
}

function jumpHole(){
  if(!active)return
  const value=window.prompt(`Jump to hole (1-${active.holes})`,String(active.index+1));if(value===null)return
  const n=Math.max(1,Math.min(active.holes,Number(value)||active.index+1));active.index=n-1;active.planner=null;active.wind=null;googleMap=null;renderRound();updateWind()
}

function bindRoundControls(shell){
  shell.querySelector('[data-pf-exit]')?.addEventListener('click',closeRound)
  shell.querySelector('[data-pf-prev]')?.addEventListener('click',()=>changeHole(-1))
  shell.querySelector('[data-pf-next]')?.addEventListener('click',()=>changeHole(1))
  shell.querySelector('[data-pf-scorecard]')?.addEventListener('click',showScorecard)
  shell.querySelector('[data-hole-jump]')?.addEventListener('click',jumpHole)
  shell.querySelector('[data-pf-gps]')?.addEventListener('click',startGps)
  shell.querySelector('[data-map-type]')?.addEventListener('click',()=>{active.mapType=active.mapType==='roadmap'?'satellite':'roadmap';renderRound({keepMap:true})})
  shell.querySelector('[data-clear-planner]')?.addEventListener('click',()=>{active.planner=null;renderRound({keepMap:true})})
  shell.querySelectorAll('[data-score-delta]').forEach(button=>button.addEventListener('click',()=>{const delta=Number(button.dataset.scoreDelta);active.scores[active.index]=Math.max(1,Math.min(15,currentScore()+delta));active.touched[active.index]=true;renderRound({keepMap:true})}))
}

function changeHole(delta){
  if(!active)return
  active.index=Math.max(0,Math.min(active.holes-1,active.index+delta));active.planner=null;active.wind=null;googleMap=null;renderRound();updateWind()
}

function startGps(){
  if(!active||!navigator.geolocation){if(active){active.gpsMessage='Location is unavailable on this device.';renderRound({keepMap:true})}return}
  if(watchId!==null)navigator.geolocation.clearWatch(watchId)
  watchId=navigator.geolocation.watchPosition(position=>{
    if(!active)return
    const coords=position.coords;active.position={lat:coords.latitude,lng:coords.longitude}
    const distance=Math.round(yardsBetween(active.position,currentHole().center));active.nearCourse=distance<=2200;active.gpsMessage=active.nearCourse?`Live GPS · accuracy about ${Math.round(coords.accuracy)} m`:'Remote view · GPS is outside the course area';renderRound({keepMap:true});updateWind()
  },()=>{if(!active)return;active.gpsMessage='Location was unavailable or denied.';active.nearCourse=false;renderRound({keepMap:true})},{enableHighAccuracy:true,timeout:15000,maximumAge:5000})
}

function closeRound(){
  if(!active)return
  const shouldFinish=window.confirm('Finish this round and send the scores to your ParFolio Mini wallet record?\n\nChoose Cancel to leave the round without signing it.')
  if(shouldFinish){finishRound();return}
  teardownRound()
}

function teardownRound(){
  if(watchId!==null&&navigator.geolocation){navigator.geolocation.clearWatch(watchId);watchId=null}
  try{windAbort?.abort?.()}catch{}
  clearGoogleOverlays();googleMap=null;document.querySelector('.pf-scorecard-overlay')?.remove();document.querySelector('.pf-round-shell')?.remove();active=null
}

function finishRound(){
  if(!active)return
  const score=totalScore(),par=totalPar(),holes=active.holes,birds=birdies(),course=active.course.name
  const form=document.querySelector('#roundForm')
  if(form){
    const values={course,holes:String(holes),score:String(score),par:String(par),birdies:String(birds)}
    Object.entries(values).forEach(([name,value])=>{const field=form.elements.namedItem(name);if(field){field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}))}})
    const date=form.elements.namedItem('date');if(date&&!date.value)date.value=new Date().toISOString().slice(0,10)
  }
  teardownRound();const message=document.querySelector('#formMessage');if(message)message.textContent=`Round complete: ${score} on par ${par} at ${course}. Sign it with your Nimiq wallet to save the record.`
  form?.scrollIntoView({behavior:'smooth',block:'start'});const submit=form?.querySelector('button[type="submit"]');if(submit&&!submit.disabled)setTimeout(()=>form.requestSubmit(),450)
}

async function startRound(course){
  if(!course?.id)return
  ensureStyles();const loading=document.createElement('div');loading.className='pf-round-loading';loading.innerHTML=`<div><strong>Preparing ${esc(course.name)}</strong><p>Loading ParFolio’s validated GPS geometry and full-screen active round.</p></div>`;document.body.appendChild(loading)
  try{
    const payload=await rpc('parfolio_course_payload',{p_course_id:course.id}),{holes,greens}=validatePayload(payload,course)
    active={course,holes,greens,index:0,scores:greens.map(h=>parFor(h)),touched:Array(holes).fill(false),position:null,nearCourse:false,gpsMessage:'',planner:null,mapType:'satellite',wind:null}
    loading.remove();renderRound();updateWind()
  }catch(error){loading.innerHTML=`<div><strong>Course could not start</strong><p>${esc(error?.message||'GPS geometry could not be loaded.')}</p><button type="button">Back to courses</button></div>`;loading.querySelector('button')?.addEventListener('click',()=>loading.remove())}
}

window.addEventListener('parfolio:course-selected',event=>startRound(event.detail))
document.addEventListener('click',event=>{const button=event.target.closest?.('[data-use-pf-course]');if(!button)return;const row=button.closest('.pf-mini-catalog-result,.course-result');const name=row?.querySelector('b')?.textContent?.trim()||'Golf Course';const meta=row?.querySelector('small')?.textContent||'';const location=meta.split('·')[0].trim();const parts=location.split(',').map(value=>value.trim());setTimeout(()=>startRound({id:button.dataset.usePfCourse,name,city:parts[0]||'',state:(parts[1]||'CA').split(/\s+/)[0],holes:18}),0)})
ensureStyles()
