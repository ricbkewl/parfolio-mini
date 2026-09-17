// Restore the original premium ParFolio Mini artwork without reintroducing
// the removed experimental competition layers. This intentionally uses a
// short bounded startup pass instead of a document-wide MutationObserver.

const VISUALS={
  home:'/9B68D5FF-8CCE-40FA-8F35-7F5828913002.png',
  play:'/24C0A58C-92A8-4778-9031-96CC85894A3E.png',
  wallet:'/905BCCA7-6CD7-4A83-BD0E-BCB1E0C871CF.png',
  rounds:'/417CAD54-2A36-4671-834C-1CBA0D148224.png',
  clubs:'/A0077D56-18EF-43BC-9C9F-0312956363F5.png',
  how:'/E9CA092A-116F-4D8E-AE7E-C13A43D52E41.png'
}

function restoreVisuals(){
  const hero=document.querySelector('.pf-hero-art')
  if(hero&&hero.getAttribute('src')!==VISUALS.home){
    hero.src=VISUALS.home
    hero.alt='ParFolio Mini golf, GPS play and Nimiq wallet experience'
  }

  Object.entries(VISUALS).forEach(([page,src])=>{
    if(page==='home')return
    const img=document.querySelector(`.pf-app-page[data-page="${page}"] .pf-page-visual img`)
    if(img&&img.getAttribute('src')!==src){
      img.src=src
      img.loading='eager'
      img.decoding='async'
    }
  })
}

let passes=0
const timer=setInterval(()=>{
  passes+=1
  restoreVisuals()
  if(passes>=40)clearInterval(timer)
},150)

window.addEventListener('hashchange',()=>setTimeout(restoreVisuals,20))
document.addEventListener('click',()=>setTimeout(restoreVisuals,40),true)
restoreVisuals()
