function tuneRoundEntry(){
  document.querySelectorAll('[data-use-pf-course]').forEach((button)=>{button.textContent='Start round'})
  const note=document.querySelector('.ca-course-finder .course-finder-note')
  if(note)note.textContent='Search by course name, city, or ZIP. GPS Ready courses can open directly into hole-by-hole play.'
}

let queued=false
function scheduleTune(){
  if(queued)return
  queued=true
  requestAnimationFrame(()=>{queued=false;tuneRoundEntry()})
}

new MutationObserver(scheduleTune).observe(document.getElementById('app')||document.body,{childList:true,subtree:true})
tuneRoundEntry()
