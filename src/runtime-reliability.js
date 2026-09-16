const PROFILE_KEY='parfolio-mini:profile-v1'
const PARFOLIO_SUPABASE_URL='https://unsysuuhykdmbsasdhzg.supabase.co'
const PARFOLIO_PUBLISHABLE_KEY='sb_publishable_lNH7z0PA6wVEztP3Bp4IUQ_xxBa38_f'
const PAGE_SIZE=500
const MAX_RESULTS=25
let runtimeCatalogPromise=null

const pfNorm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ')
const pfEsc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const pfValidCoord=(lat,lng)=>Number.isFinite(Number(lat))&&Number.isFinite(Number(lng))&&Math.abs(Number(lat))<=90&&Math.abs(Number(lng))<=180&&!(Number(lat)===0&&Number(lng)===0)
function pfDistanceMiles(aLat,aLng,bLat,bLng){const rad=d=>Number(d)*Math.PI/180,dLat=rad(Number(bLat)-Number(aLat)),dLng=rad(Number(bLng)-Number(aLng));const a=Math.sin(dLat/2)**2+Math.cos(rad(aLat))*Math.cos(rad(bLat))*Math.sin(dLng/2)**2;return 3958.8*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))}

function readProfileFromUi(){
  const data={}
  document.querySelectorAll('.pf-my-hub [data-pf-profile]').forEach(input=>{data[input.dataset.pfProfile]=input.value.trim()})
  const existing=(()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')}catch{return {}}})()
  return {...existing,...data,updatedAt:new Date().toISOString()}
}
function setProfileStatus(saved,message='Profile saved.'){
  const hub=document.querySelector('.pf-my-hub');if(!hub)return
  const status=hub.querySelector('[data-profile-status]');if(status)status.textContent=message
  const rows=[...hub.querySelectorAll('.pf-status-row')]
  const profileRow=rows.find(row=>row.querySelector('span')?.textContent?.trim()==='Player profile')
  const value=profileRow?.querySelector('b');if(value)value.textContent=saved?.name?'Ready':'Needed'
  const badge=hub.querySelector('.pf-signin-badge');if(badge&&saved?.name){badge.textContent=document.querySelector('.wallet-chip.connected')?'✓ Signed in with Nimiq wallet':'Profile saved · connect Nimiq wallet';badge.classList.toggle('ready',Boolean(document.querySelector('.wallet-chip.connected')))}
}
function saveProfileReliably(){
  const data=readProfileFromUi()
  try{localStorage.setItem(PROFILE_KEY,JSON.stringify(data))}catch(error){setProfileStatus(data,'Could not save this profile on this device. Check browser storage settings.');console.warn('ParFolio Mini profile save failed',error);return false}
  setProfileStatus(data,data.name?'Profile saved. Your Play readiness is updated.':'Add your name to complete your profile.')
  window.dispatchEvent(new CustomEvent('parfolio:profile-updated',{detail:data}))
  return true
}

document.addEventListener('click',event=>{
  if(event.target.closest?.('[data-save-profile]')){
    saveProfileReliably()
    setTimeout(()=>{const saved=(()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')}catch{return null}})();setProfileStatus(saved,saved?.name?'Profile saved. Your Play readiness is updated.':'Add your name to complete your profile.')},250)
  }
},true)

document.addEventListener('change',event=>{
  if(event.target.matches?.('.pf-my-hub [data-pf-profile]')){
    const status=document.querySelector('.pf-my-hub [data-profile-status]');if(status)status.textContent='Unsaved changes · tap Save profile.'
  }
},true)

async function runtimeRpc(name,body){
  const response=await fetch(`${PARFOLIO_SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:PARFOLIO_PUBLISHABLE_KEY,Authorization:`Bearer ${PARFOLIO_PUBLISHABLE_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(body)})
  if(!response.ok)throw new Error(`Course catalog request failed (${response.status})`)
  return response.json()
}
async function runtimeCatalog(){
  if(runtimeCatalogPromise)return runtimeCatalogPromise
  runtimeCatalogPromise=(async()=>{const rows=[];for(let offset=0;offset<=5000;offset+=PAGE_SIZE){const page=await runtimeRpc('parfolio_course_catalog_page',{p_state_code:'CA',p_offset:offset,p_limit:PAGE_SIZE});const batch=Array.isArray(page)?page:[];rows.push(...batch);if(batch.length<PAGE_SIZE)break}return rows.filter(r=>String(r?.mapping_class||'')==='gps_ready').map(r=>({id:String(r.catalog_id||r.source_id||r.name||''),name:String(r.name||'').trim(),city:String(r.city||'').trim(),state:String(r.state_code||'CA').trim(),postal:String(r.postal_code||'').trim(),address:String(r.address||'').trim(),lat:Number(r.lat),lng:Number(r.lng),holes:Number(r.holes)||18,mappedHoles:Number(r.mapped_holes)||Number(r.holes)||18})).filter(r=>r.name)})().catch(error=>{runtimeCatalogPromise=null;throw error})
  return runtimeCatalogPromise
}
function runtimeScore(course,query){
  const q=pfNorm(query);if(!q)return 0
  const fields={name:pfNorm(course.name),city:pfNorm(course.city),state:pfNorm(course.state),postal:pfNorm(course.postal),address:pfNorm(course.address)}
  const all=Object.values(fields).join(' '),terms=q.split(' ').filter(Boolean);let score=0,hits=0
  if(fields.name===q)score+=10000;else if(fields.name.startsWith(q))score+=6500;else if(fields.name.includes(q))score+=4300
  if(fields.city===q||fields.state===q||fields.postal===q)score+=3600
  if(all.includes(q))score+=2300
  for(const term of terms){if(all.includes(term)){hits++;score+=fields.name.includes(term)?300:140}}
  if(terms.length>1&&hits===terms.length)score+=1400
  return score
}
function runtimeRows(container,courses){
  container.innerHTML=courses.length?courses.map(c=>{const miles=Number.isFinite(c.distance)?` · ${c.distance<10?c.distance.toFixed(1):Math.round(c.distance)} mi`:'';const loc=[c.city,c.state].filter(Boolean).join(', ')+(c.postal?` ${c.postal}`:'');return `<article class="course-result pf-mini-catalog-result" data-course-id="${pfEsc(c.id)}"><div><b>${pfEsc(c.name)}</b><small>${pfEsc(loc||'California')}${miles} · GPS Ready · ${c.mappedHoles}/${c.holes} holes mapped</small></div><div class="course-result-actions"><button type="button" data-use-pf-course="${pfEsc(c.id)}">Use course</button></div></article>`}).join(''):'<p class="helper">No GPS-ready California courses match that search.</p>'
}
async function bindCourseFinder(){
  const finder=document.querySelector('.ca-course-finder');if(!finder)return false
  const input=finder.querySelector('#pfMiniCourseSearch'),near=finder.querySelector('#pfMiniNearby'),status=finder.querySelector('#courseStatus'),results=finder.querySelector('#courseResults')
  if(!input||!near||!status||!results)return false
  if(finder.dataset.pfRuntimeReliable==='1')return true
  finder.dataset.pfRuntimeReliable='1'
  let catalog=[]
  status.textContent='Loading GPS-ready California courses…'
  try{catalog=await runtimeCatalog();status.textContent=`${catalog.length} GPS-ready California courses available. Search course, city, state, ZIP, or area.`}catch(error){console.warn('Runtime course catalog unavailable',error);status.textContent='Course catalog could not load. Tap here to retry or reopen Play.';finder.dataset.pfRuntimeReliable='0';return false}

  const runSearch=()=>{const q=input.value.trim();if(!q){runtimeRows(results,[]);status.textContent=`${catalog.length} GPS-ready California courses available.`;return}const matches=catalog.map(course=>({course,score:runtimeScore(course,q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.course.name.localeCompare(b.course.name)).slice(0,MAX_RESULTS).map(x=>x.course);runtimeRows(results,matches);status.textContent=matches.length?`Showing ${matches.length} match${matches.length===1?'':'es'} for “${q}”.`:`No GPS-ready California courses match “${q}”. Try a course name, nearby city, or ZIP.`}
  input.addEventListener('input',runSearch,{capture:true})
  input.addEventListener('search',runSearch,{capture:true})
  near.addEventListener('click',()=>{if(!navigator.geolocation){status.textContent='Location is unavailable in this browser. Search by city or ZIP instead.';return}near.disabled=true;near.textContent='Locating…';status.textContent='Requesting your location…';navigator.geolocation.getCurrentPosition(({coords})=>{input.value='';const nearest=catalog.filter(c=>pfValidCoord(c.lat,c.lng)).map(c=>({...c,distance:pfDistanceMiles(coords.latitude,coords.longitude,c.lat,c.lng)})).sort((a,b)=>a.distance-b.distance).slice(0,MAX_RESULTS);runtimeRows(results,nearest);status.textContent=nearest.length?`Showing ${nearest.length} nearest GPS-ready California courses.`:'Location found, but no GPS-ready course coordinates were available.';near.disabled=false;near.textContent='Near me'},error=>{status.textContent=error?.code===1?'Location permission was denied. Allow location for ParFolio Mini, then try again.':'Location could not be determined. Search by city or ZIP instead.';near.disabled=false;near.textContent='Near me'},{enableHighAccuracy:true,timeout:15000,maximumAge:30000})},{capture:true})
  return true
}

function ensureRuntimeWiring(){
  bindCourseFinder()
  const saved=(()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')}catch{return null}})();if(saved)setProfileStatus(saved,saved.name?'Profile saved.':'Add your name to complete your profile.')
}

document.addEventListener('click',event=>{if(event.target.closest?.('[data-page="play"],[data-page="wallet"]'))setTimeout(ensureRuntimeWiring,80)},true)
window.addEventListener('popstate',()=>setTimeout(ensureRuntimeWiring,80))
window.addEventListener('hashchange',()=>setTimeout(ensureRuntimeWiring,80))
window.addEventListener('parfolio:profile-updated',()=>setTimeout(ensureRuntimeWiring,50))
let attempts=0;const startup=setInterval(()=>{attempts++;ensureRuntimeWiring();if(attempts>=50)clearInterval(startup)},120)
ensureRuntimeWiring()
