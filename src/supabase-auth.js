import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL='https://vhtnoyaggoknvqnjpuof.supabase.co'
const SUPABASE_KEY='sb_publishable_MBkDBEVMlYUmUCEq8zPSGg_p0pTIR6h'
const PROFILE_KEY='parfolio-mini:profile-v1'
const BAG_KEY='parfolio-mini:bag-v1'
const CLUBS_KEY='parfolio-mini:clubs-v1'
const ROUNDS_KEY='parfolio-mini:verified-rounds'

const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})
let currentUser=null
let syncing=false

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??f}catch{return f}}

function styles(){if(document.getElementById('pf-auth-style'))return;const s=document.createElement('style');s.id='pf-auth-style';s.textContent=`
.pf-auth-panel{margin:18px auto 24px;width:min(100%,760px);border:1px solid rgba(239,211,117,.25);border-radius:24px;padding:20px;background:linear-gradient(145deg,#0c3226,#071f18);color:#fff;box-shadow:0 22px 55px rgba(0,0,0,.22)}.pf-auth-panel h2{margin:4px 0 8px}.pf-auth-panel>p{color:#aec0b7;line-height:1.5}.pf-auth-tabs{display:flex;gap:8px;margin:14px 0}.pf-auth-tabs button{flex:1;min-height:42px;border-radius:11px;border:1px solid rgba(255,255,255,.12);background:#15372c;color:#fff;font-weight:850}.pf-auth-tabs button.active{background:#e1c66b;color:#102017;border-color:#e1c66b}.pf-auth-form{display:grid;gap:10px}.pf-auth-form label{font-size:.75rem;color:#aebeb6}.pf-auth-form input{width:100%;margin-top:4px;border:1px solid rgba(255,255,255,.13);background:#061d16;color:#fff;border-radius:11px;padding:11px;font-size:16px}.pf-auth-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:4px}.pf-auth-actions button{min-height:44px;border-radius:11px;padding:0 14px;border:1px solid rgba(239,211,117,.3);background:#e1c66b;color:#102017;font-weight:900}.pf-auth-actions .secondary{background:#14372c;color:#fff;border-color:rgba(255,255,255,.12)}.pf-auth-status{min-height:20px;margin-top:8px;color:#d6c77d;font-size:.76rem}.pf-auth-ready{display:grid;gap:10px}.pf-auth-ready .who{padding:12px;border-radius:13px;background:rgba(255,255,255,.045)}.pf-auth-ready strong,.pf-auth-ready small{display:block}.pf-auth-ready small{color:#a9bbb2;margin-top:3px}.pf-auth-roadmap{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}.pf-auth-roadmap div{padding:10px;border-radius:12px;background:rgba(255,255,255,.04);font-size:.73rem}.pf-auth-roadmap b{display:block;color:#efd477;margin-bottom:3px}@media(max-width:620px){.pf-auth-roadmap{grid-template-columns:1fr 1fr}}
`;document.head.appendChild(s)}

function homePage(){return document.querySelector('.pf-app-page[data-page="home"]')}
function panel(){return document.querySelector('.pf-auth-panel')}
function goMyParfolio(){document.querySelector('.pf-nav-item[data-page="wallet"]')?.click()||document.querySelector('button[data-page="wallet"]')?.click()}

function renderAuth(){styles();const home=homePage();if(!home)return false;let p=panel();if(!p){p=document.createElement('section');p.className='pf-auth-panel';const hero=home.querySelector('.hero');hero?.insertAdjacentElement('afterend',p);if(!hero)home.prepend(p)}
 if(currentUser){p.innerHTML=`<p class="eyebrow">Signed in</p><h2>Welcome back to ParFolio Mini.</h2><div class="pf-auth-ready"><div class="who"><strong>${esc(currentUser.user_metadata?.full_name||currentUser.email||'Player')}</strong><small>${esc(currentUser.email||'')}</small></div><div class="pf-auth-roadmap"><div><b>1</b>Profile</div><div><b>2</b>Nimiq wallet</div><div><b>3</b>My Clubs</div><div><b>4</b>Ready to Play</div></div><div class="pf-auth-actions"><button type="button" data-auth-myparfolio>Continue to My ParFolio</button><button type="button" class="secondary" data-auth-signout>Sign out</button></div></div>`;p.querySelector('[data-auth-myparfolio]').onclick=goMyParfolio;p.querySelector('[data-auth-signout]').onclick=async()=>{await supabase.auth.signOut();currentUser=null;renderAuth()};return true}
 p.innerHTML=`<p class="eyebrow">Player account</p><h2>Sign up or sign in before you play.</h2><p>Create your ParFolio Mini account first. After that, My ParFolio will guide you through your profile, Nimiq wallet, and golf-bag setup.</p><div class="pf-auth-tabs"><button class="active" type="button" data-auth-tab="signup">Sign Up</button><button type="button" data-auth-tab="signin">Sign In</button></div><form class="pf-auth-form" data-auth-form><label data-auth-name>Full name<input name="name" autocomplete="name" required></label><label>Email<input name="email" type="email" autocomplete="email" required></label><label>Password<input name="password" type="password" autocomplete="new-password" minlength="6" required></label><div class="pf-auth-actions"><button type="submit">Create account</button></div><div class="pf-auth-status" role="status" aria-live="polite"></div></form>`
 let mode='signup';const tabs=[...p.querySelectorAll('[data-auth-tab]')],form=p.querySelector('[data-auth-form]'),status=p.querySelector('.pf-auth-status'),nameLabel=p.querySelector('[data-auth-name]'),submit=form.querySelector('button[type="submit"]'),pass=form.elements.password
 tabs.forEach(t=>t.onclick=()=>{mode=t.dataset.authTab;tabs.forEach(x=>x.classList.toggle('active',x===t));nameLabel.hidden=mode==='signin';form.elements.name.required=mode==='signup';submit.textContent=mode==='signup'?'Create account':'Sign in';pass.autocomplete=mode==='signup'?'new-password':'current-password';status.textContent=''})
 form.onsubmit=async e=>{e.preventDefault();submit.disabled=true;status.textContent=mode==='signup'?'Creating your account…':'Signing you in…';const email=form.elements.email.value.trim(),password=form.elements.password.value,name=form.elements.name.value.trim();try{if(mode==='signup'){const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});if(error)throw error;if(data.session){currentUser=data.user;await hydrateFromCloud();renderAuth();goMyParfolio()}else status.textContent='Account created. Check your email to confirm, then return here and sign in.'}else{const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;currentUser=data.user;await hydrateFromCloud();renderAuth();goMyParfolio()}}catch(err){status.textContent=err?.message||'Authentication failed. Please try again.'}finally{submit.disabled=false}}
 return true
}

