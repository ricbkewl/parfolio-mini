// Mobile-safe artwork presentation for ParFolio Mini.
// Prevents wide marketing artwork from being cropped on phones and adds tap-to-expand viewing.

function installMobileArtworkFix(){
  if(document.getElementById('pf-mobile-artwork-fix')) return

  const style=document.createElement('style')
  style.id='pf-mobile-artwork-fix'
  style.textContent=`
    .pf-page-visual{
      background:#061b13!important;
      display:block!important;
    }
    .pf-page-visual img,
    .pf-hero-art{
      display:block!important;
      width:100%!important;
      height:auto!important;
      max-width:100%!important;
      aspect-ratio:auto!important;
      object-fit:contain!important;
      object-position:center center!important;
      background:#061b13!important;
    }
    .pf-page-visual img,
    .pf-hero-art{cursor:zoom-in}

    .pf-image-lightbox{
      position:fixed;
      inset:0;
      z-index:30000;
      display:none;
      align-items:center;
      justify-content:center;
      padding:max(10px,env(safe-area-inset-top)) 8px max(10px,env(safe-area-inset-bottom));
      background:rgba(0,0,0,.96);
      backdrop-filter:blur(8px);
    }
    .pf-image-lightbox.open{display:flex}
    .pf-image-lightbox img{
      width:auto;
      height:auto;
      max-width:100%;
      max-height:92dvh;
      object-fit:contain;
      border-radius:12px;
      box-shadow:0 24px 70px rgba(0,0,0,.55);
    }
    .pf-image-lightbox button{
      position:absolute;
      top:max(10px,env(safe-area-inset-top));
      right:12px;
      width:44px;
      height:44px;
      border:1px solid rgba(255,255,255,.25);
      border-radius:50%;
      background:rgba(5,25,18,.88);
      color:#fff;
      font-size:25px;
      line-height:1;
      z-index:2;
    }
    .pf-image-zoom-hint{
      position:absolute;
      left:50%;
      bottom:max(14px,calc(env(safe-area-inset-bottom) + 8px));
      transform:translateX(-50%);
      padding:7px 11px;
      border-radius:999px;
      background:rgba(5,25,18,.82);
      color:#e8d37d;
      font-size:11px;
      white-space:nowrap;
      pointer-events:none;
    }

    @media(max-width:760px){
      .pf-pages{padding-left:8px!important;padding-right:8px!important}
      .pf-page-visual{
        margin-left:0!important;
        margin-right:0!important;
        border-radius:16px!important;
      }
      .pf-page-visual img,
      .pf-hero-art{
        width:100%!important;
        height:auto!important;
        max-height:none!important;
        aspect-ratio:auto!important;
        object-fit:contain!important;
        object-position:center!important;
      }
      .hero.pf-visual-hero{
        margin-left:0!important;
        margin-right:0!important;
        border-radius:16px!important;
      }
      .pf-hero-art-wrap{
        width:100%!important;
        height:auto!important;
        background:#061b13!important;
      }
    }
  `
  document.head.appendChild(style)

  const lightbox=document.createElement('div')
  lightbox.className='pf-image-lightbox'
  lightbox.innerHTML='<button type="button" aria-label="Close image">×</button><img alt=""><div class="pf-image-zoom-hint">Tap × to return</div>'
  document.body.appendChild(lightbox)

  const preview=lightbox.querySelector('img')
  const close=()=>lightbox.classList.remove('open')
  lightbox.querySelector('button').addEventListener('click',close)
  lightbox.addEventListener('click',event=>{if(event.target===lightbox)close()})

  document.addEventListener('click',event=>{
    const image=event.target.closest?.('.pf-page-visual img,.pf-hero-art')
    if(!image) return
    preview.src=image.currentSrc||image.src
    preview.alt=image.alt||'ParFolio Mini artwork'
    lightbox.classList.add('open')
  })
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',installMobileArtworkFix)
else installMobileArtworkFix()
