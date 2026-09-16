/* ParFolio Mini — ParFolio-style California GPS-ready course discovery.
   Read-only against ParFolio public course-reference RPCs. */
const PARFOLIO_SUPABASE_URL='https://unsysuuhykdmbsasdhzg.supabase.co'
const PARFOLIO_PUBLISHABLE_KEY='sb_publishable_lNH7z0PA6wVEztP3Bp4IUQ_xxBa38_f'
const STATE='CA'
const PAGE_SIZE=500
const MAX_RESULTS=25
const SUGGESTION_LIMIT=6
const STOP=new Set(['golf','course','courses','club','clubs','the','at','of','and','near','around','in','me','country'])

let catalogPromise=null

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ').replace(/\bst[.]?\b/g,'saint').replace(/\bmt[.]?\b/g,'mount').replace(/\bgc\b/g,'golf club').replace(/\bcc\b/g,'country club').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ')
const tokens=value=>norm(value).split(' ').filter(Boolean)
const validCoord=(lat,lng)=>Number.isFinite(Number(lat))&&Number.isFinite(Number(lng))&&Math.abs(Number(lat))<=90&&Math.abs(Number(lng))<=180&&!(Number(lat)===0&&Number(lng)===0)

function distanceMiles(aLat,aLng,bLat,bLng){
  const rad=d=>Number(d)*Math.PI/180
  const dLat=rad(Number(bLat)-Number(aLat)),dLng=rad(Number(bLng)-Number(aLng))
  const a=Math.sin(dLat/2)**2+Math.cos(rad(aLat))*Math.cos(rad(bLat))*Math.sin(dLng/2)**2
  return 3958.8*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
}

