/* ParFolio Mini — read-only California GPS-ready course search.
   Reads only ParFolio's public course-reference RPCs. It never reads or writes
   ParFolio/ATG users, profiles, rounds, scores, chat, or private app data. */
const PARFOLIO_SUPABASE_URL='https://unsysuuhykdmbsasdhzg.supabase.co'
const PARFOLIO_PUBLISHABLE_KEY='sb_publishable_lNH7z0PA6wVEztP3Bp4IUQ_xxBa38_f'
const STATE='CA'
const PAGE_SIZE=500
const MAX_RESULTS=25

let catalogPromise=null
let nearbyOrigin=null

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ')
const validCoord=(lat,lng)=>Number.isFinite(Number(lat))&&Number.isFinite(Number(lng))&&Math.abs(Number(lat))<=90&&Math.abs(Number(lng))<=180&&!(Number(lat)===0&&Number(lng)===0)

function distanceMiles(aLat,aLng,bLat,bLng){
  const rad=d=>Number(d)*Math.PI/180
  const dLat=rad(Number(bLat)-Number(aLat)),dLng=rad(Number(bLng)-Number(aLng))
  const a=Math.sin(dLat/2)**2+Math.cos(rad(aLat))*Math.cos(rad(bLat))*Math.sin(dLng/2)**2
  return 3958.8*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
}

async function rpc(name,body){
  const response=await fetch(`${PARFOLIO_SUPABASE_URL}/rest/v1/rpc/${name}`,{
    method:'POST',
    headers:{
      apikey:PARFOLIO_PUBLISHABLE_KEY,
      Authorization:`Bearer ${PARFOLIO_PUBLISHABLE_KEY}`,
      'Content-Type':'application/json',
    },
    body:JSON.stringify(body),
  })
  if(!response.ok)throw new Error(`ParFolio course catalog request failed (${response.status})`)
  return response.json()
}

async function loadGpsReadyCatalog(){
  if(catalogPromise)return catalogPromise
  catalogPromise=(async()=>{
    const rows=[]
    for(let offset=0;offset<=5000;offset+=PAGE_SIZE){
      const page=await rpc('parfolio_course_catalog_page',{p_state_code:STATE,p_offset:offset,p_limit:PAGE_SIZE})
      const batch=Array.isArray(page)?page:[]
      rows.push(...batch)
      if(batch.length<PAGE_SIZE)break
    }
    return rows
      .filter(row=>String(row?.mapping_class||'')==='gps_ready')
      .map(row=>({
        id:String(row.catalog_id||row.source_id||row.name||''),
        name:String(row.name||'').trim(),
        city:String(row.city||'').trim(),
        state:String(row.state_code||STATE).trim(),
        postal:String(row.postal_code||'').trim(),
        address:String(row.address||'').trim(),
        lat:Number(row.lat),
        lng:Number(row.lng),
        holes:Number(row.holes)||18,
        mappedHoles:Number(row.mapped_holes)||Number(row.holes)||18,
      }))
      .filter(row=>row.name)
      .sort((a,b)=>a.name.localeCompare(b.name))
  })().catch(error=>{catalogPromise=null;throw error})
  return catalogPromise
}

function searchScore(course,query){
  const q=norm(query)
  if(!q)return 0
  const name=norm(course.name),city=norm(course.city),postal=norm(course.postal),address=norm(course.address)
  const terms=q.split(' ').filter(Boolean)
  const all=`${name} ${city} ${postal} ${address}`
  if(!terms.every(term=>all.includes(term)))return -1
  let score=0
  if(name===q)score+=10000
  else if(name.startsWith(q))score+=7000
  else if(name.includes(q))score+=5000
  if(city===q)score+=3500
  if(postal===q)score+=3500
  if(city.startsWith(q)||postal.startsWith(q))score+=1800
  for(const term of terms){if(name.includes(term))score+=250;else if(city.includes(term)||postal.includes(term))score+=100}
  return score
}

function mapLink(course){
  return validCoord(course.lat,course.lng)?`https://www.openstreetmap.org/?mlat=${course.lat}&mlon=${course.lng}#map=16/${course.lat}/${course.lng}`:''
}

function renderRows(container,courses){
  container.innerHTML=courses.length?courses.map(course=>{
    const miles=Number.isFinite(course.distance)?` · ${course.distance<10?course.distance.toFixed(1):Math.round(course.distance)} mi`:''
    const location=[course.city,course.state].filter(Boolean).join(', ')+(course.postal?` ${course.postal}`:'')
    const map=mapLink(course)
    return `<article class="course-result pf-mini-catalog-result" data-course-id="${esc(course.id)}">
      <div><b>${esc(course.name)}</b><small>${esc(location||'California')}${miles} · GPS Ready · ${course.mappedHoles}/${course.holes} holes mapped</small></div>
      <div class="course-result-actions">
        <button type="button" data-use-pf-course="${esc(course.id)}">Use course</button>
        ${map?`<a href="${map}" target="_blank" rel="noopener noreferrer">Map ↗</a>`:''}
      </div>
    </article>`
  }).join(''):'<p class="helper">No GPS-ready California courses match that search.</p>'
}