async function hydrateFromCloud(){if(!currentUser)return;syncing=true;try{const [{data:p},{data:b},{data:r}]=await Promise.all([supabase.from('profiles').select('*').eq('user_id',currentUser.id).maybeSingle(),supabase.from('golf_bags').select('*').eq('user_id',currentUser.id).maybeSingle(),supabase.from('signed_rounds').select('*').eq('user_id',currentUser.id).order('created_at',{ascending:false}).limit(20)])
 if(p){localStorage.setItem(PROFILE_KEY,JSON.stringify({name:p.full_name||'',email:currentUser.email||'',phone:p.phone||'',handicap:p.handicap||'',homeCourse:p.home_course||'',wallet:p.nimiq_wallet||'',updatedAt:p.updated_at}))}
 if(b){localStorage.setItem(BAG_KEY,JSON.stringify(Array.isArray(b.clubs)?b.clubs:[]));localStorage.setItem(CLUBS_KEY,JSON.stringify(b.distances||{}))}
 if(Array.isArray(r)&&r.length){localStorage.setItem(ROUNDS_KEY,JSON.stringify(r.map(x=>({course:x.course,date:x.played_on,holes:x.holes,score:x.score,par:x.par,birdies:x.birdies,wallet:x.wallet,publicKey:x.public_key,signature:x.signature,message:x.message,createdAt:x.created_at}))))}
 window.dispatchEvent(new CustomEvent('parfolio:profile-updated'));window.dispatchEvent(new CustomEvent('parfolio:clubs-updated'));window.dispatchEvent(new CustomEvent('parfolio:rounds-updated'))}finally{syncing=false}}

async function syncProfile(){if(!currentUser||syncing)return;const p=read(PROFILE_KEY,{});await supabase.from('profiles').upsert({user_id:currentUser.id,full_name:p.name||'',phone:p.phone||null,handicap:p.handicap||null,home_course:p.homeCourse||null,nimiq_wallet:p.wallet||null,updated_at:new Date().toISOString()})}
async function syncBag(){if(!currentUser||syncing)return;await supabase.from('golf_bags').upsert({user_id:currentUser.id,clubs:read(BAG_KEY,[]),distances:read(CLUBS_KEY,{}),updated_at:new Date().toISOString()})}
async function syncRounds(){if(!currentUser||syncing)return;const rounds=read(ROUNDS_KEY,[]);for(const x of rounds.slice(0,20)){if(!x.signature)continue;const existing=await supabase.from('signed_rounds').select('id').eq('user_id',currentUser.id).eq('signature',x.signature).maybeSingle();if(existing.data?.id)continue;await supabase.from('signed_rounds').insert({user_id:currentUser.id,course:x.course||'Golf Course',played_on:x.date||null,holes:x.holes||null,score:x.score||null,par:x.par||null,birdies:x.birdies||0,wallet:x.wallet||null,public_key:x.publicKey||null,signature:x.signature,message:x.message||null,created_at:x.createdAt||new Date().toISOString()})}}

window.addEventListener('parfolio:profile-updated',()=>syncProfile().catch(()=>{}));window.addEventListener('parfolio:clubs-updated',()=>syncBag().catch(()=>{}));window.addEventListener('parfolio:rounds-updated',()=>syncRounds().catch(()=>{}))

supabase.auth.onAuthStateChange(async(_event,session)=>{currentUser=session?.user||null;if(currentUser)await hydrateFromCloud();renderAuth();window.dispatchEvent(new CustomEvent('parfolio:auth-updated',{detail:{user:currentUser}}))})

async function boot(){const {data}=await supabase.auth.getSession();currentUser=data.session?.user||null;if(currentUser)await hydrateFromCloud();let tries=0;const t=setInterval(()=>{tries++;if(renderAuth()||tries>50)clearInterval(t)},120);renderAuth()}
boot()
