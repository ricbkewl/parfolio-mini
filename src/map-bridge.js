/* ParFolio Mini map bridge.
   Reuses ParFolio's production Google Maps origin so Mini does not create a
   second map stack or require broader browser-key referrer permissions. */
const PARFOLIO_MAP_ORIGIN='https://parfolio-iota.vercel.app'
let lastPayload=null

const originalFetch=window.fetch.bind(window)
window.fetch=async(...args)=>{
  const response=await originalFetch(...args)
  try{
    const url=String(args[0]?.url||args[0]||'')
    if(url.includes('/rpc/parfolio_course_payload')){
      const data=await response.clone().json()
      if(data&&Array.isArray(data.greens))lastPayload=data
    }
  }catch{}
  return response
}

const valid=value=>value&&Number.isFinite(Number(value.lat))&&Number.isFinite(Number(value.lng))
function holeNumber(){
  const text=document.querySelector('.pf-hole-strip strong')?.textContent||''
  const match=text.match(/(\d+)/)
  return match?Number(match[1]):1
}
function addPoint(params,prefix,point){
  if(!valid(point))return
  params.set(`${prefix}Lat`,String(Number(point.lat)))
  params.set(`${prefix}Lng`,String(Number(point.lng)))
}
function mapUrl(hole){
  const params=new URLSearchParams()
  addPoint(params,'tee',hole.tee)
  addPoint(params,'aim1',hole.aim1)
  addPoint(params,'aim2',hole.aim2)
  addPoint(params,'front',hole.front)
  addPoint(params,'center',hole.center)
  addPoint(params,'back',hole.back)
  return `${PARFOLIO_MAP_ORIGIN}/mini-hole-map.html?${params}`
}
function installBridge(){
  const container=document.querySelector('#pfGoogleHoleMap')
  if(!container||container.dataset.parfolioBridge==='1'||!lastPayload)return
  const number=holeNumber()
  const hole=lastPayload.greens.find(item=>Number(item?.hole)===number)
  if(!hole||!valid(hole.tee)||!valid(hole.center))return
  container.dataset.parfolioBridge='1'
  container.replaceChildren()
  const frame=document.createElement('iframe')
  frame.className='pf-parfolio-map-frame'
  frame.title=`Hole ${number} satellite map`
  frame.src=mapUrl(hole)
  frame.loading='eager'
  frame.referrerPolicy='strict-origin-when-cross-origin'
  frame.setAttribute('allow','geolocation')
  frame.addEventListener('load',()=>document.querySelector('.pf-map-loading')?.remove(),{once:true})
  container.appendChild(frame)
}

const style=document.createElement('style')
style.textContent='.pf-parfolio-map-frame{display:block;width:100%;height:100%;min-height:320px;border:0;background:#10251e}.pf-google-map:has(.pf-parfolio-map-frame){position:relative;z-index:2}'
document.head.appendChild(style)

let queued=false
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;installBridge()})}
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true})
window.addEventListener('message',event=>{if(event.origin===PARFOLIO_MAP_ORIGIN&&event.data?.type==='parfolio-mini-map-ready')document.querySelector('.pf-map-loading')?.remove()})
schedule()