function ensureStyles(){
  if(document.getElementById('pf-mini-catalog-search-style'))return
  const style=document.createElement('style')
  style.id='pf-mini-catalog-search-style'
  style.textContent=`
    .pf-mini-search-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px;margin-top:12px}
    .pf-mini-search-row input{width:100%;min-width:0;min-height:46px;border:1px solid rgba(255,255,255,.16);border-radius:13px;background:rgba(1,18,13,.72);color:#f8f7ef;padding:0 14px;font-size:16px;outline:none;-webkit-user-select:text;user-select:text}
    .pf-mini-search-row input:focus{border-color:rgba(233,204,113,.7);box-shadow:0 0 0 3px rgba(233,204,113,.08)}
    .pf-mini-search-row button{min-height:46px;border:1px solid rgba(233,204,113,.28);border-radius:13px;background:rgba(233,204,113,.11);color:#f2d77b;padding:0 13px;font-weight:800;white-space:nowrap}
    .pf-mini-catalog-summary{margin:9px 0 0;color:#9fb0a8;font-size:.75rem;line-height:1.45}
    @media(max-width:560px){.pf-mini-search-row{grid-template-columns:1fr}.pf-mini-search-row button{width:100%}}
  `
  document.head.appendChild(style)
}

function decorateFinder(finder){
  if(!finder||finder.dataset.parfolioCatalogSearch==='1')return
  finder.dataset.parfolioCatalogSearch='1'
  finder.innerHTML=`
    <p class="eyebrow">California course finder · ParFolio GPS Ready</p>
    <p class="course-finder-note">Search by course name, city, or ZIP. Results come from ParFolio's validated California GPS catalog.</p>
    <div class="pf-mini-search-row">
      <input id="pfMiniCourseSearch" type="search" inputmode="search" autocomplete="off" spellcheck="false" placeholder="Search course, city or ZIP" aria-label="Search GPS-ready California golf courses" />
      <button id="pfMiniNearby" type="button">Near me</button>
    </div>
    <p id="courseStatus" class="helper" role="status" aria-live="polite">Loading GPS-ready California courses…</p>
    <div id="courseResults" class="course-results"></div>
    <p class="pf-mini-catalog-summary">Course-reference data is read only. ParFolio Mini does not access ParFolio or ATG player accounts, rounds, scores, profiles, or chat.</p>
  `

  const input=finder.querySelector('#pfMiniCourseSearch')
  const status=finder.querySelector('#courseStatus')
  const results=finder.querySelector('#courseResults')
  const near=finder.querySelector('#pfMiniNearby')
  let localCatalog=[]

  function showQuery(){
    const q=input.value.trim()
    nearbyOrigin=null
    if(!q){renderRows(results,[]);status.textContent=`${localCatalog.length} GPS-ready California courses available. Start typing a course, city, or ZIP.`;return}
    const matches=localCatalog.map(course=>({course,score:searchScore(course,q)})).filter(x=>x.score>=0).sort((a,b)=>b.score-a.score||a.course.name.localeCompare(b.course.name)).slice(0,MAX_RESULTS).map(x=>x.course)
    renderRows(results,matches)
    status.textContent=matches.length?`Showing ${matches.length}${matches.length===MAX_RESULTS?' top':''} match${matches.length===1?'':'es'} for “${q}”.`:`No GPS-ready California courses match “${q}”.`
  }

  input.addEventListener('input',showQuery)
  input.addEventListener('search',showQuery)

  near.addEventListener('click',()=>{
    if(!navigator.geolocation){status.textContent='Location is unavailable on this device. Search by course, city, or ZIP instead.';return}
    status.textContent='Finding GPS-ready courses near you…'
    navigator.geolocation.getCurrentPosition(({coords})=>{
      nearbyOrigin={lat:coords.latitude,lng:coords.longitude}
      input.value=''
      const nearest=localCatalog
        .filter(course=>validCoord(course.lat,course.lng))
        .map(course=>({...course,distance:distanceMiles(nearbyOrigin.lat,nearbyOrigin.lng,course.lat,course.lng)}))
        .sort((a,b)=>a.distance-b.distance)
        .slice(0,MAX_RESULTS)
      renderRows(results,nearest)
      status.textContent=nearest.length?`Showing the ${nearest.length} nearest GPS-ready California courses.`:'No GPS-ready California course locations are available.'
    },()=>{status.textContent='Location was unavailable or denied. Search by course, city, or ZIP instead.'},{enableHighAccuracy:false,timeout:12000,maximumAge:60000})
  })

  results.addEventListener('click',event=>{
    const button=event.target.closest('[data-use-pf-course]')
    if(!button)return
    const id=button.dataset.usePfCourse
    const course=localCatalog.find(item=>item.id===id)
    if(!course)return
    const roundInput=document.querySelector('input[name="course"]')
    if(roundInput){
      roundInput.value=course.name
      roundInput.dispatchEvent(new Event('input',{bubbles:true}))
      roundInput.dispatchEvent(new Event('change',{bubbles:true}))
      status.textContent=`${course.name} added to your round · GPS Ready.`
      roundInput.scrollIntoView({behavior:'smooth',block:'center'})
      roundInput.focus({preventScroll:true})
    }
  })

  loadGpsReadyCatalog().then(catalog=>{
    localCatalog=catalog
    status.textContent=`${catalog.length} GPS-ready California courses available. Start typing a course, city, or ZIP.`
  }).catch(error=>{
    console.warn('ParFolio Mini catalog search unavailable',error)
    status.textContent='The ParFolio course catalog is temporarily unavailable. You can still enter the course manually below.'
  })
}

function install(){
  ensureStyles()
  document.querySelectorAll('.ca-course-finder').forEach(decorateFinder)
}

let queued=false
function scheduleInstall(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;install()})}

ensureStyles()
new MutationObserver(scheduleInstall).observe(document.getElementById('app')||document.body,{childList:true,subtree:true})
install()
setTimeout(install,250)