async function rpc(name,body){
  const response=await fetch(`${PARFOLIO_SUPABASE_URL}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:PARFOLIO_PUBLISHABLE_KEY,Authorization:`Bearer ${PARFOLIO_PUBLISHABLE_KEY}`,'Content-Type':'application/json'},body:JSON.stringify(body)})
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
    return rows.filter(row=>String(row?.mapping_class||'')==='gps_ready').map(row=>({
      id:String(row.catalog_id||row.source_id||row.name||''),name:String(row.name||'').trim(),city:String(row.city||'').trim(),state:String(row.state_code||STATE).trim(),postal:String(row.postal_code||'').trim(),address:String(row.address||'').trim(),lat:Number(row.lat),lng:Number(row.lng),holes:Number(row.holes)||18,mappedHoles:Number(row.mapped_holes)||Number(row.holes)||18
    })).filter(row=>row.name).sort((a,b)=>a.name.localeCompare(b.name))
  })().catch(error=>{catalogPromise=null;throw error})
  return catalogPromise
}

function levenshtein(a,b){
  a=String(a||'');b=String(b||'');if(a===b)return 0;if(!a.length)return b.length;if(!b.length)return a.length
  const prev=Array.from({length:b.length+1},(_,i)=>i),cur=new Array(b.length+1)
  for(let i=1;i<=a.length;i++){cur[0]=i;for(let j=1;j<=b.length;j++)cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));for(let j=0;j<=b.length;j++)prev[j]=cur[j]}
  return prev[b.length]
}

function fuzzyTokenScore(qt,fieldTokens){
  let best=0
  for(const ft of fieldTokens){
    if(ft===qt)best=Math.max(best,80)
    else if(ft.startsWith(qt)||qt.startsWith(ft))best=Math.max(best,55)
    else if(qt.length>=4&&ft.length>=4){const d=levenshtein(qt,ft),max=Math.max(qt.length,ft.length);if(d<=1)best=Math.max(best,48);else if(d===2&&max>=6)best=Math.max(best,30)}
  }
  return best
}

function searchInfo(course,query){
  const q=norm(query);if(!q)return{match:true,relevance:0}
  const name=norm(course.name),city=norm(course.city),state=norm(course.state),postal=norm(course.postal),address=norm(course.address)
  const all=[name,city,state,postal,address].filter(Boolean).join(' ')
  const qTokens=tokens(q).filter(t=>!['near','around','in','me'].includes(t))
  let relevance=0,tokenHits=0
  if(name===q)relevance+=10000
  if(name.startsWith(q))relevance+=6500
  if(name.includes(q))relevance+=4300
  if(city===q||state===q||postal===q)relevance+=3600
  if([city,state,postal].some(v=>v&&q.includes(v)))relevance+=1600
  if(all.includes(q))relevance+=2300
  const fieldTokens=tokens(all),nameTokens=tokens(name)
  for(const qt of qTokens){
    if(STOP.has(qt))continue
    let score=fuzzyTokenScore(qt,nameTokens);if(!score)score=Math.round(fuzzyTokenScore(qt,fieldTokens)*.55)
    if(score){relevance+=score;tokenHits++}
  }
  const meaningful=qTokens.filter(t=>!STOP.has(t)&&!/^\d+$/.test(t)).length
  if(meaningful>1&&tokenHits===meaningful)relevance+=1200+meaningful*100
  return{match:relevance>0,relevance}
}

function mapLink(course){return validCoord(course.lat,course.lng)?`https://www.openstreetmap.org/?mlat=${course.lat}&mlon=${course.lng}#map=16/${course.lat}/${course.lng}`:''}

function renderRows(container,courses){
  container.innerHTML=courses.length?courses.map(course=>{
    const miles=Number.isFinite(course.distance)?` · ${course.distance<10?course.distance.toFixed(1):Math.round(course.distance)} mi`:''
    const location=[course.city,course.state].filter(Boolean).join(', ')+(course.postal?` ${course.postal}`:'')
    const map=mapLink(course)
    return `<article class="course-result pf-mini-catalog-result" data-course-id="${esc(course.id)}"><div><b>${esc(course.name)}</b><small>${esc(location||'California')}${miles} · GPS Ready · ${course.mappedHoles}/${course.holes} holes mapped</small></div><div class="course-result-actions"><button type="button" data-use-pf-course="${esc(course.id)}">Use course</button>${map?`<a href="${map}" target="_blank" rel="noopener noreferrer">Map ↗</a>`:''}</div></article>`
  }).join(''):'<p class="helper">No GPS-ready California courses match that search.</p>'
}

function ensureStyles(){
  if(document.getElementById('pf-mini-catalog-search-style'))return
  const style=document.createElement('style');style.id='pf-mini-catalog-search-style';style.textContent=`
  .pf-mini-search-wrap{position:relative}.pf-mini-search-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px;margin-top:12px}.pf-mini-search-row input{width:100%;min-width:0;min-height:46px;border:1px solid rgba(255,255,255,.16);border-radius:13px;background:rgba(1,18,13,.72);color:#f8f7ef;padding:0 14px;font-size:16px;outline:none}.pf-mini-search-row input:focus{border-color:rgba(233,204,113,.7);box-shadow:0 0 0 3px rgba(233,204,113,.08)}.pf-mini-search-row button{min-height:46px;border:1px solid rgba(233,204,113,.28);border-radius:13px;background:rgba(233,204,113,.11);color:#f2d77b;padding:0 13px;font-weight:800;white-space:nowrap}.pf-mini-search-row button[aria-busy="true"]{opacity:.65}.pf-mini-suggestions{position:absolute;z-index:50;left:0;right:0;top:52px;background:#08271e;border:1px solid rgba(239,211,117,.2);border-radius:14px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.42)}.pf-mini-suggestions.hidden{display:none}.pf-mini-suggestions button{width:100%;display:flex;justify-content:space-between;gap:10px;padding:11px 12px;border:0;border-bottom:1px solid rgba(255,255,255,.07);background:transparent;color:#fff;text-align:left}.pf-mini-suggestions button:last-child{border-bottom:0}.pf-mini-suggestions b{display:block}.pf-mini-suggestions small{display:block;color:#9fb0a8;margin-top:2px}.pf-mini-catalog-summary{margin:9px 0 0;color:#9fb0a8;font-size:.75rem;line-height:1.45}@media(max-width:560px){.pf-mini-search-row{grid-template-columns:1fr auto}.pf-mini-search-row button{padding:0 11px}.pf-mini-suggestions{top:52px}}
  `;document.head.appendChild(style)
}

function decorateFinder(finder){
  if(!finder||finder.dataset.parfolioCatalogSearch==='2')return
  finder.dataset.parfolioCatalogSearch='2'
  finder.innerHTML=`<p class="eyebrow">California course finder · ParFolio GPS Ready</p><p class="course-finder-note">Search the same way as ParFolio: course name, city, state, ZIP, or area.</p><div class="pf-mini-search-wrap"><div class="pf-mini-search-row"><input id="pfMiniCourseSearch" type="search" inputmode="search" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Search course, city, ZIP or area" aria-label="Search GPS-ready California golf courses"><button id="pfMiniNearby" type="button">Near me</button></div><div class="pf-mini-suggestions hidden" id="pfMiniSuggestions"></div></div><p id="courseStatus" class="helper" role="status" aria-live="polite">Loading GPS-ready California courses…</p><div id="courseResults" class="course-results"></div><p class="pf-mini-catalog-summary">GPS-ready course-reference data only. Mini does not read ParFolio player accounts, rounds, scores, profiles, or chat.</p>`

  const input=finder.querySelector('#pfMiniCourseSearch'),status=finder.querySelector('#courseStatus'),results=finder.querySelector('#courseResults'),near=finder.querySelector('#pfMiniNearby'),suggestions=finder.querySelector('#pfMiniSuggestions')
  let localCatalog=[],timer=null

  function ranked(q,limit=MAX_RESULTS){return localCatalog.map(course=>({course,...searchInfo(course,q)})).filter(x=>x.match).sort((a,b)=>b.relevance-a.relevance||a.course.name.localeCompare(b.course.name)).slice(0,limit).map(x=>x.course)}
  function hideSuggestions(){suggestions.classList.add('hidden')}
  function renderSuggestions(q){
    if(norm(q).length<2){hideSuggestions();return}
    const rows=ranked(q,SUGGESTION_LIMIT);suggestions.innerHTML=rows.map(c=>`<button type="button" data-suggest-id="${esc(c.id)}"><span><b>${esc(c.name)}</b><small>${esc([c.city,c.state,c.postal].filter(Boolean).join(' '))}</small></span><small>GPS Ready</small></button>`).join('');suggestions.classList.toggle('hidden',!rows.length)
  }
  function showQuery(){
    const q=input.value.trim();if(!q){renderRows(results,[]);hideSuggestions();status.textContent=`${localCatalog.length} GPS-ready California courses available. Search a course, city, state, ZIP, or area.`;return}
    const matches=ranked(q);renderRows(results,matches);renderSuggestions(q);status.textContent=matches.length?`Showing ${matches.length}${matches.length===MAX_RESULTS?' top':''} match${matches.length===1?'':'es'} for “${q}”.`:`No GPS-ready California courses match “${q}”. Try a nearby city, ZIP, or course name.`
  }
  input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(showQuery,70)})
  input.addEventListener('search',showQuery)
  input.addEventListener('focus',()=>renderSuggestions(input.value))
  input.addEventListener('keydown',e=>{if(e.key==='Escape')hideSuggestions()})
  suggestions.addEventListener('click',e=>{const b=e.target.closest('[data-suggest-id]');if(!b)return;const c=localCatalog.find(x=>x.id===b.dataset.suggestId);if(!c)return;input.value=c.name;hideSuggestions();renderRows(results,[c]);status.textContent=`${c.name} · ${[c.city,c.state].filter(Boolean).join(', ')} · GPS Ready.`})

  near.addEventListener('click',()=>{
    if(!navigator.geolocation){status.textContent='This browser cannot provide location. Search by city or ZIP instead.';return}
    near.disabled=true;near.setAttribute('aria-busy','true');near.textContent='Locating…';status.textContent='Requesting your location…'
    navigator.geolocation.getCurrentPosition(({coords})=>{
      input.value='';hideSuggestions();const nearest=localCatalog.filter(c=>validCoord(c.lat,c.lng)).map(c=>({...c,distance:distanceMiles(coords.latitude,coords.longitude,c.lat,c.lng)})).sort((a,b)=>a.distance-b.distance).slice(0,MAX_RESULTS);renderRows(results,nearest);status.textContent=nearest.length?`Showing ${nearest.length} GPS-ready courses nearest your current location.`:'Your location was found, but no GPS-ready California course coordinates were available.';near.disabled=false;near.removeAttribute('aria-busy');near.textContent='Near me'
    },error=>{
      const reason=error?.code===1?'Location permission was denied. Allow location for this app, then tap Near me again.':error?.code===2?'Your location could not be determined. Try again or search by city/ZIP.':'Location timed out. Try again or search by city/ZIP.';status.textContent=reason;near.disabled=false;near.removeAttribute('aria-busy');near.textContent='Near me'
    },{enableHighAccuracy:true,timeout:15000,maximumAge:30000})
  })

  loadGpsReadyCatalog().then(catalog=>{localCatalog=catalog;status.textContent=`${catalog.length} GPS-ready California courses available. Search course, city, state, ZIP, or area.`}).catch(error=>{console.warn('ParFolio Mini catalog search unavailable',error);status.textContent='The ParFolio GPS course catalog is temporarily unavailable. Please retry.'})
}

function install(){ensureStyles();document.querySelectorAll('.ca-course-finder').forEach(decorateFinder)}
ensureStyles();install();let tries=0;const boot=setInterval(()=>{tries++;install();if(document.querySelector('.ca-course-finder[data-parfolio-catalog-search="2"]')||tries>40)clearInterval(boot)},120)
