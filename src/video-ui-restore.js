// Video-reference restoration: preserve current app behavior while restoring the premium mobile presentation.
function installVideoReferenceSkin(){
  if(document.getElementById('pf-video-reference-skin')) return;
  const s=document.createElement('style'); s.id='pf-video-reference-skin';
  s.textContent=`
    :root{--pf-emerald:#061c15;--pf-emerald2:#0b2d22;--pf-gold:#e5c96d;--pf-ivory:#f8f5e9}
    body{background:radial-gradient(circle at 50% 0,#164535 0,#08251c 36%,#041711 100%)!important}
    .pf-shell,.shell{max-width:1180px;margin-inline:auto}
    .pf-topbar,.topbar{backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
    .pf-app-page{animation:pfVideoIn .22s ease-out}
    .pf-page-visual{overflow:hidden;border-radius:24px;border:1px solid rgba(229,201,109,.18);box-shadow:0 22px 60px rgba(0,0,0,.28)}
    .pf-page-visual img,.pf-hero-art{width:100%;display:block;object-fit:cover}
    .pf-card,.panel,.glass-surface,.pf-round-card{border-color:rgba(229,201,109,.16)!important;box-shadow:0 18px 45px rgba(0,0,0,.18)}
    .pf-primary,.primary,[data-pf-start-round]{border-radius:999px!important;font-weight:800!important}
    .pf-round-shell{background:#061c15!important}
    @keyframes pfVideoIn{from{opacity:.65;transform:translateY(5px)}to{opacity:1;transform:none}}
    @media(max-width:720px){
      body{overflow-x:hidden}
      .pf-shell,.shell{width:100%;max-width:100%;padding-left:max(12px,env(safe-area-inset-left));padding-right:max(12px,env(safe-area-inset-right))}
      .pf-page-visual{border-radius:20px}
      .pf-page-visual img{max-height:42vh!important;object-fit:cover!important;object-position:center!important}
      .pf-round-shell{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;max-width:none!important;z-index:9000!important;overflow:hidden!important;padding-top:env(safe-area-inset-top)!important;padding-bottom:env(safe-area-inset-bottom)!important}
      .pf-round-map{min-height:100%!important}
    }`;
  document.head.appendChild(s);
}
function refresh(){
  installVideoReferenceSkin();
  document.documentElement.classList.add('pf-video-reference');
  document.querySelectorAll('.pf-page-visual img,.pf-hero-art').forEach(img=>{img.decoding='async';});
}
refresh();
window.addEventListener('hashchange',()=>setTimeout(refresh,30));
window.addEventListener('parfolio:auth-updated',()=>setTimeout(refresh,30));
window.addEventListener('parfolio:rounds-updated',()=>setTimeout(refresh,30));
