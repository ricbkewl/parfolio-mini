/* ParFolio Mini map fallback.
   The full interactive Google map in round-play.js is the primary map. This
   bridge only installs the ParFolio-hosted iframe when that map fails to
   initialize, so planner/drag/live controls are never replaced unnecessarily. */
const PARFOLIO_MAP_ORIGIN='https://parfolio-iota.vercel.app'
let lastPayload=null
let roundObserver=null
let fallbackTimer=null

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
function holeNumber(){const text=document.querySelector('.pf-hole-strip strong')?.textContent||'';return Number((text.match(/(\d+)/)||[])[0]||1)}
function addPoint(params,prefix,point){if(!valid(point))return;params.set(`${prefix}Lat`,String(Number(point.lat)));params.set(`${prefix}Lng`,String(Number(point.lng)))}
function mapUrl(hole){const params=new URLSearchParams();addPoint(params,'tee',hole.tee);addPoint(params,'aim1',hole.aim1);addPoint(params,'aim2',hole.aim2);addPoint(params,'front',hole.front);addPoint(params,'center',hole.center);addPoint(params,'back',hole.back);return `${PARFOLIO_MAP_ORIGIN}/mini-hole-map.html?${params}`}
function directMapHealthy(container){return Boolean(container?.querySelector('.gm-style,.gm-style-moc')||container?.querySelector('canvas'))}
function installFallback(){
  const container=document.querySelector('#pfGoogleHoleMap')
  if(!container||!lastPayload||directMapHealthy(container)||container.querySelector('.pf-parfolio-map-frame'))return
  const number=holeNumber(),hole=lastPayload.greens.find(item=>Number(item?.hole)===number)
  if(!hole||!valid(hole.tee)||!valid(hole.center))return
  container.replaceChildren()
  const frame=document.createElement('iframe');frame.className='pf-parfolio-map-frame';frame.title=`Hole ${number} satellite map`;frame.src=mapUrl(hole);frame.loading='eager';frame.referrerPolicy='strict-origin-when-cross-origin';frame.setAttribute('allow','geolocation')
  frame.addEventListener('load',()=>document.querySelector('.pf-map-loading')?.remove(),{once:true});container.appendChild(frame)
}
function scheduleFallback(){clearTimeout(fallbackTimer);fallbackTimer=setTimeout(()=>{const container=document.querySelector('#pfGoogleHoleMap');if(container&&!directMapHealthy(container))installFallback()},3500)}
function attachRoundObserver(){
  roundObserver?.disconnect();roundObserver=null
  let tries=0;const wait=setInterval(()=>{tries++;const shell=document.querySelector('.pf-round-shell');if(!shell&&tries<30)return;clearInterval(wait);if(!shell)return;scheduleFallback();roundObserver=new MutationObserver(()=>scheduleFallback());roundObserver.observe(shell,{childList:true,subtree:true})},150)
}

const style=document.createElement('style');style.textContent='.pf-parfolio-map-frame{display:block;width:100%;height:100%;min-height:320px;border:0;background:#10251e}.pf-google-map:has(.pf-parfolio-map-frame){position:relative;z-index:2}';document.head.appendChild(style)
window.addEventListener('parfolio:course-selected',attachRoundObserver)
document.addEventListener('click',e=>{if(e.target.closest?.('[data-pf-next],[data-pf-prev],[data-hole-jump],[data-pf-gps],[data-map-type],[data-clear-planner]'))scheduleFallback()},true)
window.addEventListener('message',event=>{if(event.origin===PARFOLIO_MAP_ORIGIN&&event.data?.type==='parfolio-mini-map-ready')document.querySelector('.pf-map-loading')?.remove()})
