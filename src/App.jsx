import { useState, useEffect, useRef, useCallback } from "react"

/* ═══════════════════════════════════════════════
   SUPABASE CLIENT
═══════════════════════════════════════════════ */
const SUPA_URL = import.meta.env.VITE_SUPABASE_URL || ""
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ""

async function sb(path, opts={}){
  if(!SUPA_URL||!SUPA_KEY) return {data:null,error:"non configuré"}
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`,{
    headers:{"apikey":SUPA_KEY,"Authorization":`Bearer ${SUPA_KEY}`,"Content-Type":"application/json","Prefer":"return=representation",...(opts.headers||{})},
    ...opts
  })
  const data = res.ok ? await res.json() : null
  return {data, error: res.ok?null:await res.text()}
}
async function sbSignUp(email,password,name){
  const res=await fetch(`${SUPA_URL}/auth/v1/signup`,{method:"POST",headers:{"apikey":SUPA_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password,data:{name}})})
  return res.json()
}
async function sbSignIn(email,password){
  const res=await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`,{method:"POST",headers:{"apikey":SUPA_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})})
  return res.json()
}
async function sbSignOut(token){
  await fetch(`${SUPA_URL}/auth/v1/logout`,{method:"POST",headers:{"apikey":SUPA_KEY,"Authorization":`Bearer ${token}`}})
}
async function sbGetUser(token){
  const res=await fetch(`${SUPA_URL}/auth/v1/user`,{headers:{"apikey":SUPA_KEY,"Authorization":`Bearer ${token}`}})
  return res.ok?res.json():null
}
function sbGoogleLogin(){
  if(!SUPA_URL){toast("Supabase non configuré","error");return}
  const redir=encodeURIComponent(window.location.origin+"/app")
  window.location.href=`${SUPA_URL}/auth/v1/authorize?provider=google&redirect_to=${redir}`
}


/* ═══════════════════════════════════════
   TOKENS
═══════════════════════════════════════ */
const T = {
  bg:"#F8F8F6", bgWhite:"#FFFFFF", surface:"#F2F2F0",
  border:"#E4E4E0", borderMid:"#D0D0CC",
  text:"#0A0A0A", textSec:"#64646A", textTer:"#A0A0A8",
  accent:"#0A0A0A", orange:"#F97316", orangeLight:"#FFF7ED", orangeBorder:"#FED7AA",
  red:"#EF4444", green:"#22C55E", blue:"#3B82F6", purple:"#8B5CF6",
  shadow:"0 1px 2px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04)",
  shadowMd:"0 4px 20px rgba(0,0,0,0.08),0 1px 4px rgba(0,0,0,0.04)",
  shadowLg:"0 20px 60px rgba(0,0,0,0.12),0 4px 16px rgba(0,0,0,0.06)",
  shadow3d:"0 8px 0 rgba(0,0,0,0.15),0 12px 30px rgba(0,0,0,0.12)",
}
const mono = { fontFamily:"'DM Mono',monospace" }
const FREE_LIMIT = 3
const LANGS = ["English","Español","Deutsch","Italiano","Português","中文","日本語","العربية"]
const ADMIN_PASSWORD = "admin2025"

/* ═══════════════════════════════════════
   FONTS + GLOBAL CSS
═══════════════════════════════════════ */
function useFont() {
  useEffect(() => {
    if (document.getElementById("tai5")) return
    const l = document.createElement("link"); l.id="tai5"; l.rel="stylesheet"
    l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap"
    document.head.appendChild(l)
    const s = document.createElement("style"); s.textContent = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:${T.bg};color:${T.text};font-family:'Inter',sans-serif}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
::selection{background:#0A0A0A;color:#fff}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes toastIn{from{opacity:0;transform:translateX(110%)}to{opacity:1;transform:translateX(0)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes pulse2{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
@keyframes ticker{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes countUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes floatA{
  0%,100%{transform:perspective(900px) rotateX(6deg) rotateY(-10deg) translateY(0px) translateZ(0px)}
  33%{transform:perspective(900px) rotateX(3deg) rotateY(-6deg) translateY(-12px) translateZ(10px)}
  66%{transform:perspective(900px) rotateX(8deg) rotateY(-13deg) translateY(-5px) translateZ(5px)}
}
@keyframes floatB{
  0%,100%{transform:perspective(900px) rotateX(-4deg) rotateY(12deg) translateY(0px)}
  40%{transform:perspective(900px) rotateX(-7deg) rotateY(8deg) translateY(-10px) translateZ(8px)}
  70%{transform:perspective(900px) rotateX(-2deg) rotateY(15deg) translateY(-4px)}
}
@keyframes floatC{
  0%,100%{transform:perspective(900px) rotateX(5deg) rotateY(8deg) translateY(0px)}
  50%{transform:perspective(900px) rotateX(2deg) rotateY(4deg) translateY(-14px) translateZ(12px)}
}
@keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes orbitX{0%,100%{transform:perspective(600px) rotateY(0deg)}50%{transform:perspective(600px) rotateY(180deg)}}
@keyframes glow{0%,100%{box-shadow:0 8px 0 rgba(0,0,0,0.15),0 12px 30px rgba(0,0,0,0.10)}50%{box-shadow:0 10px 0 rgba(0,0,0,0.18),0 16px 40px rgba(0,0,0,0.14)}}
@keyframes lineGrow{from{width:0}to{width:100%}}
@keyframes dotPulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.4);opacity:1}}
.fade-up{animation:fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards}
.fade-up-d1{animation:fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both}
.fade-up-d2{animation:fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both}
.fade-up-d3{animation:fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s both}
.fade-up-d4{animation:fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s both}
.card-3d{transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.25s ease}
.card-3d:hover{transform:translateY(-5px) perspective(700px) rotateX(2deg) scale(1.01);box-shadow:0 24px 50px rgba(0,0,0,0.12),0 8px 20px rgba(0,0,0,0.07)!important}
.btn-dark{transition:all 0.15s cubic-bezier(0.34,1.56,0.64,1)}
.btn-dark:hover{background:#1a1a1a!important;transform:translateY(-2px) scale(1.02);box-shadow:0 6px 0 rgba(0,0,0,0.2),0 10px 24px rgba(0,0,0,0.15)!important}
.btn-dark:active{transform:translateY(1px) scale(0.99)!important;box-shadow:0 2px 0 rgba(0,0,0,0.2)!important}
.row-hover:hover{background:${T.surface}!important}
.float-a{animation:floatA 7s ease-in-out infinite}
.float-b{animation:floatB 9s ease-in-out 1.5s infinite}
.float-c{animation:floatC 6s ease-in-out 3s infinite}
.glow-card{animation:glow 4s ease-in-out infinite}
.reading-bar{position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#0A0A0A,#555);z-index:9999;transition:width 0.1s linear;pointer-events:none}
.grid-bg{
  background-color:${T.bgWhite};
  background-image:
    linear-gradient(rgba(0,0,0,0.055) 1px,transparent 1px),
    linear-gradient(90deg,rgba(0,0,0,0.055) 1px,transparent 1px),
    linear-gradient(rgba(0,0,0,0.02) 1px,transparent 1px),
    linear-gradient(90deg,rgba(0,0,0,0.02) 1px,transparent 1px);
  background-size:80px 80px,80px 80px,20px 20px,20px 20px;
  background-position:-1px -1px,-1px -1px,-1px -1px,-1px -1px;
}
`
    document.head.appendChild(s)
  }, [])
}

/* ═══════════════════════════════════════
   TOAST
═══════════════════════════════════════ */
let _tid=0, _addToast=null
function useToastProvider(){
  const [toasts,setToasts]=useState([])
  _addToast=useCallback((msg,type="info")=>{
    const id=++_tid
    setToasts(p=>[...p,{id,msg,type}])
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3000)
  },[])
  return {toasts}
}
function toast(msg,type="info"){_addToast?.(msg,type)}
function ToastContainer({toasts}){
  const c={success:T.green,error:T.red,info:T.accent,warn:T.orange}
  return(
    <div style={{position:"fixed",bottom:24,right:24,zIndex:999,display:"flex",flexDirection:"column",gap:8}}>
      {toasts.map(t=>(
        <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,background:T.bgWhite,border:`1px solid ${T.border}`,borderLeft:`3px solid ${c[t.type]}`,borderRadius:10,padding:"10px 14px",minWidth:240,maxWidth:300,animation:"toastIn 0.3s ease",boxShadow:T.shadowMd}}>
          <span style={{fontSize:13,color:T.text,flex:1}}>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════
   SHORTCUTS
═══════════════════════════════════════ */
function useShortcuts(map){
  useEffect(()=>{
    function h(e){
      const k=(e.ctrlKey||e.metaKey?"ctrl+":"")+(e.shiftKey?"shift+":"")+e.key.toLowerCase()
      if(map[k]){e.preventDefault();map[k]()}
    }
    window.addEventListener("keydown",h)
    return()=>window.removeEventListener("keydown",h)
  },[map])
}

/* ═══════════════════════════════════════
   READING PROGRESS BAR
═══════════════════════════════════════ */
function ReadingProgress(){
  const [pct,setPct]=useState(0)
  useEffect(()=>{
    function update(){
      const el=document.documentElement
      const scrolled=el.scrollTop||document.body.scrollTop
      const total=(el.scrollHeight||document.body.scrollHeight)-el.clientHeight
      setPct(total>0?Math.min(100,(scrolled/total)*100):0)
    }
    window.addEventListener("scroll",update,{passive:true})
    return()=>window.removeEventListener("scroll",update)
  },[])
  if(pct<=0)return null
  return <div className="reading-bar" style={{width:`${pct}%`}}/>
}

/* ═══════════════════════════════════════
   ANNOUNCEMENT BANNER
═══════════════════════════════════════ */
function AnnouncementBanner({config}){
  const [visible,setVisible]=useState(true)
  if(!config||!config.enabled||!visible)return null
  const textColor=config.darkText?"#0A0A0A":"#FFFFFF"
  return(
    <div style={{
      width:"100%", background:config.bg||"#0A0A0A",
      padding:"9px 1rem",display:"flex",alignItems:"center",justifyContent:"center",gap:10,
      position:"relative",flexShrink:0
    }}>
      <span style={{fontSize:13,color:textColor,fontWeight:500}} dangerouslySetInnerHTML={{__html:config.text}}/>
      {config.link&&config.linkLabel&&(
        <a href={config.link} target="_blank" rel="noreferrer" style={{fontSize:12,color:config.darkText?T.accent:"rgba(255,255,255,0.8)",fontWeight:700,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2}}>{config.linkLabel}</a>
      )}
      <button onClick={()=>setVisible(false)} style={{position:"absolute",right:14,background:"transparent",border:"none",color:config.darkText?"rgba(0,0,0,0.4)":"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:16,lineHeight:1}}>✕</button>
    </div>
  )
}

/* ═══════════════════════════════════════
   LIVE USER COUNTER
═══════════════════════════════════════ */
function LiveCounter({adminMin=100,adminMax=2000}){
  const [count,setCount]=useState(()=>Math.floor(Math.random()*(adminMax-adminMin)*0.6)+adminMin)
  const [trend,setTrend]=useState(1)
  const trendRef=useRef(1)
  const countRef=useRef(count)
  useEffect(()=>{
    // organic movement: pick a target every 8-25s, drift toward it
    let target=Math.floor(Math.random()*(adminMax-adminMin))+adminMin
    let targetTimer=null
    function pickTarget(){
      target=Math.floor(Math.random()*(adminMax-adminMin))+adminMin
      const ms=(8+Math.random()*17)*1000
      targetTimer=setTimeout(pickTarget,ms)
    }
    pickTarget()
    // small tick every 600-2200ms
    let tickTimer=null
    function tick(){
      const diff=target-countRef.current
      const maxStep=Math.max(1,Math.floor(Math.abs(diff)*0.08)+Math.floor(Math.random()*6))
      const step=diff>0?Math.min(maxStep,diff):-Math.min(maxStep,-diff)
      const next=Math.max(adminMin,Math.min(adminMax,countRef.current+step))
      countRef.current=next
      trendRef.current=step>=0?1:-1
      setCount(next)
      setTrend(step>=0?1:-1)
      const ms=600+Math.random()*1600
      tickTimer=setTimeout(tick,ms)
    }
    tickTimer=setTimeout(tick,800)
    return()=>{clearTimeout(targetTimer);clearTimeout(tickTimer)}
  },[])
  return(
    <div style={{display:"inline-flex",alignItems:"center",gap:8,background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:100,padding:"6px 16px",boxShadow:T.shadow}}>
      <div style={{display:"flex",gap:3}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.green,opacity:1-i*0.25,animation:`pulse2 1.8s ease ${i*0.3}s infinite`}}/>
        ))}
      </div>
      <span style={{fontSize:13,fontWeight:700,color:T.text,...mono}}>{count.toLocaleString("fr-FR")}</span>
      <span style={{fontSize:12,color:T.textSec}}>personnes actives</span>
      <span style={{fontSize:11,color:trend>0?T.green:T.red,fontWeight:700,...mono}}>{trend>0?"↑":"↓"}</span>
    </div>
  )
}

/* ═══════════════════════════════════════
   PROFILE PAGE
═══════════════════════════════════════ */
function ProfilePage({setView,isPro,usageCount,user,onLogout}){
  const [name,setName]=useState(user?.name||"")
  const [email,setEmail]=useState(user?.email||"")
  const [bio,setBio]=useState("Créateur de contenu & passionné de productivité.")
  const [saved,setSaved]=useState(false)
  const [avatarColor,setAvatarColor]=useState("#0A0A0A")
  const colors=["#0A0A0A","#6366F1","#F97316","#22C55E","#EF4444","#8B5CF6","#F59E0B","#EC4899"]

  async function save(){
    if(user?.id&&user?.token){
      await sb("profiles?id=eq."+user.id,{method:"PATCH",headers:{"Prefer":"return=minimal","Authorization":`Bearer ${user.token}`},body:JSON.stringify({name,email})})
      const s=JSON.parse(localStorage.getItem("tai_session")||"{}");localStorage.setItem("tai_session",JSON.stringify({...s,name,email}))
    }
    setSaved(true);setTimeout(()=>setSaved(false),2000)
  }
  function Field({label,value,onChange,multiline}){
    const [f,setF]=useState(false)
    const base={fontFamily:"'Inter',sans-serif",width:"100%",background:T.bg,border:`1.5px solid ${f?T.text:T.border}`,borderRadius:9,color:T.text,fontSize:14,outline:"none",transition:"all 0.15s",boxShadow:f?"0 4px 0 rgba(0,0,0,0.08)":"none"}
    return(
      <div style={{marginBottom:"1.125rem"}}>
        <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>{label}</p>
        {multiline
          ?<textarea value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{...base,padding:"10px 14px",minHeight:80,resize:"none"}}/>
          :<input value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{...base,height:44,padding:"0 14px"}}/>
        }
      </div>
    )
  }
  return(
    <div style={{minHeight:"100vh",background:T.bg}}>
      <div style={{maxWidth:820,margin:"0 auto",padding:"2.5rem 2rem"}}>
        <div style={{marginBottom:"2rem",paddingBottom:"1.25rem",borderBottom:`1px solid ${T.border}`}}>
          <p style={{fontSize:10,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5,...mono}}>Mon compte</p>
          <h1 style={{fontSize:26,fontWeight:800,color:T.text,letterSpacing:-1.2}}>Profil</h1>
        </div>

        {/* Avatar */}
        <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:14,padding:"1.75rem",marginBottom:12,boxShadow:T.shadow}}>
          <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:"1.25rem"}}>Avatar</p>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            <div style={{width:72,height:72,borderRadius:"50%",background:avatarColor,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 0 rgba(0,0,0,0.2)",flexShrink:0}}>
              <span style={{color:"#fff",fontSize:24,fontWeight:800}}>{name.split(" ").map(w=>w[0]).join("").slice(0,2)}</span>
            </div>
            <div>
              <p style={{fontSize:13,color:T.textSec,marginBottom:10}}>Choisissez une couleur</p>
              <div style={{display:"flex",gap:8}}>
                {colors.map(col=>(
                  <div key={col} onClick={()=>setAvatarColor(col)} style={{width:24,height:24,borderRadius:"50%",background:col,cursor:"pointer",border:`2px solid ${avatarColor===col?T.text:"transparent"}`,boxShadow:avatarColor===col?"0 3px 0 rgba(0,0,0,0.2)":"none",transition:"all 0.15s"}}/>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:14,padding:"1.75rem",marginBottom:12,boxShadow:T.shadow}}>
          <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:"1.25rem"}}>Informations</p>
          <Field label="Nom complet" value={name} onChange={setName}/>
          <Field label="Adresse email" value={email} onChange={setEmail}/>
          <Field label="Bio" value={bio} onChange={setBio} multiline/>
          <DarkBtn onClick={save} style={{boxShadow:T.shadow3d}}>
            {saved?"✓ Sauvegardé !":"Sauvegarder les modifications"}
          </DarkBtn>
        </div>

        {/* Plan */}
        <div style={{background:isPro?T.text:T.bgWhite,border:`1px solid ${isPro?"transparent":T.border}`,borderRadius:14,padding:"1.5rem",boxShadow:isPro?"0 8px 0 rgba(0,0,0,0.25),0 16px 40px rgba(0,0,0,0.12)":T.shadow,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={{fontSize:12,color:isPro?"rgba(255,255,255,0.5)":T.textTer,marginBottom:4}}>Plan actuel</p>
            <p style={{fontSize:18,fontWeight:800,color:isPro?"#fff":T.text}}>{isPro?"⭐ Plan Pro":"Plan Gratuit"}</p>
            <p style={{fontSize:12,color:isPro?"rgba(255,255,255,0.5)":T.textSec,marginTop:2}}>{isPro?"5€/mois · Actif":`${Math.max(3-usageCount,0)} crédit(s) restant(s)`}</p>
          </div>
          {!isPro&&<DarkBtn style={{boxShadow:T.shadow3d}}>Passer au Pro →</DarkBtn>}
        </div>
        <button onClick={onLogout} style={{fontFamily:"'Inter',sans-serif",marginTop:"1.5rem",height:40,padding:"0 20px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:9,fontSize:13,fontWeight:500,color:T.red,cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
          ↩ Se déconnecter
        </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   FAKE USERS DB (for admin)
═══════════════════════════════════════ */
const INITIAL_USERS = []
const INITIAL_REVIEWS = []

/* ═══════════════════════════════════════
   PRIMITIVES
═══════════════════════════════════════ */
function DarkBtn({children,onClick,disabled,full,size="md",style:sx={}}){
  const p={sm:{h:34,px:14,fs:12},md:{h:42,px:20,fs:14},lg:{h:52,px:28,fs:15}}[size]
  return(
    <button onClick={onClick} disabled={disabled} className="btn-dark" style={{
      fontFamily:"'Inter',sans-serif",height:p.h,padding:`0 ${p.px}px`,fontSize:p.fs,
      fontWeight:600,borderRadius:9,background:T.text,color:"#fff",border:"none",
      cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.45:1,
      display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,
      width:full?"100%":"auto",...sx
    }}>{children}</button>
  )
}
function OutlineBtn({children,onClick,size="md",active,danger,style:sx={}}){
  const p={sm:{h:30,px:10,fs:11},md:{h:36,px:14,fs:13}}[size]||{h:36,px:14,fs:13}
  return(
    <button onClick={onClick} style={{
      fontFamily:"'Inter',sans-serif",height:p.h,padding:`0 ${p.px}px`,fontSize:p.fs,
      fontWeight:500,background:active?T.text:"transparent",
      color:active?"#fff":danger?T.red:T.textSec,
      border:`1px solid ${active?T.text:danger?T.red+"50":T.border}`,
      borderRadius:7,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,
      transition:"all 0.15s",...sx
    }}>{children}</button>
  )
}
function SectionLabel({children}){
  return <p style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:T.textTer,marginBottom:"0.875rem",...mono}}>{children}</p>
}
function Logo({onClick}){
  return(
    <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",userSelect:"none"}}>
      <div style={{
        width:30,height:30,background:T.text,borderRadius:8,
        display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:"0 3px 0 rgba(0,0,0,0.3),0 6px 14px rgba(0,0,0,0.15)",
        transform:"perspective(200px) rotateX(8deg)"
      }}>
        <span style={{color:"#fff",fontWeight:800,fontSize:14}}>T</span>
      </div>
      <span style={{fontSize:16,fontWeight:700,color:T.text,letterSpacing:-0.3}}>Transcript<span style={{color:"#555"}}>IA</span></span>
    </div>
  )
}

/* ═══════════════════════════════════════
   CREDIT RESET TIMER
═══════════════════════════════════════ */
function CreditResetTimer(){
  // Credits reset every 24h from first use — simulate midnight reset
  const [timeLeft,setTimeLeft]=useState(()=>{
    const now=new Date()
    const midnight=new Date(now)
    midnight.setHours(24,0,0,0)
    return Math.floor((midnight-now)/1000)
  })
  useEffect(()=>{
    const iv=setInterval(()=>setTimeLeft(p=>Math.max(0,p-1)),1000)
    return()=>clearInterval(iv)
  },[])
  const h=Math.floor(timeLeft/3600)
  const m=Math.floor((timeLeft%3600)/60)
  const s=timeLeft%60
  const pad=n=>String(n).padStart(2,"0")
  const pct=((86400-timeLeft)/86400)*100
  return(
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"1.25rem",marginBottom:"1.5rem",textAlign:"left"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <p style={{fontSize:12,fontWeight:600,color:T.textSec}}>⏳ Rechargement des crédits gratuits</p>
        <div style={{display:"flex",gap:6}}>
          {[[h,"h"],[m,"m"],[s,"s"]].map(([v,u])=>(
            <div key={u} style={{textAlign:"center",background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:7,padding:"4px 8px",minWidth:38}}>
              <p style={{fontSize:16,fontWeight:800,color:T.text,...mono,letterSpacing:-0.5}}>{pad(v)}</p>
              <p style={{fontSize:9,color:T.textTer,textTransform:"uppercase",letterSpacing:1}}>{u}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:T.border,borderRadius:100,height:5,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${T.text},#555)`,borderRadius:100,transition:"width 1s linear"}}/>
      </div>
      <p style={{fontSize:11,color:T.textTer,marginTop:6}}>Vos 3 crédits gratuits se rechargent automatiquement toutes les 24h.</p>
    </div>
  )
}

/* ═══════════════════════════════════════
   PAYWALL MODAL (nice CTA, no nagging)
═══════════════════════════════════════ */
function PaywallModal({onClose,onSignup}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(10,10,10,0.6)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn 0.2s ease"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:T.bgWhite,borderRadius:20,padding:"0",width:"100%",maxWidth:460,position:"relative",overflow:"hidden",boxShadow:T.shadowLg,animation:"scaleIn 0.3s ease"}}>
        {/* Top accent bar */}
        <div style={{height:4,background:`linear-gradient(90deg,${T.text},#555,${T.textSec})`}}/>
        <div style={{padding:"2.5rem 2.5rem 2rem"}}>
          <button onClick={onClose} style={{position:"absolute",top:18,right:18,background:"transparent",border:"none",fontSize:18,cursor:"pointer",color:T.textTer,lineHeight:1}}>✕</button>

          {/* Icon */}
          <div style={{width:56,height:56,background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"1.5rem",fontSize:26,boxShadow:T.shadow}}>✨</div>

          <h2 style={{fontSize:24,fontWeight:800,color:T.text,letterSpacing:-0.8,marginBottom:"0.5rem"}}>Continuez sans limite</h2>
          <p style={{fontSize:15,color:T.textSec,lineHeight:1.65,marginBottom:"2rem"}}>
            Vous avez utilisé vos 3 transcriptions gratuites. Passez au Pro pour un accès illimité à toutes les fonctionnalités.
          </p>
          <CreditResetTimer/>

          {/* Features */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:"2rem"}}>
            {["Transcriptions illimitées","8 outils IA inclus","Traduction 8 langues","Chat IA sur vos vidéos","Historique complet","Export .srt"].map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:7,fontSize:13,color:T.textSec}}>
                <div style={{width:16,height:16,borderRadius:"50%",background:T.text,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{color:"#fff",fontSize:9,fontWeight:700}}>✓</span>
                </div>
                {f}
              </div>
            ))}
          </div>

          {/* Price + CTA */}
          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"1.25rem",marginBottom:"1rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <p style={{fontSize:12,color:T.textTer,marginBottom:3}}>Plan Pro</p>
              <div style={{display:"flex",alignItems:"baseline",gap:3}}>
                <span style={{fontSize:28,fontWeight:800,color:T.text,letterSpacing:-1}}>5€</span>
                <span style={{fontSize:13,color:T.textTer}}>/mois</span>
              </div>
            </div>
            <DarkBtn onClick={onSignup} size="lg" style={{padding:"0 28px"}}>Commencer →</DarkBtn>
          </div>
          <p style={{textAlign:"center",fontSize:12,color:T.textTer}}>Sans engagement · Annulation en un clic</p>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   NAV
═══════════════════════════════════════ */
function Nav({view,setView,isLoggedIn,setShowAuth,isPro,logoClickCount,setLogoClickCount,user,onLogout}){
  function handleLogoClick(){
    const next=logoClickCount+1
    setLogoClickCount(next)
    if(next>=3){setView("admin");setLogoClickCount(0)}
    else setView("landing")
  }
  useEffect(()=>{
    function handleKey(e){
      if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==="a"){setView("admin")}
    }
    window.addEventListener("keydown",handleKey)
    return()=>window.removeEventListener("keydown",handleKey)
  },[])
  return(
    <nav style={{position:"sticky",top:0,left:0,right:0,zIndex:100,background:"rgba(248,248,246,0.96)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 2rem",height:56}}>
      <div style={{display:"flex",alignItems:"center",gap:28}}>
        <Logo onClick={handleLogoClick}/>
        {isLoggedIn&&(
          <div style={{display:"flex",gap:2}}>
            {[["app","Transcrire"],["dashboard","Dashboard"]].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)} style={{fontFamily:"'Inter',sans-serif",background:view===v?T.text:"transparent",color:view===v?"#fff":T.textSec,border:"none",fontSize:13,fontWeight:500,padding:"5px 12px",borderRadius:7,cursor:"pointer",transition:"all 0.15s"}}>{l}</button>
            ))}
          </div>
        )}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {!isLoggedIn&&(
          <>
            <button onClick={()=>setView("landing")} style={{fontFamily:"'Inter',sans-serif",background:"transparent",border:"none",fontSize:13,fontWeight:500,color:T.textSec,cursor:"pointer"}}>Fonctionnalités</button>
            <button onClick={()=>setView("landing")} style={{fontFamily:"'Inter',sans-serif",background:"transparent",border:"none",fontSize:13,fontWeight:500,color:T.textSec,cursor:"pointer"}}>Tarifs</button>
          </>
        )}
        {isLoggedIn?(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {isPro&&<div style={{display:"flex",alignItems:"center",gap:5,background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:6,padding:"4px 10px"}}><div style={{width:5,height:5,borderRadius:"50%",background:T.green}}/><span style={{fontSize:11,fontWeight:700,color:"#166534"}}>PRO</span></div>}
            <div style={{position:"relative",display:"flex",alignItems:"center",gap:6}}>
              <div onClick={()=>setView("profile")} title={user?.name||"Profil"} style={{width:32,height:32,borderRadius:"50%",background:T.text,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 0 rgba(0,0,0,0.3)"}}>
                <span style={{color:"#fff",fontSize:12,fontWeight:700}}>{user?.name?user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2):"SK"}</span>
              </div>
              <button onClick={onLogout} title="Se déconnecter" style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:7,padding:"5px 9px",fontSize:11,color:T.textSec,cursor:"pointer",fontWeight:500,fontFamily:"'Inter',sans-serif"}}>↩</button>
            </div>
          </div>
        ):(
          <div style={{display:"flex",gap:6}}>
            <OutlineBtn onClick={()=>setShowAuth("login")}>Connexion</OutlineBtn>
            <DarkBtn size="sm" onClick={()=>setShowAuth("signup")}>Essayer gratuitement</DarkBtn>
          </div>
        )}
      </div>
    </nav>
  )
}

/* ═══════════════════════════════════════
   FAQ COMPONENT
═══════════════════════════════════════ */
const FAQ_ITEMS = [
  {q:"Combien de transcriptions puis-je générer gratuitement ?",a:"3 transcriptions complètes sont incluses gratuitement, sans carte bancaire requise. Ensuite, le plan Pro à 5€/mois ou 48€/an vous offre un accès illimité."},
  {q:"Quelles langues sont supportées pour la traduction ?",a:"TranscriptIA supporte 8 langues : Anglais, Espagnol, Allemand, Italien, Portugais, Chinois, Japonais et Arabe. D'autres langues seront ajoutées prochainement."},
  {q:"Est-ce que mes transcriptions sont sauvegardées ?",a:"Oui, avec le plan Pro votre historique complet est conservé indéfiniment. Vous pouvez retrouver, télécharger et partager toutes vos transcriptions depuis votre tableau de bord."},
  {q:"Comment fonctionne le chatbot IA ?",a:"Après chaque transcription, vous pouvez poser n'importe quelle question sur le contenu de la vidéo. Le chatbot comprend le contexte complet et répond en français de façon précise."},
  {q:"Puis-je annuler mon abonnement à tout moment ?",a:"Oui, vous pouvez annuler votre abonnement à tout moment en un clic depuis votre tableau de bord. Aucun engagement, aucune pénalité."},
  {q:"Les vidéos privées fonctionnent-elles ?",a:"TranscriptIA fonctionne avec toutes les vidéos YouTube publiques. Les vidéos privées nécessitent d'être connecté au compte propriétaire — cette fonctionnalité est en cours de développement."},
]
function FaqItem({item}){
  const [open,setOpen]=useState(false)
  return(
    <div style={{borderBottom:`1px solid ${T.border}`,overflow:"hidden"}}>
      <button onClick={()=>setOpen(!open)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1.25rem 0",background:"transparent",border:"none",cursor:"pointer",textAlign:"left",gap:12}}>
        <span style={{fontSize:15,fontWeight:600,color:T.text,fontFamily:"'Inter',sans-serif"}}>{item.q}</span>
        <span style={{fontSize:20,color:T.textTer,transition:"transform 0.2s",transform:open?"rotate(45deg)":"rotate(0deg)",flexShrink:0,lineHeight:1}}>+</span>
      </button>
      {open&&<p style={{fontSize:14,color:T.textSec,lineHeight:1.8,paddingBottom:"1.25rem"}}>{item.a}</p>}
    </div>
  )
}
function FAQ(){
  return(
    <section style={{padding:"5.5rem 4rem",background:T.bgWhite,borderTop:`1px solid ${T.border}`}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:"3rem"}}>
          <SectionLabel>FAQ</SectionLabel>
          <h2 style={{fontSize:"2rem",fontWeight:800,color:T.text,letterSpacing:-1.2}}>Questions fréquentes</h2>
        </div>
        {FAQ_ITEMS.map((item,i)=><FaqItem key={i} item={item}/>)}
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════
   LANDING
═══════════════════════════════════════ */
function Landing({setView,setShowAuth,usageCount,isPro,reviews,setReviews,adminCounterMin=100,adminCounterMax=2000}){
  const [url,setUrl]=useState("")
  const [focused,setFocused]=useState(false)

  const [annual,setAnnual]=useState(false)
  const useCases=[
    {icon:"🎓",role:"Étudiants",desc:"Transformez cours et conférences YouTube en notes textuelles instantanées.",color:"#EEF2FF",accent:"#6366F1"},
    {icon:"🎬",role:"Créateurs",desc:"Réutilisez vos vidéos : articles, posts, newsletters générés automatiquement.",color:"#FFF7ED",accent:"#F97316"},
    {icon:"📰",role:"Journalistes",desc:"Transcrivez interviews et reportages. Retrouvez chaque citation horodatée.",color:"#F0FDF4",accent:"#22C55E"},
    {icon:"🔬",role:"Chercheurs",desc:"Analysez des heures de contenu, extrayez les points clés, comparez.",color:"#FDF4FF",accent:"#A855F7"},
  ]

  return(
    <div style={{minHeight:"100vh",paddingTop:56}}>

      {/* ── HERO ── */}
      <section className="grid-bg" style={{minHeight:"calc(100vh - 56px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"5rem 3rem 4rem",position:"relative",overflow:"hidden"}}>

        {/* Radial vignette */}
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 70% at 50% 45%,rgba(248,248,246,0) 0%,rgba(248,248,246,0.97) 100%)",pointerEvents:"none"}}/>

        {/* Soft glow spots */}
        <div style={{position:"absolute",top:"20%",left:"15%",width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:"25%",right:"12%",width:260,height:260,borderRadius:"50%",background:"radial-gradient(circle,rgba(249,115,22,0.07) 0%,transparent 70%)",pointerEvents:"none"}}/>

        {/* ── 3D CARD TOP-RIGHT — transcript preview ── */}
        <div className="float-a glow-card" style={{
          position:"absolute",top:"8%",right:"5%",width:200,height:130,
          background:T.bgWhite,borderRadius:16,border:`1px solid ${T.border}`,
          padding:"1.1rem",pointerEvents:"none",
          boxShadow:"0 8px 0 rgba(0,0,0,0.14),0 16px 40px rgba(0,0,0,0.1)"
        }}>
          {/* mini toolbar */}
          <div style={{display:"flex",gap:4,marginBottom:10}}>
            {["#FF5F57","#FEBC2E","#28C840"].map(col=><div key={col} style={{width:8,height:8,borderRadius:"50%",background:col}}/>)}
          </div>
          <div style={{width:"90%",height:5,background:"#0A0A0A",borderRadius:3,marginBottom:6,opacity:0.15}}/>
          <div style={{width:"75%",height:4,background:T.surface,borderRadius:2,marginBottom:5}}/>
          <div style={{width:"85%",height:4,background:T.surface,borderRadius:2,marginBottom:5}}/>
          <div style={{width:"60%",height:4,background:T.surface,borderRadius:2,marginBottom:10}}/>
          <div style={{display:"flex",gap:5}}>
            <div style={{height:18,width:50,background:"#0A0A0A",borderRadius:5,opacity:0.9}}/>
            <div style={{height:18,width:38,background:T.surface,borderRadius:5,border:`1px solid ${T.border}`}}/>
          </div>
        </div>

        {/* ── 3D CARD BOTTOM-LEFT — summary pill ── */}
        <div className="float-b" style={{
          position:"absolute",bottom:"14%",left:"4%",width:170,height:90,
          background:T.bgWhite,borderRadius:14,border:`1px solid ${T.border}`,
          padding:"0.875rem",pointerEvents:"none",
          boxShadow:"0 6px 0 rgba(0,0,0,0.12),0 12px 28px rgba(0,0,0,0.09)"
        }}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
            <div style={{width:18,height:18,background:"#0A0A0A",borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:"#fff",fontSize:9}}>✦</span>
            </div>
            <div style={{width:60,height:5,background:"#0A0A0A",borderRadius:2,opacity:0.2}}/>
          </div>
          <div style={{width:"95%",height:3,background:T.surface,borderRadius:2,marginBottom:4}}/>
          <div style={{width:"80%",height:3,background:T.surface,borderRadius:2,marginBottom:4}}/>
          <div style={{width:"88%",height:3,background:T.surface,borderRadius:2}}/>
        </div>

        {/* ── 3D CARD TOP-LEFT — stats ── */}
        <div className="float-c" style={{
          position:"absolute",top:"18%",left:"6%",width:130,height:76,
          background:T.bgWhite,borderRadius:12,border:`1px solid ${T.border}`,
          padding:"0.75rem",pointerEvents:"none",
          boxShadow:"0 5px 0 rgba(0,0,0,0.12),0 10px 22px rgba(0,0,0,0.08)"
        }}>
          <div style={{fontSize:9,color:T.textTer,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>Précision</div>
          <div style={{fontSize:22,fontWeight:800,color:T.text,letterSpacing:-1,fontFamily:"'DM Mono',monospace",lineHeight:1}}>98%</div>
          <div style={{marginTop:6,background:T.surface,borderRadius:100,height:3,overflow:"hidden"}}>
            <div style={{width:"98%",height:"100%",background:"#22C55E",borderRadius:100}}/>
          </div>
        </div>

        {/* ── 3D CARD BOTTOM-RIGHT — language badge ── */}
        <div className="float-a" style={{
          position:"absolute",bottom:"22%",right:"6%",width:110,height:60,
          background:"#0A0A0A",borderRadius:12,
          padding:"0.75rem",pointerEvents:"none",
          boxShadow:"0 5px 0 rgba(0,0,0,0.35),0 10px 24px rgba(0,0,0,0.25)",
          animationDelay:"2s"
        }}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.45)",fontFamily:"'DM Mono',monospace",marginBottom:4}}>LANGUE</div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {["FR","EN","ES","DE"].map(l=>(
              <span key={l} style={{fontSize:8,fontWeight:700,color:l==="FR"?"#0A0A0A":"rgba(255,255,255,0.5)",background:l==="FR"?"#fff":"rgba(255,255,255,0.08)",padding:"1px 5px",borderRadius:3,fontFamily:"'DM Mono',monospace"}}>{l}</span>
            ))}
          </div>
        </div>

        {/* ── DOTS GRID decoration ── */}
        <div style={{position:"absolute",top:"35%",right:"2%",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,pointerEvents:"none",opacity:0.3}}>
          {Array.from({length:16}).map((_,i)=>(
            <div key={i} style={{width:4,height:4,borderRadius:"50%",background:T.text,animation:`dotPulse 2s ease ${(i*0.15)%2}s infinite`}}/>
          ))}
        </div>
        <div style={{position:"absolute",bottom:"30%",left:"1%",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,pointerEvents:"none",opacity:0.2}}>
          {Array.from({length:9}).map((_,i)=>(
            <div key={i} style={{width:4,height:4,borderRadius:"50%",background:T.text,animation:`dotPulse 2.4s ease ${(i*0.2)%2}s infinite`}}/>
          ))}
        </div>

        {/* ── CENTER CONTENT ── */}
        <div style={{maxWidth:860,width:"100%",textAlign:"center",position:"relative",zIndex:2,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center"}}>
          {/* Status pill */}
          <div className="fade-up" style={{display:"inline-flex",alignItems:"center",gap:8,background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:100,padding:"6px 18px",fontSize:12,fontWeight:500,color:T.textSec,marginBottom:"2rem",boxShadow:"0 3px 0 rgba(0,0,0,0.08),0 6px 16px rgba(0,0,0,0.05)"}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:T.green,display:"inline-block",boxShadow:"0 0 6px rgba(34,197,94,0.6)"}}/>
            YouTube en texte en quelques secondes
          </div>

          {/* Main headline */}
          <h1 className="fade-up-d1" style={{fontSize:"clamp(3rem,8vw,5.2rem)",fontWeight:900,lineHeight:1.06,letterSpacing:-3.5,marginBottom:"1.5rem"}}>
            <span style={{color:T.text}}>Transcrivez n'importe</span><br/>
            <span style={{
              color:"transparent",
              backgroundImage:`linear-gradient(135deg,${T.text} 0%,#555 50%,${T.textTer} 100%)`,
              WebkitBackgroundClip:"text",backgroundClip:"text"
            }}>quelle vidéo YouTube</span>
          </h1>

          <p className="fade-up-d2" style={{fontSize:16,color:T.textSec,lineHeight:1.8,maxWidth:600,margin:"0 auto 2.5rem",fontWeight:400}}>
            Collez un lien, obtenez une transcription propre. Résumé IA automatique, traduction, chat — tout inclus.
          </p>

          {/* Input 3D */}
          <div className="fade-up-d3" style={{
            display:"flex",alignItems:"center",background:T.bgWhite,
            border:`1.5px solid ${focused?T.text:T.border}`,borderRadius:14,
            padding:"10px 10px 10px 24px",maxWidth:820,margin:"0 auto 1rem",
            boxShadow:focused
              ?"0 8px 0 rgba(0,0,0,0.14),0 14px 30px rgba(0,0,0,0.1)"
              :"0 6px 0 rgba(0,0,0,0.10),0 10px 24px rgba(0,0,0,0.07)",
            transform:focused?"translateY(-3px)":"translateY(0)",transition:"all 0.2s cubic-bezier(0.34,1.56,0.64,1)"
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{flexShrink:0,marginRight:10}}>
              <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.845v6.31a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" stroke={T.textTer} strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <input value={url} onChange={e=>setUrl(e.target.value)}
              placeholder="Collez le lien YouTube ici..."
              onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
              onKeyDown={e=>e.key==="Enter"&&setView("app")}
              style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.text,fontSize:18,fontFamily:"'Inter',sans-serif",height:52}}/>
            <DarkBtn onClick={()=>setView("app")} style={{height:54,padding:"0 28px",fontSize:16,borderRadius:11}}>Générer →</DarkBtn>
          </div>

          <p className="fade-up-d3" style={{fontSize:12,color:T.textTer}}>3 transcriptions gratuites · sans carte bancaire</p>

          <div className="fade-up-d4" style={{display:"flex",justifyContent:"center",marginTop:"1.5rem"}}>
            <LiveCounter adminMin={counterMin} adminMax={counterMax}/>
          </div>

          {/* Stats row */}
          <div className="fade-up-d4" style={{display:"flex",justifyContent:"center",gap:"0",marginTop:"2.5rem",paddingTop:"2rem",borderTop:`1px solid ${T.border}`}}>
            {[["12k+","vidéos traitées"],["98%","précision IA"],["< 10s","temps moyen"]].map(([n,l],i)=>(
              <div key={n} style={{textAlign:"center",flex:1,padding:"0 1.5rem",borderRight:i<2?`1px solid ${T.border}`:"none"}}>
                <div style={{fontSize:22,fontWeight:800,color:T.text,letterSpacing:-1,...mono}}>{n}</div>
                <div style={{fontSize:11,color:T.textTer,marginTop:4,letterSpacing:0.3}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STEPS ── */}
      <section style={{padding:"5.5rem 4rem",background:T.bg,borderTop:`1px solid ${T.border}`,position:"relative",overflow:"hidden"}}>
        {/* bg decoration */}
        <div style={{position:"absolute",top:-60,right:-60,width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.04) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{maxWidth:1160,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"3.5rem"}}>
            <SectionLabel>Comment ça marche</SectionLabel>
            <h2 style={{fontSize:"2rem",fontWeight:800,color:T.text,letterSpacing:-1.2}}>3 étapes simples</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,position:"relative"}}>
            {/* connecting dashed line */}
            <div style={{position:"absolute",top:36,left:"20%",right:"20%",height:1,backgroundImage:`repeating-linear-gradient(90deg,${T.borderMid} 0,${T.borderMid} 6px,transparent 6px,transparent 12px)`,zIndex:0}}/>
            {[
              {icon:"🔗",n:"01",t:"Collez le lien",d:"Copiez l'URL de n'importe quelle vidéo YouTube",color:"#EEF2FF",ic:"#6366F1"},
              {icon:"✨",n:"02",t:"Transcription IA",d:"Notre IA extrait et analyse le contenu en secondes",color:"#FFF7ED",ic:"#F97316"},
              {icon:"⬇️",n:"03",t:"Utilisez & téléchargez",d:"Résumé auto, chat IA, export .txt et .srt",color:"#F0FDF4",ic:"#22C55E"},
            ].map((s,i)=>(
              <div key={s.n} className="card-3d" style={{
                background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:18,
                padding:"2rem 1.5rem",textAlign:"center",position:"relative",zIndex:1,
                boxShadow:"0 6px 0 rgba(0,0,0,0.08),0 10px 24px rgba(0,0,0,0.05)"
              }}>
                {/* step number badge */}
                <div style={{position:"absolute",top:14,right:14,fontSize:9,fontWeight:800,color:T.textTer,...mono,letterSpacing:1}}>{s.n}</div>
                <div style={{width:58,height:58,background:s.color,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.25rem",fontSize:26,boxShadow:`0 5px 0 ${s.ic}30,0 8px 18px ${s.ic}20`}}>
                  <span>{s.icon}</span>
                </div>
                <h3 style={{fontSize:15,fontWeight:700,color:T.text,marginBottom:8}}>{s.t}</h3>
                <p style={{fontSize:13,color:T.textSec,lineHeight:1.7}}>{s.d}</p>
                {/* bottom accent line */}
                <div style={{position:"absolute",bottom:0,left:"20%",right:"20%",height:3,background:s.ic,borderRadius:"0 0 3px 3px",opacity:0.6}}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section style={{padding:"5.5rem 4rem",background:T.bgWhite,borderTop:`1px solid ${T.border}`}}>
        <div style={{maxWidth:1160,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"3rem"}}><SectionLabel>Cas d'usage</SectionLabel><h2 style={{fontSize:"2rem",fontWeight:800,color:T.text,letterSpacing:-1.2}}>Fait pour tout le monde</h2></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
            {useCases.map(u=>(
              <div key={u.role} className="card-3d" style={{background:u.color,border:`1px solid ${T.border}`,borderRadius:16,padding:"2rem",boxShadow:T.shadow}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1rem"}}>
                  <div style={{width:44,height:44,borderRadius:11,background:u.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:`0 4px 0 ${u.accent}60`}}>{u.icon}</div>
                  <h3 style={{fontSize:16,fontWeight:700,color:T.text}}>{u.role}</h3>
                </div>
                <p style={{fontSize:13,color:T.textSec,lineHeight:1.7}}>{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section style={{padding:"5.5rem 4rem",background:T.bg,borderTop:`1px solid ${T.border}`}}>
        <div style={{maxWidth:1160,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"3rem"}}><SectionLabel>Témoignages</SectionLabel><h2 style={{fontSize:"2rem",fontWeight:800,color:T.text,letterSpacing:-1.2}}>Ils nous font confiance</h2></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {reviews.filter(r=>r.visible).map((r,i)=>{
              const colors=["#6366F1","#F97316","#22C55E"]
              return(
                <div key={r.id} className="card-3d" style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:16,padding:"1.75rem",boxShadow:T.shadow}}>
                  <div style={{display:"flex",marginBottom:"0.875rem"}}>{[1,2,3,4,5].map(s=><span key={s} style={{color:"#FBBF24",fontSize:13}}>★</span>)}</div>
                  <p style={{fontSize:13,color:T.textSec,lineHeight:1.8,marginBottom:"1.25rem",fontStyle:"italic"}}>"{r.text}"</p>
                  <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:"1rem",borderTop:`1px solid ${T.border}`}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:colors[i%colors.length],display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 3px 0 ${colors[i%colors.length]}60`}}>
                      <span style={{fontSize:11,fontWeight:700,color:"#fff"}}>{r.author.split(" ").map(w=>w[0]).join("").slice(0,2)}</span>
                    </div>
                    <div>
                      <p style={{fontSize:13,fontWeight:600,color:T.text}}>{r.author}</p>
                      <p style={{fontSize:11,color:T.textTer}}>{r.role}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{padding:"5.5rem 4rem",background:T.bgWhite,borderTop:`1px solid ${T.border}`}}>
        <div style={{maxWidth:760,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"2rem"}}><SectionLabel>Tarifs</SectionLabel><h2 style={{fontSize:"2rem",fontWeight:800,color:T.text,letterSpacing:-1.2}}>Simple et honnête</h2></div>
          {/* Annual toggle */}
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:12,marginBottom:"2.5rem"}}>
            <span style={{fontSize:14,fontWeight:500,color:annual?T.textTer:T.text}}>Mensuel</span>
            <div onClick={()=>setAnnual(!annual)} style={{width:48,height:26,borderRadius:100,background:annual?T.text:T.border,cursor:"pointer",position:"relative",transition:"background 0.2s",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.1)"}}>
              <div style={{position:"absolute",top:3,left:annual?24:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 2px 4px rgba(0,0,0,0.25)"}}/>
            </div>
            <span style={{fontSize:14,fontWeight:500,color:annual?T.text:T.textTer}}>Annuel</span>
            {annual&&<span style={{fontSize:11,fontWeight:700,background:"#F0FDF4",color:T.green,padding:"3px 10px",borderRadius:20,border:"1px solid #BBF7D0"}}>-20% 🎉</span>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[
              {n:"Gratuit",p:"0€",per:"",f:["3 transcriptions","Export .txt","Interface complète"],hot:false,cta:"Commencer",stripeLink:null},
              {n:"Pro",p:annual?"48€":"5€",per:annual?"/an":"/mois",f:["Transcriptions illimitées","Résumé automatique","Traduction 8 langues","Chat IA","Export .srt","Historique complet","Tags & favoris","Support prioritaire"],hot:true,cta:annual?"Passer au Pro Annuel":"Passer au Pro",stripeLink:annual?"https://buy.stripe.com/annual_link":"https://buy.stripe.com/monthly_link"},
            ].map(pl=>(
              <div key={pl.n} className="card-3d" style={{background:pl.hot?T.text:T.bgWhite,border:`1.5px solid ${pl.hot?T.text:T.border}`,borderRadius:16,padding:"2rem",position:"relative",boxShadow:pl.hot?"0 8px 0 rgba(0,0,0,0.25),0 16px 40px rgba(0,0,0,0.12)":T.shadow}}>
                {pl.hot&&<div style={{position:"absolute",top:-11,right:14,background:T.orange,color:"#fff",fontSize:9,fontWeight:700,padding:"3px 12px",borderRadius:20,letterSpacing:0.5,boxShadow:"0 3px 8px rgba(249,115,22,0.4)"}}>RECOMMANDÉ</div>}
                <p style={{fontSize:10,fontWeight:700,color:pl.hot?"rgba(255,255,255,0.4)":T.textTer,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,...mono}}>{pl.n}</p>
                <div style={{display:"flex",alignItems:"baseline",gap:3,marginBottom:"1.5rem"}}>
                  <span style={{fontSize:32,fontWeight:800,color:pl.hot?"#fff":T.text,letterSpacing:-1.5}}>{pl.p}</span>
                  <span style={{fontSize:13,color:pl.hot?"rgba(255,255,255,0.4)":T.textTer}}>{pl.per}</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:"1.75rem"}}>
                  {pl.f.map(f=>(
                    <div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:pl.hot?"rgba(255,255,255,0.75)":T.textSec}}>
                      <div style={{width:16,height:16,borderRadius:"50%",background:pl.hot?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontSize:9,fontWeight:700,color:pl.hot?"#fff":T.text}}>✓</span>
                      </div>{f}
                    </div>
                  ))}
                </div>
                {pl.hot
                  ?<button onClick={()=>{if(pl.stripeLink)window.open(pl.stripeLink,"_blank");else setShowAuth("signup")}} style={{fontFamily:"'Inter',sans-serif",width:"100%",height:46,background:"#fff",color:T.text,border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 3px 0 rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><span>💳</span>{pl.cta}</button>
                  :<OutlineBtn full onClick={()=>setShowAuth("signup")} style={{width:"100%",justifyContent:"center",height:44}}>{pl.cta}</OutlineBtn>
                }
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQ/>

      {/* ── FINAL CTA ── */}
      <section className="grid-bg" style={{padding:"6rem 4rem",borderTop:`1px solid ${T.border}`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"rgba(248,248,246,0.6)",pointerEvents:"none"}}/>
        <div style={{maxWidth:700,margin:"0 auto",textAlign:"center",position:"relative",zIndex:1}}>
          <h2 style={{fontSize:"2.2rem",fontWeight:800,color:T.text,letterSpacing:-1.2,marginBottom:"1rem"}}>Prêt à commencer ?</h2>
          <p style={{fontSize:15,color:T.textSec,lineHeight:1.7,marginBottom:"2.5rem"}}>Rejoignez des milliers d'utilisateurs qui transcrivent chaque jour.</p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <DarkBtn onClick={()=>setShowAuth("signup")} size="lg" style={{boxShadow:T.shadow3d}}>Essayer gratuitement →</DarkBtn>
            <OutlineBtn onClick={()=>setView("app")} style={{height:52,padding:"0 24px",fontSize:15}}>Voir une démo</OutlineBtn>
          </div>
          <p style={{fontSize:12,color:T.textTer,marginTop:"1.5rem"}}>3 transcriptions gratuites · Sans carte bancaire</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{borderTop:`1px solid ${T.border}`,padding:"2rem",background:T.bgWhite,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <Logo onClick={()=>{}}/>
        <p style={{fontSize:12,color:T.textTer}}>© 2025 KEVININDUSTRIE · Tous droits réservés</p>
        <div style={{display:"flex",gap:"1.5rem",alignItems:"center"}}>
          <span onClick={()=>setView("mentions")} style={{fontSize:12,color:T.textTer,cursor:"pointer"}}>Mentions légales</span>
          <span onClick={()=>setView("cgu")} style={{fontSize:12,color:T.textTer,cursor:"pointer"}}>CGU</span>
          <span onClick={()=>setView("cgv")} style={{fontSize:12,color:T.textTer,cursor:"pointer"}}>CGV</span>
          <span onClick={()=>setView("rgpd")} style={{fontSize:12,color:T.textTer,cursor:"pointer"}}>Confidentialité</span>
          <a href="mailto:contact@transcriptia.app" style={{fontSize:12,color:T.textTer,textDecoration:"none"}}>Contact</a>
          <span onClick={()=>setView("status")} style={{fontSize:12,color:T.textTer,cursor:"pointer"}}>Statut</span>
        </div>
      </footer>
    </div>
  )
}

/* ═══════════════════════════════════════
   APP VIEW
═══════════════════════════════════════ */
function AppView({usageCount,setUsageCount,isPro,setShowAuth,transcripts,setTranscripts}){
  // Demo data removed

  const DEMO_CITATIONS = [
    {text:"Les personnes ultra-productives ne gèrent pas leur temps — elles le conçoivent.",context:"Distinction fondamentale entre subir et choisir son organisation"},
    {text:"Le cerveau n'est pas une machine. Les meilleurs performers protègent leur récupération avec la même rigueur qu'une réunion importante.",context:"L'importance négligée du repos intentionnel"},
    {text:"Chaque individu a une fenêtre de deux à quatre heures par jour où ses capacités cognitives sont au sommet.",context:"Science du rythme circadien appliquée à la productivité"},
  ]

  const [url,setUrl]=useState("")
  const [phase,setPhase]=useState("idle")
  const [progress,setProg]=useState(100)
  const [elapsed,setElapsed]=useState(0)
  const [tx,setTx]=useState(null)
  const [tab,setTab]=useState("transcript")
  const [txTab,setTxTab]=useState("raw")
  const [aiOut,setAiOut]=useState(null)
  const [aiTool,setAiTool]=useState(null)
  const [aiLoading,setAiLoad]=useState(false)
  const [error,setError]=useState("")
  const [copied,setCopied]=useState(false)
  const [chatHistory,setChatHistory]=useState([
    {role:"user",content:"Quelle est la 3ème habitude mentionnée ?"},
    {role:"assistant",content:"La 3ème habitude est la gestion de l'énergie plutôt que du temps. L'idée est d'identifier ses pics d'énergie cognitifs — une fenêtre de 2 à 4h par jour selon la science du rythme circadien — et d'aligner ses tâches les plus exigeantes sur ces moments."},
  ])
  const [chatInput,setChatInput]=useState("")
  const [chatLoading,setChatLoad]=useState(false)
  const [citations,setCitations]=useState(DEMO_CITATIONS)
  const [citeLoading,setCiteLoad]=useState(false)
  const [targetLang,setTargetLang]=useState("English")
  const [translated,setTranslated]=useState(null)
  const [transLoading,setTransLoad]=useState(false)
  const [detectedLang,setDetectedLang]=useState("Français")
  const [autoSummary,setAutoSummary]=useState(null)
  const [autoSumLoading,setAutoSumLoad]=useState(false)
  const [autoSumCopied,setAutoSumCopied]=useState(false)
  const [showPaywall,setShowPaywall]=useState(false)
  const chatEndRef=useRef()
  const elapsedRef=useRef()

  const canGo=isPro||usageCount<FREE_LIMIT
  useShortcuts({"ctrl+enter":()=>{if(url)generate()}})
  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:"smooth"})},[chatHistory])

  async function generateAutoSummary(transcript){
    setAutoSumLoad(true);setAutoSummary(null)
    try{
      const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:`Génère un résumé automatique structuré en français. Format:\n\n**En bref**\n[une phrase percutante]\n\n**Résumé**\n[3-4 phrases claires]\n\n**Points essentiels**\n- [point 1]\n- [point 2]\n- [point 3]\n\nTranscription:\n${transcript}`}]})})
      const d=await r.json();setAutoSummary(d.content[0].text)
    }catch{setAutoSummary("Erreur lors de la génération.")}
    setAutoSumLoad(false)
  }

  async function generate(){
    if(!url.trim()){setError("Collez une URL YouTube.");return}
    if(!url.includes("youtube.com")&&!url.includes("youtu.be")){setError("URL YouTube invalide.");return}
    if(!canGo){setShowPaywall(true);return}
    setError("");setPhase("loading");setProg(0);setElapsed(0)
    setAiOut(null);setAiTool(null);setChatHistory([]);setCitations([]);setTranslated(null);setAutoSummary(null)
    const piv=setInterval(()=>setProg(p=>Math.min(p+7,90)),280)
    elapsedRef.current=setInterval(()=>setElapsed(e=>e+1),1000)
    try{
      const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`Génère une transcription réaliste (~400 mots) en français pour: ${url}\nRéponds UNIQUEMENT en JSON valide (sans backticks):\n{"title":"...","duration":"MM:SS","channel":"...","detectedLang":"Français","rawTranscript":"...","timestamped":[{"time":"0:00","text":"..."},{"time":"0:14","text":"..."},{"time":"0:30","text":"..."},{"time":"0:48","text":"..."},{"time":"1:06","text":"..."},{"time":"1:25","text":"..."},{"time":"1:44","text":"..."},{"time":"2:03","text":"..."},{"time":"2:24","text":"..."},{"time":"2:48","text":"..."}]}`}]})})
      clearInterval(piv);clearInterval(elapsedRef.current);setProg(100)
      const d=await r.json()
      const parsed=JSON.parse(d.content[0].text.replace(/```json|```/g,"").trim())
      setTx(parsed);setDetectedLang(parsed.detectedLang||"Français")
      setTranscripts(prev=>[{id:Date.now(),url,...parsed,date:new Date().toLocaleDateString("fr-FR"),favorite:false,tags:[],shareId:`tx_${Date.now()}`},...prev])
      setUsageCount(c=>c+1)
      toast("Transcription générée !","success")
      setTimeout(()=>{setPhase("done");generateAutoSummary(parsed.rawTranscript)},300)
    }catch{
      clearInterval(piv);clearInterval(elapsedRef.current)
      setError("Erreur. Réessayez.");setPhase("idle");toast("Erreur","error")
    }
  }

  const aiTools=[{k:"keypoints",l:"Points clés"},{k:"article",l:"Article"},{k:"social",l:"Social"},{k:"tldr",l:"TL;DR"}]
  const aiPrompts={keypoints:t=>`6 points clés en français:\n\n${t}`,article:t=>`Article de blog structuré en français:\n\n${t}`,social:t=>`3 posts (LinkedIn, X, Instagram) en français:\n\n${t}`,tldr:t=>`Une phrase TL;DR percutante en français:\n\n${t}`}

  async function runAI(k){
    if(!tx)return;setAiTool(k);setAiLoad(true);setAiOut(null)
    try{
      const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:aiPrompts[k](tx.rawTranscript)}]})})
      const d=await r.json();setAiOut(d.content[0].text);toast(`${aiTools.find(t=>t.k===k)?.l} généré !`,"success")
    }catch{setAiOut("Erreur.")}
    setAiLoad(false)
  }
  async function sendChat(){
    if(!chatInput.trim()||!tx)return
    const msg=chatInput.trim();setChatInput("")
    setChatHistory(p=>[...p,{role:"user",content:msg}]);setChatLoad(true)
    try{
      const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,messages:[{role:"user",content:`Réponds en français à cette question sur la transcription:\n\n${tx.rawTranscript}\n\nQuestion: ${msg}`}]})})
      const d=await r.json();setChatHistory(p=>[...p,{role:"assistant",content:d.content[0].text}])
    }catch{setChatHistory(p=>[...p,{role:"assistant",content:"Erreur."}])}
    setChatLoad(false)
  }
  async function extractCitations(){
    if(!tx)return;setCiteLoad(true);setCitations([])
    try{
      const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:700,messages:[{role:"user",content:`Extrais 5 citations mémorables. JSON valide:\n{"citations":[{"text":"...","context":"..."}]}\n\n${tx.rawTranscript}`}]})})
      const d=await r.json();const p=JSON.parse(d.content[0].text.replace(/```json|```/g,"").trim());setCitations(p.citations||[]);toast("Citations extraites !","success")
    }catch{setCitations([{text:"Erreur.",context:""}])}
    setCiteLoad(false)
  }
  async function translate(){
    if(!tx)return;setTransLoad(true);setTranslated(null)
    try{
      const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:900,messages:[{role:"user",content:`Traduis en ${targetLang}:\n\n${tx.rawTranscript}`}]})})
      const d=await r.json();setTranslated(d.content[0].text);toast(`Traduit en ${targetLang} !`,"success")
    }catch{setTranslated("Erreur.")}
    setTransLoad(false)
  }
  function copy(text){navigator.clipboard?.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),1400);toast("Copié !","info")}
  function dl(ext){
    if(!tx)return
    const c=ext==="srt"?tx.timestamped.map((t,i)=>`${i+1}\n${t.time} --> ${tx.timestamped[i+1]?.time||"99:59"}\n${t.text}\n`).join("\n"):tx.rawTranscript
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([c],{type:"text/plain"}));a.download=`${tx.title}.${ext}`;a.click()
    toast(`Téléchargement .${ext}`,"info")
  }
  function dlPdf(){
    if(!tx)return
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${tx.title}</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Helvetica Neue',Arial,sans-serif;color:#0A0A0A;padding:48px 56px;max-width:760px;margin:0 auto}
      .header{border-bottom:2px solid #0A0A0A;padding-bottom:24px;margin-bottom:32px}
      .logo{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:12px}
      h1{font-size:26px;font-weight:800;line-height:1.2;letter-spacing:-0.5px;margin-bottom:8px}
      .meta{font-size:13px;color:#666;font-family:'Courier New',monospace}
      .badge{display:inline-block;background:#F2F2F0;border:1px solid #E4E4E0;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:600;margin-right:6px}
      .section{margin-bottom:36px}
      .section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#A0A0A8;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #E4E4E0;font-family:'Courier New',monospace}
      .transcript{font-size:14px;line-height:1.9;color:#333}
      .row{display:flex;gap:20px;margin-bottom:10px;align-items:flex-start}
      .ts{font-size:11px;font-weight:700;color:#F97316;min-width:36px;margin-top:2px;font-family:'Courier New',monospace}
      .footer{margin-top:48px;padding-top:20px;border-top:1px solid #E4E4E0;font-size:11px;color:#A0A0A8;display:flex;justify-content:space-between;font-family:'Courier New',monospace}
    </style></head><body>
      <div class="header">
        <div class="logo">TranscriptIA</div>
        <h1>${tx.title}</h1>
        <div class="meta">
          <span class="badge">${tx.channel}</span>
          <span class="badge">${tx.duration}</span>
          <span class="badge">${tx.detectedLang||"Français"}</span>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Transcription complète</div>
        <div class="transcript">${tx.rawTranscript.split('\n').join('<br>')}</div>
      </div>
      <div class="section">
        <div class="section-title">Version horodatée</div>
        ${tx.timestamped.map(t=>`<div class="row"><span class="ts">${t.time}</span><span class="transcript">${t.text}</span></div>`).join("")}
      </div>
      <div class="footer"><span>TranscriptIA · transcriptai.app</span><span>Généré le ${new Date().toLocaleDateString("fr-FR")}</span></div>
    </body></html>`
    const blob=new Blob([html],{type:"text/html"})
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${tx.title}.html`;a.click()
    toast("Export HTML/PDF prêt à imprimer","success")
  }
  function toggleFav(){if(!tx)return;setTranscripts(prev=>prev.map(t=>t.title===tx.title?{...t,favorite:!t.favorite}:t));toast("Favori mis à jour","info")}
  const currentMeta=transcripts.find(t=>t.title===tx?.title)
  // Only transcript tab now

  function renderSummaryLine(line,i){
    if(!line)return null
    if(line.startsWith("**")&&line.endsWith("**"))return <p key={i} style={{fontWeight:700,color:T.text,fontSize:11,textTransform:"uppercase",letterSpacing:0.8,marginBottom:5,marginTop:i>0?14:0}}>{line.replace(/\*\*/g,"")}</p>
    if(line.startsWith("- "))return <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:5}}><span style={{color:T.text,fontWeight:700,marginTop:2,flexShrink:0}}>·</span><span style={{fontSize:13,color:T.textSec,lineHeight:1.65}}>{line.slice(2)}</span></div>
    if(line.trim())return <p key={i} style={{fontSize:13,color:T.textSec,lineHeight:1.75,marginBottom:4}}>{line}</p>
    return null
  }

  return(
    <div style={{minHeight:"100vh",background:T.bg}}>
      {showPaywall&&<PaywallModal onClose={()=>setShowPaywall(false)} onSignup={()=>{setShowPaywall(false)}}/>}

      {/* URL BAR */}
      <div style={{background:T.bgWhite,borderBottom:`1px solid ${T.border}`,padding:"0.875rem 2rem",boxShadow:"0 1px 0 rgba(0,0,0,0.04)"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{display:"flex",gap:8,alignItems:"center",background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"5px 5px 5px 14px",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.04)"}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{flexShrink:0,marginRight:4}}>
              <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.845v6.31a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" stroke={T.textTer} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."
              onKeyDown={e=>e.key==="Enter"&&generate()}
              style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.text,fontSize:13,fontFamily:"'Inter',sans-serif",height:36}}/>
            <DarkBtn onClick={generate} disabled={phase==="loading"} style={{height:36,padding:"0 16px",fontSize:13,boxShadow:"0 2px 0 rgba(0,0,0,0.25)"}}>
              {phase==="loading"?"Traitement…":"Transcrire →"}
            </DarkBtn>
          </div>
          {error&&<p style={{color:T.red,fontSize:11,marginTop:5,...mono}}>{error}</p>}
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:4}}>
            <p style={{fontSize:10,color:T.textTer,...mono}}>Ctrl+Enter pour lancer</p>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"1.5rem 2rem"}}>

        {/* IDLE */}
        {phase==="idle"&&(
          <div className="grid-bg" style={{border:`1px solid ${T.border}`,borderRadius:16,padding:"5rem 2rem",textAlign:"center",animation:"fadeUp 0.4s ease",boxShadow:T.shadow}}>
            <div style={{width:52,height:52,background:T.text,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.25rem",fontSize:22,boxShadow:T.shadow3d}}>🎬</div>
            <p style={{color:T.textSec,fontSize:15,fontWeight:600,marginBottom:4}}>Prêt à transcrire</p>
            <p style={{color:T.textTer,fontSize:13}}>Collez une URL YouTube · <span style={{color:T.text,fontWeight:600,...mono}}>Ctrl+Enter</span></p>
          </div>
        )}

        {/* LOADING */}
        {phase==="loading"&&(
          <div style={{border:`1px solid ${T.border}`,borderRadius:16,padding:"3.5rem 2.5rem",textAlign:"center",background:T.bgWhite,boxShadow:T.shadowMd,animation:"fadeUp 0.3s ease"}}>
            <div style={{width:56,height:56,background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.5rem",fontSize:24,boxShadow:T.shadow}}>⚡</div>
            <p style={{fontSize:17,fontWeight:700,color:T.text,marginBottom:4}}>Traitement en cours</p>
            <p style={{fontSize:13,color:T.textSec,marginBottom:"2rem"}}>Extraction et analyse de la vidéo…</p>
            <div style={{maxWidth:360,margin:"0 auto 0.75rem"}}>
              <div style={{background:T.border,borderRadius:100,height:8,overflow:"hidden",marginBottom:6,boxShadow:"inset 0 1px 3px rgba(0,0,0,0.08)"}}>
                <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${T.text},#555)`,borderRadius:100,transition:"width 0.3s ease",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)",animation:"shimmer 1.4s infinite",backgroundSize:"200% 100%"}}/>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:11,color:T.textTer,...mono}}>{progress}%</span>
                <span style={{fontSize:11,color:T.orange,fontWeight:600,...mono,animation:"ticker 1s infinite"}}>⏱ {elapsed}s</span>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:"1.25rem"}}>
              {[{l:"Connexion",done:progress>20},{l:"Extraction",done:progress>55},{l:"Analyse",done:progress>85}].map(s=>(
                <div key={s.l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:s.done?T.text:T.textTer}}>
                  <div style={{width:16,height:16,borderRadius:"50%",background:s.done?T.text:T.border,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:s.done?"0 2px 0 rgba(0,0,0,0.2)":"none"}}>
                    {s.done?<span style={{color:"#fff",fontSize:9}}>✓</span>:<div style={{width:5,height:5,borderRadius:"50%",background:T.borderMid}}/>}
                  </div>{s.l}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DONE */}
        {phase==="done"&&tx&&(
          <div style={{display:"flex",flexDirection:"column",gap:10,animation:"fadeUp 0.4s ease"}}>
            {/* Meta */}
            <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:12,padding:"1rem 1.25rem",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:T.shadow}}>
              <div>
                <p style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:2}}>{tx.title}</p>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <p style={{fontSize:12,color:T.textSec}}>{tx.channel} · {tx.duration}</p>
                  {detectedLang&&<span style={{fontSize:10,fontWeight:600,background:"#EFF6FF",color:T.blue,padding:"2px 8px",borderRadius:5,border:"1px solid #BFDBFE",...mono}}>🌐 {detectedLang}</span>}
                  {isPro&&<span style={{fontSize:10,fontWeight:700,background:"#F0FDF4",color:"#166534",padding:"2px 8px",borderRadius:5,border:"1px solid #BBF7D0",...mono}}>✓ PRO</span>}
                </div>
              </div>
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                <button onClick={toggleFav} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:16,opacity:currentMeta?.favorite?1:0.25,transition:"opacity 0.2s"}}>⭐</button>
                <button onClick={()=>copy(`https://transcriptai.app/share/${currentMeta?.shareId}`)} style={{fontFamily:"'Inter',sans-serif",background:"transparent",border:`1px solid ${T.border}`,borderRadius:6,padding:"4px 10px",color:T.textSec,fontSize:11,cursor:"pointer"}}>🔗</button>
                <OutlineBtn size="sm" onClick={()=>dl("txt")}>↓ .txt</OutlineBtn>
                <OutlineBtn size="sm" onClick={()=>dl("srt")}>↓ .srt</OutlineBtn>
                <OutlineBtn size="sm" onClick={dlPdf}>↓ PDF</OutlineBtn>
              </div>
            </div>

            {/* AUTO SUMMARY */}
            <div style={{background:T.bgWhite,border:`1.5px solid ${T.border}`,borderRadius:12,overflow:"hidden",boxShadow:T.shadowMd}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.875rem 1.25rem",borderBottom:`1px solid ${T.border}`,background:"linear-gradient(135deg,#F8F8F6,#FFFFFF)"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:30,height:30,background:T.text,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,boxShadow:"0 3px 0 rgba(0,0,0,0.2)"}}>✦</div>
                  <div>
                    <p style={{fontSize:13,fontWeight:700,color:T.text}}>Résumé automatique</p>
                    <p style={{fontSize:11,color:T.textTer}}>Généré par IA dès la transcription</p>
                  </div>
                </div>
                {autoSummary&&!autoSumLoading&&(
                  <button onClick={()=>{navigator.clipboard?.writeText(autoSummary);setAutoSumCopied(true);setTimeout(()=>setAutoSumCopied(false),1400);toast("Résumé copié !","info")}}
                    style={{fontFamily:"'Inter',sans-serif",height:28,padding:"0 10px",background:autoSumCopied?T.surface:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:6,fontSize:11,fontWeight:500,color:T.textSec,cursor:"pointer",transition:"all 0.2s"}}>
                    {autoSumCopied?"✓ Copié":"Copier"}
                  </button>
                )}
              </div>
              <div style={{padding:"1.25rem 1.5rem",minHeight:80}}>
                {autoSumLoading&&(
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:16,height:16,border:`2px solid ${T.border}`,borderTop:`2px solid ${T.text}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <p style={{fontSize:13,color:T.textSec,marginBottom:6}}>Génération du résumé…</p>
                      <div style={{background:T.border,borderRadius:100,height:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:"60%",background:`linear-gradient(90deg,${T.text},#888)`,borderRadius:100,animation:"shimmer 1.5s infinite",backgroundSize:"200% 100%"}}/>
                      </div>
                    </div>
                  </div>
                )}
                {autoSummary&&!autoSumLoading&&(
                  <div>{autoSummary.split("\n").map((line,i)=>renderSummaryLine(line,i))}</div>
                )}
              </div>
            </div>



            {/* TRANSCRIPT TAB */}
            {tab==="transcript"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",boxShadow:T.shadow}}>
                  <div style={{display:"flex",alignItems:"center",borderBottom:`1px solid ${T.border}`,padding:"0 1.25rem"}}>
                    {[{k:"raw",l:"Brut"},{k:"timestamped",l:"Horodaté"}].map(t=>(
                      <button key={t.k} onClick={()=>setTxTab(t.k)} style={{fontFamily:"'Inter',sans-serif",padding:"0.8rem 0",marginRight:"1.5rem",fontSize:12,fontWeight:600,background:"transparent",border:"none",cursor:"pointer",color:txTab===t.k?T.text:T.textTer,borderBottom:`2px solid ${txTab===t.k?T.text:"transparent"}`,transition:"all 0.15s"}}>{t.l}</button>
                    ))}
                    <div style={{marginLeft:"auto"}}>
                      <button onClick={()=>copy(tx.rawTranscript)} style={{fontFamily:"'Inter',sans-serif",height:28,padding:"0 10px",background:copied?T.surface:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:6,fontSize:11,fontWeight:500,color:copied?T.text:T.textSec,cursor:"pointer",transition:"all 0.2s"}}>{copied?"✓ Copié":"Copier"}</button>
                    </div>
                  </div>
                  <div style={{padding:"1.25rem",maxHeight:240,overflowY:"auto"}}>
                    {txTab==="raw"?<p style={{fontSize:13,color:T.textSec,lineHeight:1.9}}>{tx.rawTranscript}</p>
                    :<div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {tx.timestamped.map((t,i)=>(
                        <div key={i} style={{display:"flex",gap:"1rem",alignItems:"flex-start"}}>
                          <span style={{fontSize:10,fontWeight:700,color:T.orange,flexShrink:0,marginTop:3,minWidth:34,...mono}}>{t.time}</span>
                          <span style={{fontSize:13,color:T.textSec,lineHeight:1.8}}>{t.text}</span>
                        </div>
                      ))}
                    </div>}
                  </div>
                </div>
                <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:12,padding:"1.125rem",boxShadow:T.shadow}}>
                  <p style={{fontSize:10,fontWeight:700,color:T.textTer,marginBottom:"0.875rem",textTransform:"uppercase",letterSpacing:1}}>Outils IA supplémentaires</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:aiOut||aiLoading?"0.875rem":0}}>
                    {aiTools.map(t=>(
                      <button key={t.k} onClick={()=>runAI(t.k)} style={{fontFamily:"'Inter',sans-serif",padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s",background:aiTool===t.k?T.text:T.surface,color:aiTool===t.k?"#fff":T.textSec,border:`1px solid ${aiTool===t.k?T.text:T.border}`,boxShadow:aiTool===t.k?"0 2px 0 rgba(0,0,0,0.2)":"none"}}>{t.l}</button>
                    ))}
                  </div>
                  {aiLoading&&<div style={{padding:"0.75rem",background:T.surface,borderRadius:8,display:"flex",alignItems:"center",gap:10,border:`1px solid ${T.border}`}}><div style={{width:14,height:14,border:`2px solid ${T.border}`,borderTop:`2px solid ${T.text}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/><span style={{fontSize:12,color:T.textSec}}>Génération…</span></div>}
                  {aiOut&&!aiLoading&&(
                    <div style={{background:T.surface,borderRadius:8,padding:"1rem",border:`1px solid ${T.border}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"}}>
                        <span style={{fontSize:10,fontWeight:700,color:T.text,textTransform:"uppercase",letterSpacing:0.8}}>{aiTools.find(t=>t.k===aiTool)?.l}</span>
                        <button onClick={()=>copy(aiOut)} style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:T.textSec,background:"transparent",border:"none",cursor:"pointer",fontWeight:500}}>Copier</button>
                      </div>
                      <p style={{fontSize:13,color:T.textSec,lineHeight:1.85,whiteSpace:"pre-wrap"}}>{aiOut}</p>
                    </div>
                  )}
                </div>
              </div>
            )}


          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   DASHBOARD USER
═══════════════════════════════════════ */
const TAG_COLORS=["#6366F1","#F97316","#22C55E","#F59E0B","#A855F7","#EC4899"]
function Dashboard({usageCount,isPro,setIsPro,transcripts,setTranscripts,setView}){
  const [filter,setFilter]=useState("all")
  const [activeTag,setActiveTag]=useState(null)
  const [addTagFor,setAddTagFor]=useState(null)
  const [tagDraft,setTagDraft]=useState("")

  const allTags=[...new Set(transcripts.flatMap(t=>t.tags||[]))]
  const filtered=transcripts.filter(t=>filter==="favorites"?t.favorite:true).filter(t=>activeTag?(t.tags||[]).includes(activeTag):true)
  function toggleFav(id){setTranscripts(p=>p.map(t=>t.id===id?{...t,favorite:!t.favorite}:t));toast("Favori mis à jour","info")}
  function addTag(id){if(!tagDraft.trim())return;setTranscripts(p=>p.map(t=>t.id===id?{...t,tags:[...(t.tags||[]),tagDraft.trim()]}:t));setTagDraft("");setAddTagFor(null);toast("Tag ajouté","success")}
  function removeTag(id,tag){setTranscripts(p=>p.map(t=>t.id===id?{...t,tags:(t.tags||[]).filter(tg=>tg!==tag)}:t))}

  const chartData=[2,5,3,7,4,8,usageCount].slice(-7)
  const maxV=Math.max(...chartData,1)

  return(
    <div style={{minHeight:"100vh",background:T.bg}}>
      <div style={{maxWidth:1160,margin:"0 auto",padding:"2rem 2rem"}}>
        <div style={{marginBottom:"1.75rem",paddingBottom:"1.25rem",borderBottom:`1px solid ${T.border}`}}>
          <SectionLabel>Tableau de bord</SectionLabel>
          <h1 style={{fontSize:26,fontWeight:800,color:T.text,letterSpacing:-1.2}}>Vue d'ensemble</h1>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:"1.25rem"}}>
          {[{l:"Transcriptions",v:usageCount,icon:"📄"},{l:"Favoris",v:transcripts.filter(t=>t.favorite).length,icon:"⭐"},{l:"Plan",v:isPro?"Pro":"Gratuit",icon:"🏷️",ac:isPro},{l:"Crédits",v:isPro?"∞":`${Math.max(FREE_LIMIT-usageCount,0)}/${FREE_LIMIT}`,icon:"🔄"}].map(s=>(
            <div key={s.l} className="card-3d" style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:12,padding:"1.125rem",boxShadow:T.shadow}}>
              <div style={{fontSize:18,marginBottom:8}}>{s.icon}</div>
              <p style={{fontSize:22,fontWeight:800,color:s.ac?T.orange:T.text,letterSpacing:-0.5,marginBottom:3}}>{s.v}</p>
              <p style={{fontSize:10,color:T.textTer,fontWeight:600,textTransform:"uppercase",letterSpacing:0.8}}>{s.l}</p>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:10,marginBottom:"1.25rem"}}>
          <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:12,padding:"1.25rem",boxShadow:T.shadow}}>
            <p style={{fontSize:10,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:"1.25rem"}}>Activité — 7 derniers jours</p>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,height:80}}>
              {chartData.map((v,i)=>{
                const days=["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"]
                return(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,position:"relative",cursor:"pointer"}}
                    onMouseEnter={e=>{const tt=document.createElement("div");tt.id=`tt-${i}`;tt.style.cssText=`position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:#0A0A0A;color:#fff;border-radius:7px;padding:5px 10px;font-size:11px;font-weight:600;white-space:nowrap;z-index:10;font-family:'DM Mono',monospace;pointer-events:none`;tt.textContent=`${v} transcription${v>1?'s':''}`;e.currentTarget.appendChild(tt)}}
                    onMouseLeave={e=>{const tt=e.currentTarget.querySelector(`#tt-${i}`);if(tt)tt.remove()}}>
                    <div style={{width:"100%",background:i===chartData.length-1?T.text:T.border,borderRadius:4,height:`${(v/maxV)*70}px`,transition:"height 0.3s ease",boxShadow:i===chartData.length-1?"0 3px 0 rgba(0,0,0,0.2)":"none"}}/>
                    <span style={{fontSize:9,color:T.textTer,...mono}}>{days[i]}</span>
                  </div>
                )
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>{["L","M","M","J","V","S","D"].map((d,i)=><span key={i} style={{fontSize:9,color:T.textTer,...mono}}>{d}</span>)}</div>
          </div>
          <div className="card-3d" style={{background:isPro?T.text:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:12,padding:"1.25rem",boxShadow:isPro?"0 8px 0 rgba(0,0,0,0.25),0 16px 40px rgba(0,0,0,0.12)":T.shadow}}>
            <p style={{fontSize:10,fontWeight:700,color:isPro?"rgba(255,255,255,0.4)":T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:"0.875rem"}}>Abonnement</p>
            <p style={{fontSize:18,fontWeight:800,color:isPro?"#fff":T.text,letterSpacing:-0.5,marginBottom:4}}>{isPro?"Plan Pro":"Plan Gratuit"}</p>
            <p style={{fontSize:12,color:isPro?"rgba(255,255,255,0.5)":T.textTer,marginBottom:"1.25rem"}}>{isPro?"5€ / mois · Actif":`${Math.max(FREE_LIMIT-usageCount,0)} crédit(s) restant(s) aujourd'hui`}</p>
            {isPro?<button onClick={()=>{setIsPro(false);toast("Annulé","warn")}} style={{fontFamily:"'Inter',sans-serif",height:34,width:"100%",background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer"}}>Annuler</button>
            :<DarkBtn full size="sm" onClick={()=>{setIsPro(true);toast("Bienvenue Pro !","success")}} style={{boxShadow:T.shadow3d}}>Passer au Pro →</DarkBtn>}
          </div>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:"1rem",flexWrap:"wrap",alignItems:"center"}}>
          {[["all",`Toutes (${transcripts.length})`],["favorites",`⭐ Favoris (${transcripts.filter(t=>t.favorite).length})`]].map(([v,l])=>(
            <OutlineBtn key={v} size="sm" active={filter===v} onClick={()=>setFilter(v)}>{l}</OutlineBtn>
          ))}
          {allTags.map((tag,ti)=>(
            <button key={tag} onClick={()=>setActiveTag(activeTag===tag?null:tag)} style={{fontFamily:"'Inter',sans-serif",padding:"4px 10px",borderRadius:5,fontSize:11,fontWeight:600,cursor:"pointer",background:activeTag===tag?TAG_COLORS[ti%TAG_COLORS.length]+"18":"transparent",color:TAG_COLORS[ti%TAG_COLORS.length],border:`1px solid ${TAG_COLORS[ti%TAG_COLORS.length]}40`,transition:"all 0.15s"}}>{tag}</button>
          ))}
        </div>
        <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden",boxShadow:T.shadow}}>
          <div style={{padding:"0.875rem 1.25rem",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{fontSize:10,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:1}}>Historique ({filtered.length})</p>
            <DarkBtn size="sm" onClick={()=>setView("app")} style={{boxShadow:"0 2px 0 rgba(0,0,0,0.2)"}}>+ Nouvelle</DarkBtn>
          </div>
          {filtered.length===0&&<div style={{padding:"3rem",textAlign:"center"}}><p style={{color:T.textTer,fontSize:13}}>Aucune transcription. <span style={{color:T.text,fontWeight:600,cursor:"pointer"}} onClick={()=>setView("app")}>Commencer !</span></p></div>}
          {filtered.map((t,i)=>(
            <div key={t.id} className="row-hover" style={{padding:"1rem 1.25rem",borderBottom:i<filtered.length-1?`1px solid ${T.border}`:"none",transition:"background 0.15s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                    <p style={{fontSize:13,fontWeight:600,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</p>
                    {t.favorite&&<span style={{fontSize:12}}>⭐</span>}
                  </div>
                  <p style={{fontSize:11,color:T.textTer,...mono,marginBottom:t.tags?.length?"6px":"0"}}>{t.channel} · {t.date} · {t.duration}</p>
                  {t.tags?.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{(t.tags||[]).map((tag,ti)=><span key={ti} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 7px",borderRadius:4,fontSize:10,fontWeight:600,background:TAG_COLORS[ti%TAG_COLORS.length]+"15",color:TAG_COLORS[ti%TAG_COLORS.length],border:`1px solid ${TAG_COLORS[ti%TAG_COLORS.length]}30`,...mono}}>{tag}<span onClick={()=>removeTag(t.id,tag)} style={{cursor:"pointer",opacity:0.6}}>✕</span></span>)}</div>}
                  {addTagFor===t.id&&<div style={{display:"flex",gap:6,marginTop:7}}><input value={tagDraft} onChange={e=>setTagDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTag(t.id)} placeholder="Nom du tag…" autoFocus style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontSize:11,padding:"4px 9px",fontFamily:"'Inter',sans-serif",outline:"none",width:110}}/><button onClick={()=>addTag(t.id)} style={{fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,color:T.text,background:"transparent",border:"none",cursor:"pointer"}}>Ajouter</button><button onClick={()=>setAddTagFor(null)} style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:T.textTer,background:"transparent",border:"none",cursor:"pointer"}}>Annuler</button></div>}
                </div>
                <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0}}>
                  <button onClick={()=>toggleFav(t.id)} style={{background:"transparent",border:"none",cursor:"pointer",opacity:t.favorite?1:0.25,fontSize:13,transition:"opacity 0.2s"}}>⭐</button>
                  <button onClick={()=>setAddTagFor(addTagFor===t.id?null:t.id)} style={{fontFamily:"'Inter',sans-serif",background:T.surface,border:`1px solid ${T.border}`,borderRadius:5,padding:"3px 8px",color:T.textSec,fontSize:10,cursor:"pointer",fontWeight:500}}>🏷️</button>
                  <button onClick={()=>{navigator.clipboard?.writeText(`https://transcriptai.app/share/${t.shareId}`);toast("Lien copié !","info")}} style={{fontFamily:"'Inter',sans-serif",background:T.surface,border:`1px solid ${T.border}`,borderRadius:5,padding:"3px 8px",color:T.textSec,fontSize:10,cursor:"pointer",fontWeight:500}}>🔗</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   ADMIN PANEL
═══════════════════════════════════════ */
function AdminPanel({setView,bannerConfig,setBannerConfig,maintenance,setMaintenance,promoCodes,setPromoCodes,counterMin,setCounterMin,counterMax,setCounterMax}){
  const [authed,setAuthed]=useState(false)
  const [pwd,setPwd]=useState("")
  const [pwdErr,setPwdErr]=useState(false)
  const [adminTab,setAdminTab]=useState("users")
  const [users,setUsers]=useState(INITIAL_USERS)
  const [reviews,setReviews]=useState(INITIAL_REVIEWS)
  const [editUser,setEditUser]=useState(null)
  const [editReview,setEditReview]=useState(null)
  const [search,setSearch]=useState("")
  const [confirmBan,setConfirmBan]=useState(null)

  function login(){
    if(pwd===ADMIN_PASSWORD){setAuthed(true);toast("Accès admin accordé","success")}
    else{setPwdErr(true);setTimeout(()=>setPwdErr(false),2000)}
  }

  function togglePro(id){setUsers(p=>p.map(u=>u.id===id?{...u,plan:u.plan==="pro"?"free":"pro",credits:u.plan==="pro"?3:999}:u));toast("Plan mis à jour","success")}
  function addCredits(id,n){setUsers(p=>p.map(u=>u.id===id?{...u,credits:Math.max(0,u.credits+n)}:u));toast(`+${n} crédit(s) ajouté(s)`,"success")}
  function banUser(id){setUsers(p=>p.map(u=>u.id===id?{...u,banned:!u.banned}:u));setConfirmBan(null);toast("Statut ban mis à jour","warn")}
  function saveReview(id,text){setReviews(p=>p.map(r=>r.id===id?{...r,text}:r));setEditReview(null);toast("Avis modifié","success")}
  function toggleReview(id){setReviews(p=>p.map(r=>r.id===id?{...r,visible:!r.visible}:r));toast("Visibilité modifiée","info")}

  const filteredUsers=users.filter(u=>u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase()))

  if(!authed) return(
    <div style={{minHeight:"100vh",background:T.bg,paddingTop:56,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:20,padding:"3rem",width:"100%",maxWidth:380,boxShadow:T.shadowLg,textAlign:"center",animation:"scaleIn 0.3s ease"}}>
        <div style={{width:56,height:56,background:T.text,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.5rem",fontSize:24,boxShadow:T.shadow3d}}>🛡️</div>
        <h2 style={{fontSize:22,fontWeight:800,color:T.text,letterSpacing:-0.8,marginBottom:4}}>Espace Admin</h2>
        <p style={{fontSize:13,color:T.textSec,marginBottom:"2rem"}}>Accès restreint · Authentification requise</p>
        <div style={{background:T.bg,border:`1.5px solid ${pwdErr?T.red:T.border}`,borderRadius:10,padding:"0 14px",height:46,display:"flex",alignItems:"center",marginBottom:10,transition:"border-color 0.2s"}}>
          <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Mot de passe administrateur" style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.text,fontSize:14,fontFamily:"'Inter',sans-serif"}}/>
        </div>
        {pwdErr&&<p style={{color:T.red,fontSize:12,marginBottom:8,...mono}}>Mot de passe incorrect</p>}
        <DarkBtn full size="lg" onClick={login} style={{boxShadow:T.shadow3d}}>Accéder →</DarkBtn>
        <button onClick={()=>setView("landing")} style={{fontFamily:"'Inter',sans-serif",background:"transparent",border:"none",color:T.textTer,fontSize:12,cursor:"pointer",marginTop:"1rem"}}>← Retour au site</button>
      </div>
    </div>
  )

  return(
    <div style={{minHeight:"100vh",background:T.bg}}>
      {/* Ban confirm */}
      {confirmBan&&(
        <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.2s"}}>
          <div style={{background:T.bgWhite,borderRadius:16,padding:"2rem",maxWidth:360,width:"90%",boxShadow:T.shadowLg,textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:"1rem"}}>{confirmBan.banned?"🔓":"🚫"}</div>
            <h3 style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:8}}>{confirmBan.banned?"Débannir cet utilisateur ?" :"Bannir cet utilisateur ?"}</h3>
            <p style={{fontSize:13,color:T.textSec,marginBottom:"1.5rem"}}>{confirmBan.name} · {confirmBan.email}</p>
            <div style={{display:"flex",gap:8}}>
              <OutlineBtn full onClick={()=>setConfirmBan(null)} style={{justifyContent:"center",height:42}}>Annuler</OutlineBtn>
              <DarkBtn full onClick={()=>banUser(confirmBan.id)} style={{background:confirmBan.banned?T.green:T.red,height:42}}>{confirmBan.banned?"Débannir":"Bannir"}</DarkBtn>
            </div>
          </div>
        </div>
      )}

      {/* Edit review modal */}
      {editReview&&(
        <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn 0.2s"}}>
          <div style={{background:T.bgWhite,borderRadius:16,padding:"2rem",maxWidth:480,width:"100%",boxShadow:T.shadowLg}}>
            <h3 style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:"1rem"}}>Modifier l'avis de {editReview.author}</h3>
            <textarea value={editReview.text} onChange={e=>setEditReview({...editReview,text:e.target.value})} style={{width:"100%",minHeight:100,background:T.bg,border:`1px solid ${T.border}`,borderRadius:9,color:T.text,fontSize:13,fontFamily:"'Inter',sans-serif",padding:"0.875rem",outline:"none",resize:"vertical",marginBottom:"1rem"}}/>
            <div style={{display:"flex",gap:8}}>
              <OutlineBtn full onClick={()=>setEditReview(null)} style={{justifyContent:"center",height:40}}>Annuler</OutlineBtn>
              <DarkBtn full onClick={()=>saveReview(editReview.id,editReview.text)} style={{height:40}}>Sauvegarder</DarkBtn>
            </div>
          </div>
        </div>
      )}

      <div style={{maxWidth:1300,margin:"0 auto",padding:"2rem"}}>
        {/* Admin header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"2rem",paddingBottom:"1.5rem",borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:44,height:44,background:T.text,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:T.shadow3d}}>🛡️</div>
            <div>
              <p style={{fontSize:10,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:1.5,...mono}}>Panel Administrateur</p>
              <h1 style={{fontSize:22,fontWeight:800,color:T.text,letterSpacing:-0.8}}>Gestion du site</h1>
            </div>
          </div>
          <button onClick={()=>setView("landing")} style={{fontFamily:"'Inter',sans-serif",background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:500,color:T.textSec,cursor:"pointer"}}>← Retour au site</button>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:"1.5rem"}}>
          {[
            {l:"Utilisateurs",v:users.length,icon:"👥"},
            {l:"Clients Pro",v:users.filter(u=>u.plan==="pro").length,icon:"⭐"},
            {l:"Bannis",v:users.filter(u=>u.banned).length,icon:"🚫"},
            {l:"Avis visibles",v:reviews.filter(r=>r.visible).length,icon:"💬"},
          ].map(s=>(
            <div key={s.l} className="card-3d" style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:12,padding:"1.125rem",boxShadow:T.shadow}}>
              <div style={{fontSize:20,marginBottom:8}}>{s.icon}</div>
              <p style={{fontSize:24,fontWeight:800,color:T.text,letterSpacing:-0.5,marginBottom:2}}>{s.v}</p>
              <p style={{fontSize:10,color:T.textTer,fontWeight:600,textTransform:"uppercase",letterSpacing:0.8}}>{s.l}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:4,background:T.surface,padding:4,borderRadius:10,border:`1px solid ${T.border}`,marginBottom:"1.25rem",width:"fit-content"}}>
          {[["users","👥 Utilisateurs"],["reviews","💬 Avis"],["banner","📢 Bannière"],["maintenance","🔧 Maintenance"],["counter","👁 Compteur"],["stats","📊 Stats"],["promo","🎟️ Promos"]].map(([k,l])=>(
            <button key={k} onClick={()=>setAdminTab(k)} style={{fontFamily:"'Inter',sans-serif",padding:"7px 18px",fontSize:13,fontWeight:600,background:adminTab===k?T.bgWhite:"transparent",color:adminTab===k?T.text:T.textTer,border:`1px solid ${adminTab===k?T.border:"transparent"}`,borderRadius:7,cursor:"pointer",transition:"all 0.15s",boxShadow:adminTab===k?T.shadow:"none"}}>{l}</button>
          ))}
        </div>

        {/* USERS TABLE */}
        {adminTab==="users"&&(
          <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",boxShadow:T.shadow}}>
            <div style={{padding:"1rem 1.25rem",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
              <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:1}}>Utilisateurs ({filteredUsers.length})</p>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par nom ou email…" style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:12,padding:"6px 12px",fontFamily:"'Inter',sans-serif",outline:"none",width:260}}/>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{background:T.surface}}>
                    {["Utilisateur","Email","Plan","Crédits","Inscrit","Transcrip.","Actions"].map(h=>(
                      <th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:10,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u,i)=>(
                    <tr key={u.id} className="row-hover" style={{borderTop:`1px solid ${T.border}`,opacity:u.banned?0.5:1,transition:"opacity 0.2s,background 0.15s"}}>
                      <td style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:32,height:32,borderRadius:"50%",background:T.surface,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:T.text,flexShrink:0}}>{u.avatar}</div>
                          <div>
                            <p style={{fontWeight:600,color:T.text}}>{u.name}</p>
                            {u.banned&&<span style={{fontSize:9,fontWeight:700,background:T.red+"15",color:T.red,padding:"1px 6px",borderRadius:3,...mono}}>BANNI</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{padding:"12px 16px",color:T.textSec,...mono,fontSize:12}}>{u.email}</td>
                      <td style={{padding:"12px 16px"}}>
                        <span style={{fontSize:11,fontWeight:700,background:u.plan==="pro"?"#F0FDF4":"#F5F5F5",color:u.plan==="pro"?"#166534":T.textSec,padding:"3px 10px",borderRadius:20,border:`1px solid ${u.plan==="pro"?"#BBF7D0":T.border}`}}>
                          {u.plan==="pro"?"⭐ Pro":"Gratuit"}
                        </span>
                      </td>
                      <td style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontWeight:600,color:T.text,...mono}}>{u.credits===999?"∞":u.credits}</span>
                          <button onClick={()=>addCredits(u.id,1)} style={{width:20,height:20,background:T.green+"20",border:`1px solid ${T.green}40`,borderRadius:4,cursor:"pointer",fontSize:12,color:T.green,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>+</button>
                          <button onClick={()=>addCredits(u.id,-1)} style={{width:20,height:20,background:T.red+"10",border:`1px solid ${T.red}30`,borderRadius:4,cursor:"pointer",fontSize:12,color:T.red,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>−</button>
                        </div>
                      </td>
                      <td style={{padding:"12px 16px",color:T.textSec,...mono,fontSize:11}}>{u.joined}</td>
                      <td style={{padding:"12px 16px",color:T.textSec,...mono,fontSize:12}}>{u.transcriptions}</td>
                      <td style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",gap:5}}>
                          <button onClick={()=>togglePro(u.id)} style={{fontFamily:"'Inter',sans-serif",height:28,padding:"0 10px",fontSize:11,fontWeight:600,background:u.plan==="pro"?T.surface:T.text,color:u.plan==="pro"?T.text:"#fff",border:`1px solid ${u.plan==="pro"?T.border:"transparent"}`,borderRadius:6,cursor:"pointer"}}>
                            {u.plan==="pro"?"→ Free":"→ Pro"}
                          </button>
                          <button onClick={()=>setConfirmBan(u)} style={{fontFamily:"'Inter',sans-serif",height:28,padding:"0 10px",fontSize:11,fontWeight:600,background:u.banned?T.green+"15":T.red+"10",color:u.banned?T.green:T.red,border:`1px solid ${u.banned?T.green+"40":T.red+"30"}`,borderRadius:6,cursor:"pointer"}}>
                            {u.banned?"Débannir":"Bannir"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {adminTab==="reviews"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {reviews.map(r=>(
              <div key={r.id} style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:12,padding:"1.25rem 1.5rem",boxShadow:T.shadow,opacity:r.visible?1:0.55,transition:"opacity 0.2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"0.75rem"}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:T.text,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff"}}>{r.author.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
                      <div>
                        <p style={{fontSize:13,fontWeight:600,color:T.text}}>{r.author}</p>
                        <p style={{fontSize:11,color:T.textTer}}>{r.role}</p>
                      </div>
                      <div style={{display:"flex"}}>{[1,2,3,4,5].map(s=><span key={s} style={{color:s<=r.stars?"#FBBF24":T.border,fontSize:13}}>★</span>)}</div>
                      {!r.visible&&<span style={{fontSize:10,fontWeight:700,background:T.red+"10",color:T.red,padding:"2px 7px",borderRadius:4,border:`1px solid ${T.red}30`,...mono}}>MASQUÉ</span>}
                    </div>
                    <p style={{fontSize:13,color:T.textSec,lineHeight:1.7,fontStyle:"italic"}}>"{r.text}"</p>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                    <button onClick={()=>setEditReview({...r})} style={{fontFamily:"'Inter',sans-serif",height:30,padding:"0 12px",fontSize:11,fontWeight:600,background:T.surface,border:`1px solid ${T.border}`,borderRadius:6,cursor:"pointer",color:T.text}}>✏️ Modifier</button>
                    <button onClick={()=>toggleReview(r.id)} style={{fontFamily:"'Inter',sans-serif",height:30,padding:"0 12px",fontSize:11,fontWeight:600,background:r.visible?T.red+"10":T.green+"10",border:`1px solid ${r.visible?T.red+"30":T.green+"40"}`,borderRadius:6,cursor:"pointer",color:r.visible?T.red:T.green}}>
                      {r.visible?"👁 Masquer":"👁 Afficher"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BANNER MANAGEMENT */}
        {adminTab==="banner"&&(
          <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:14,padding:"2rem",boxShadow:T.shadow}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.75rem"}}>
              <div>
                <p style={{fontSize:14,fontWeight:700,color:T.text}}>Gestion de la bannière d'annonce</p>
                <p style={{fontSize:12,color:T.textSec,marginTop:2}}>Modifiez le contenu affiché en haut du site en temps réel</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:12,color:T.textSec}}>Bannière {bannerConfig.enabled?"active":"désactivée"}</span>
                <div onClick={()=>setBannerConfig(p=>({...p,enabled:!p.enabled}))} style={{width:44,height:24,borderRadius:100,background:bannerConfig.enabled?T.green:T.border,cursor:"pointer",position:"relative",transition:"background 0.2s",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.1)"}}>
                  <div style={{position:"absolute",top:2,left:bannerConfig.enabled?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 2px 4px rgba(0,0,0,0.2)"}}/>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div style={{marginBottom:"1.5rem"}}>
              <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Aperçu</p>
              <div style={{borderRadius:8,overflow:"hidden",border:`1px solid ${T.border}`}}>
                <div style={{background:bannerConfig.bg,padding:"9px 1rem",display:"flex",alignItems:"center",justifyContent:"center",gap:10,position:"relative"}}>
                  <span style={{fontSize:13,color:bannerConfig.darkText?"#0A0A0A":"#fff",fontWeight:500}} dangerouslySetInnerHTML={{__html:bannerConfig.text}}/>
                  {bannerConfig.linkLabel&&<span style={{fontSize:12,color:bannerConfig.darkText?"#555":"rgba(255,255,255,0.75)",fontWeight:700,textDecoration:"underline"}}>{bannerConfig.linkLabel}</span>}
                  <span style={{position:"absolute",right:14,color:bannerConfig.darkText?"rgba(0,0,0,0.4)":"rgba(255,255,255,0.5)",fontSize:14}}>✕</span>
                </div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Texte (HTML accepté)</p>
                <textarea value={bannerConfig.text} onChange={e=>setBannerConfig(p=>({...p,text:e.target.value}))} style={{width:"100%",minHeight:80,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:12,fontFamily:"'DM Mono',monospace",padding:"10px 12px",outline:"none",resize:"vertical"}}/>
              </div>
              <div>
                <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Lien du bouton</p>
                <input value={bannerConfig.link} onChange={e=>setBannerConfig(p=>({...p,link:e.target.value}))} placeholder="https://..." style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:13,fontFamily:"'Inter',sans-serif",padding:"0 12px",height:40,outline:"none",marginBottom:8}}/>
                <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Label du bouton</p>
                <input value={bannerConfig.linkLabel} onChange={e=>setBannerConfig(p=>({...p,linkLabel:e.target.value}))} placeholder="En profiter →" style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:13,fontFamily:"'Inter',sans-serif",padding:"0 12px",height:40,outline:"none"}}/>
              </div>
            </div>

            {/* Color picker */}
            <div style={{marginTop:"1.25rem"}}>
              <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Couleur de fond</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                {["#0A0A0A","#1D4ED8","#7C3AED","#DC2626","#059669","#D97706","#DB2777","#0F172A","#1E293B"].map(col=>(
                  <div key={col} onClick={()=>setBannerConfig(p=>({...p,bg:col,darkText:false}))} style={{width:32,height:32,borderRadius:8,background:col,cursor:"pointer",border:`3px solid ${bannerConfig.bg===col?"#fff":"transparent"}`,boxShadow:bannerConfig.bg===col?`0 0 0 2px ${col}`:"none",transition:"all 0.15s"}}/>
                ))}
                <div onClick={()=>setBannerConfig(p=>({...p,bg:"#F3F4F6",darkText:true}))} style={{width:32,height:32,borderRadius:8,background:"#F3F4F6",cursor:"pointer",border:`3px solid ${bannerConfig.bg==="#F3F4F6"?T.text:"transparent"}`,boxShadow:bannerConfig.bg==="#F3F4F6"?`0 0 0 2px ${T.text}`:"none",transition:"all 0.15s",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:10}}>☀️</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:8}}>
                  <input type="color" value={bannerConfig.bg} onChange={e=>setBannerConfig(p=>({...p,bg:e.target.value}))} style={{width:32,height:32,borderRadius:8,border:"none",cursor:"pointer",padding:2}}/>
                  <span style={{fontSize:12,color:T.textSec}}>Personnalisée</span>
                </div>
              </div>
            </div>

            <div style={{marginTop:"1.25rem",display:"flex",alignItems:"center",gap:10}}>
              <div onClick={()=>setBannerConfig(p=>({...p,darkText:!p.darkText}))} style={{width:40,height:22,borderRadius:100,background:bannerConfig.darkText?T.text:T.border,cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
                <div style={{position:"absolute",top:2,left:bannerConfig.darkText?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
              </div>
              <span style={{fontSize:13,color:T.textSec}}>Texte sombre (pour fonds clairs)</span>
            </div>

            <div style={{marginTop:"1.5rem",paddingTop:"1.5rem",borderTop:`1px solid ${T.border}`,display:"flex",gap:8}}>
              <DarkBtn onClick={()=>toast("Bannière mise à jour !","success")} style={{boxShadow:T.shadow3d}}>✓ Sauvegarder</DarkBtn>
              <OutlineBtn onClick={()=>setBannerConfig(p=>({...p,enabled:false}))}>Masquer la bannière</OutlineBtn>
            </div>
          </div>
        )}
        {adminTab==="maintenance"&&(
          <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:14,padding:"2rem",boxShadow:T.shadow}}>
            {/* Header with big toggle */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"2rem",paddingBottom:"1.5rem",borderBottom:`1px solid ${T.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:48,height:48,background:maintenance.enabled?"#FEF2F2":T.surface,border:`1px solid ${maintenance.enabled?T.red+"30":T.border}`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🔧</div>
                <div>
                  <p style={{fontSize:15,fontWeight:700,color:T.text}}>Mode Maintenance</p>
                  <p style={{fontSize:12,color:maintenance.enabled?T.red:T.green,fontWeight:600,marginTop:2}}>{maintenance.enabled?"● Actif — site inaccessible aux visiteurs":"● Désactivé — site accessible normalement"}</p>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:13,fontWeight:500,color:maintenance.enabled?T.red:T.textSec}}>{maintenance.enabled?"Désactiver":"Activer"}</span>
                <div onClick={()=>setMaintenance(p=>({...p,enabled:!p.enabled}))} style={{
                  width:56,height:30,borderRadius:100,
                  background:maintenance.enabled?T.red:T.border,
                  cursor:"pointer",position:"relative",transition:"background 0.25s",
                  boxShadow:maintenance.enabled?"0 0 0 3px rgba(239,68,68,0.2)":"none"
                }}>
                  <div style={{position:"absolute",top:3,left:maintenance.enabled?28:3,width:24,height:24,borderRadius:"50%",background:"#fff",transition:"left 0.25s",boxShadow:"0 2px 6px rgba(0,0,0,0.2)"}}/>
                </div>
              </div>
            </div>

            {/* Warning banner */}
            {maintenance.enabled&&(
              <div style={{background:"#FEF2F2",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"0.875rem 1.25rem",marginBottom:"1.5rem",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:18,flexShrink:0}}>⚠️</span>
                <p style={{fontSize:13,color:"#991B1B",fontWeight:500}}>Le site est actuellement en maintenance. Les visiteurs voient la page de maintenance.</p>
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1.25rem"}}>
              <div>
                <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Titre de la page</p>
                <input value={maintenance.title} onChange={e=>setMaintenance(p=>({...p,title:e.target.value}))} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:13,fontFamily:"'Inter',sans-serif",padding:"0 12px",height:42,outline:"none"}}/>
              </div>
              <div>
                <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Retour estimé</p>
                <input value={maintenance.estimatedTime} onChange={e=>setMaintenance(p=>({...p,estimatedTime:e.target.value}))} placeholder="ex: Aujourd'hui à 18h00" style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:13,fontFamily:"'Inter',sans-serif",padding:"0 12px",height:42,outline:"none"}}/>
              </div>
            </div>

            <div style={{marginBottom:"1.5rem"}}>
              <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Message affiché aux visiteurs</p>
              <textarea value={maintenance.message} onChange={e=>setMaintenance(p=>({...p,message:e.target.value}))} style={{width:"100%",minHeight:90,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:13,fontFamily:"'Inter',sans-serif",padding:"10px 12px",outline:"none",resize:"vertical"}}/>
            </div>

            {/* Preview */}
            <div style={{marginBottom:"1.5rem"}}>
              <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Aperçu de la page</p>
              <div style={{background:T.bg,borderRadius:12,padding:"2rem",textAlign:"center",border:`1px solid ${T.border}`}}>
                <div style={{width:44,height:44,background:T.text,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1rem",fontSize:22}}>🔧</div>
                <div style={{display:"inline-flex",alignItems:"center",gap:6,background:T.bgWhite,border:`1px solid ${T.orange}40`,borderRadius:100,padding:"4px 12px",fontSize:11,fontWeight:600,color:T.orange,marginBottom:"0.875rem"}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:T.orange}}/>
                  Maintenance en cours
                </div>
                <p style={{fontSize:18,fontWeight:800,color:T.text,letterSpacing:-0.8,marginBottom:6}}>{maintenance.title||"Site en maintenance"}</p>
                <p style={{fontSize:12,color:T.textSec,maxWidth:300,margin:"0 auto"}}>{maintenance.message||"Message à configurer"}</p>
                {maintenance.estimatedTime&&<p style={{fontSize:11,color:T.textTer,marginTop:8}}>Retour estimé : {maintenance.estimatedTime}</p>}
              </div>
            </div>

            <div style={{display:"flex",gap:8,paddingTop:"1rem",borderTop:`1px solid ${T.border}`}}>
              <DarkBtn onClick={()=>{setMaintenance(p=>({...p,enabled:true}));toast("Mode maintenance activé ⚠️","warn")}} style={{background:T.red,boxShadow:"0 4px 0 rgba(239,68,68,0.3)"}}>⚠️ Activer la maintenance</DarkBtn>
              <OutlineBtn onClick={()=>{setMaintenance(p=>({...p,enabled:false}));toast("Site remis en ligne ✓","success")}}>✓ Remettre en ligne</OutlineBtn>
            </div>
          </div>
        )}

        {/* ── COUNTER TAB ── */}
        {adminTab==="counter"&&(
          <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:14,padding:"2rem",boxShadow:T.shadow}}>
            <p style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:4}}>Compteur de personnes actives</p>
            <p style={{fontSize:13,color:T.textSec,marginBottom:"2rem"}}>Le compteur oscillera aléatoirement entre ces deux valeurs de façon organique.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:"2rem"}}>
              {[["Minimum",counterMin,setCounterMin,1,5000],["Maximum",counterMax,setCounterMax,100,10000]].map(([label,val,setter,min,max])=>(
                <div key={label}>
                  <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>{label}</p>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <input type="range" min={min} max={max} step={50} value={val} onChange={e=>setter(Number(e.target.value))} style={{flex:1,accentColor:T.text}}/>
                    <span style={{fontSize:18,fontWeight:800,color:T.text,minWidth:68,textAlign:"right",...mono}}>{val.toLocaleString("fr-FR")}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"1.25rem",marginBottom:"1.5rem",textAlign:"center"}}>
              <p style={{fontSize:12,color:T.textSec,marginBottom:10}}>Aperçu en temps réel</p>
              <LiveCounter adminMin={counterMin} adminMax={counterMax}/>
            </div>
            <DarkBtn onClick={()=>toast("Compteur mis à jour !","success")} style={{boxShadow:T.shadow3d}}>✓ Sauvegarder</DarkBtn>
          </div>
        )}

        {/* ── STATS TAB ── */}
        {adminTab==="stats"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* KPI row */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[
                {l:"Revenus du mois",v:"247€",sub:"+12% vs mois dernier",up:true,icon:"💰"},
                {l:"Nouveaux abonnés",v:"34",sub:"+8 cette semaine",up:true,icon:"⭐"},
                {l:"Transcriptions",v:"1 284",sub:"ce mois",up:true,icon:"📄"},
                {l:"Taux conversion",v:"4.2%",sub:"-0.3% vs mois dernier",up:false,icon:"📈"},
              ].map(s=>(
                <div key={s.l} className="card-3d" style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:12,padding:"1.25rem",boxShadow:T.shadow}}>
                  <div style={{fontSize:20,marginBottom:8}}>{s.icon}</div>
                  <p style={{fontSize:22,fontWeight:800,color:T.text,letterSpacing:-0.5,marginBottom:3,...mono}}>{s.v}</p>
                  <p style={{fontSize:10,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>{s.l}</p>
                  <p style={{fontSize:11,color:s.up?T.green:T.red,fontWeight:600}}>{s.sub}</p>
                </div>
              ))}
            </div>
            {/* Revenue chart */}
            <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:14,padding:"1.5rem",boxShadow:T.shadow}}>
              <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:"1.25rem"}}>Revenus — 12 derniers mois (€)</p>
              <div style={{display:"flex",alignItems:"flex-end",gap:10,height:120}}>
                {[85,120,95,140,110,180,155,200,175,220,195,247].map((v,i)=>(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <span style={{fontSize:9,color:T.textTer,...mono}}>{v}€</span>
                    <div style={{width:"100%",background:i===11?T.text:T.border,borderRadius:"4px 4px 2px 2px",height:`${(v/247)*100}px`,transition:"height 0.3s",boxShadow:i===11?"0 4px 0 rgba(0,0,0,0.2)":"none"}}/>
                    <span style={{fontSize:9,color:T.textTer,...mono}}>{["A","S","O","N","D","J","F","M","A","M","J","J"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Top sources */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:14,padding:"1.5rem",boxShadow:T.shadow}}>
                <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:"1rem"}}>Sources de trafic</p>
                {[{s:"Google",pct:42,color:"#4285F4"},{s:"Direct",pct:28,color:T.text},{s:"Réseaux sociaux",pct:18,color:"#E1306C"},{s:"Autres",pct:12,color:T.textTer}].map(item=>(
                  <div key={item.s} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:500,color:T.text}}>{item.s}</span>
                      <span style={{fontSize:11,color:T.textTer,...mono}}>{item.pct}%</span>
                    </div>
                    <div style={{background:T.border,borderRadius:100,height:5,overflow:"hidden"}}>
                      <div style={{width:`${item.pct}%`,height:"100%",background:item.color,borderRadius:100}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:14,padding:"1.5rem",boxShadow:T.shadow}}>
                <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,marginBottom:"1rem"}}>Plans vendus</p>
                {[{p:"Pro Mensuel",n:21,rev:"105€"},{p:"Pro Annuel",n:6,rev:"288€"},{p:"Gratuit",n:247,rev:"0€"}].map(item=>(
                  <div key={item.p} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                    <span style={{fontSize:13,fontWeight:500,color:T.text}}>{item.p}</span>
                    <div style={{display:"flex",gap:12}}>
                      <span style={{fontSize:12,color:T.textSec,...mono}}>{item.n} users</span>
                      <span style={{fontSize:12,fontWeight:700,color:T.green,...mono}}>{item.rev}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PROMO CODES TAB ── */}
        {adminTab==="promo"&&(
          <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",boxShadow:T.shadow}}>
            <div style={{padding:"1rem 1.25rem",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:1}}>Codes promo ({promoCodes.length})</p>
<DarkBtn size="sm" onClick={()=>{
                const code=window.__newCode||""
                const input=document.getElementById("new-promo-input")
                const val=input?input.value.trim():""
                if(val){setPromoCodes(p=>[...p,{id:Date.now(),code:val.toUpperCase(),discount:"20%",type:"monthly",uses:0,maxUses:100,active:true,expires:"31/12/2025"}]);if(input)input.value="";toast("Code créé !","success")}
              }} style={{boxShadow:"0 2px 0 rgba(0,0,0,0.2)"}}>+ Créer</DarkBtn>
              <input id="new-promo-input" placeholder="Ex: SUMMER30" style={{fontFamily:"'Inter',sans-serif",height:34,padding:"0 12px",fontSize:12,background:"#F2F2F0",border:"1px solid #E4E4E0",borderRadius:7,color:"#0A0A0A",outline:"none",width:140}}/>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{background:T.surface}}>
                  {["Code","Réduction","Type","Utilisations","Expire","Statut","Actions"].map(h=>(
                    <th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:10,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:0.8,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((p,i)=>(
                  <tr key={p.id} className="row-hover" style={{borderTop:`1px solid ${T.border}`,transition:"background 0.15s",opacity:p.active?1:0.55}}>
                    <td style={{padding:"12px 16px"}}>
                      <span style={{fontWeight:700,color:T.text,...mono,background:T.surface,padding:"3px 10px",borderRadius:5,fontSize:12}}>{p.code}</span>
                    </td>
                    <td style={{padding:"12px 16px",fontWeight:700,color:T.green,...mono}}>{p.discount}</td>
                    <td style={{padding:"12px 16px",color:T.textSec,fontSize:12}}>{p.type==="annual"?"Annuel":"Mensuel"}</td>
                    <td style={{padding:"12px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:12,color:T.text,...mono}}>{p.uses}/{p.maxUses}</span>
                        <div style={{flex:1,background:T.border,borderRadius:100,height:4,overflow:"hidden",width:60}}>
                          <div style={{width:`${Math.min(100,(p.uses/p.maxUses)*100)}%`,height:"100%",background:p.uses>=p.maxUses?T.red:T.green,borderRadius:100}}/>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"12px 16px",color:T.textSec,fontSize:12,...mono}}>{p.expires}</td>
                    <td style={{padding:"12px 16px"}}>
                      <span style={{fontSize:11,fontWeight:700,background:p.active?"#F0FDF4":"#F5F5F5",color:p.active?T.green:T.textSec,padding:"3px 10px",borderRadius:20,border:`1px solid ${p.active?"#BBF7D0":T.border}`}}>
                        {p.active?"Actif":"Inactif"}
                      </span>
                    </td>
                    <td style={{padding:"12px 16px"}}>
                      <div style={{display:"flex",gap:5}}>
                        <button onClick={()=>setPromoCodes(prev=>prev.map(x=>x.id===p.id?{...x,active:!x.active}:x))} style={{fontFamily:"'Inter',sans-serif",height:28,padding:"0 10px",fontSize:11,fontWeight:600,background:p.active?T.red+"10":T.green+"15",color:p.active?T.red:T.green,border:`1px solid ${p.active?T.red+"30":T.green+"40"}`,borderRadius:6,cursor:"pointer"}}>
                          {p.active?"Désactiver":"Activer"}
                        </button>
                        <button onClick={()=>setPromoCodes(prev=>prev.filter(x=>x.id!==p.id))} style={{fontFamily:"'Inter',sans-serif",height:28,padding:"0 10px",fontSize:11,fontWeight:600,background:"transparent",color:T.textTer,border:`1px solid ${T.border}`,borderRadius:6,cursor:"pointer"}}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   AUTH MODAL
═══════════════════════════════════════ */
function AuthModal({mode,onClose,onAuth}){
  const [m,setM]=useState(mode)
  const [email,setEmail]=useState("")
  const [pwd,setPwd]=useState("")
  const [name,setName]=useState("")
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState("")
  const [fE,setFE]=useState(false)
  const [fP,setFP]=useState(false)
  const [fN,setFN]=useState(false)

  function Field({value,onChange,placeholder,type="text",focused,setFocused}){
    return(
      <div style={{background:T.bg,border:`1.5px solid ${focused?T.text:T.border}`,borderRadius:9,display:"flex",alignItems:"center",padding:"0 12px",height:46,transition:"all 0.15s",boxShadow:focused?"0 4px 0 rgba(0,0,0,0.07)":"none"}}>
        <input value={value} onChange={ev=>onChange(ev.target.value)} placeholder={placeholder} type={type} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} style={{flex:1,background:"transparent",border:"none",outline:"none",color:T.text,fontSize:14,fontFamily:"'Inter',sans-serif"}}/>
      </div>
    )
  }

  async function handleSubmit(){
    if(!email||!pwd){setErr("Remplissez tous les champs");return}
    if(pwd.length<6){setErr("Mot de passe trop court (6 min)");return}
    setLoading(true); setErr("")
    try{
      let res
      if(m==="signup"){
        res = await sbSignUp(email,pwd,name)
        if(res.error||res.msg){
          const msg = res.msg||res.error?.message||"Erreur inscription"
          // Email already exists
          if(msg.includes("already")||msg.includes("existe")){setErr("Email déjà utilisé — connectez-vous");setM("login")}
          else setErr(msg)
          setLoading(false); return
        }
        // Create profile in DB
        if(res.user?.id){
          await sb("profiles",{method:"POST",body:JSON.stringify({id:res.user.id,name:name||email.split("@")[0],email,plan:"free",credits:3})})
        }
        toast("Compte créé ! Vérifiez votre email ✉️","success")
        onAuth({user:res.user,token:res.access_token,name:name||email.split("@")[0]})
      } else {
        res = await sbSignIn(email,pwd)
        if(res.error||!res.access_token){
          setErr(res.error_description||res.error?.message||"Email ou mot de passe incorrect")
          setLoading(false); return
        }
        // Fetch profile
        const profile = await sb("profiles?id=eq."+res.user.id+"&select=*")
        const userData = {user:res.user,token:res.access_token,profile:profile?.data?.[0]}
        toast("Bienvenue sur TranscriptIA !","success")
        onAuth(userData)
      }
    } catch(e){
      setErr("Erreur réseau. Réessayez.")
    }
    setLoading(false)
  }

  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn 0.2s"}}
      onClick={ev=>ev.target===ev.currentTarget&&onClose()}>
      <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:20,padding:"2.5rem",width:"100%",maxWidth:400,position:"relative",boxShadow:T.shadowLg,animation:"scaleIn 0.3s ease"}}>
        <div style={{height:3,background:`linear-gradient(90deg,${T.text},#555)`,borderRadius:100,marginBottom:"2rem",marginLeft:"-2.5rem",marginRight:"-2.5rem",marginTop:"-2.5rem",borderTopLeftRadius:20,borderTopRightRadius:20}}/>
        <button onClick={onClose} style={{position:"absolute",top:18,right:18,background:"transparent",border:"none",fontSize:18,cursor:"pointer",color:T.textTer}}>✕</button>
        <Logo onClick={()=>{}}/>
        <h2 style={{fontSize:20,fontWeight:800,color:T.text,marginTop:"1.25rem",letterSpacing:-0.5}}>{m==="login"?"Bon retour !":"Créer un compte"}</h2>
        <p style={{fontSize:12,color:T.textSec,marginTop:3,marginBottom:"1.5rem"}}>{m==="login"?"Connectez-vous à votre espace":"3 transcriptions gratuites incluses"}</p>

        {/* Google OAuth button */}
        <button onClick={()=>sbGoogleLogin()} style={{fontFamily:"'Inter',sans-serif",width:"100%",height:46,background:T.bg,border:`1.5px solid ${T.border}`,borderRadius:9,fontSize:14,fontWeight:600,color:T.text,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:"1rem",transition:"all 0.15s"}}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continuer avec Google
        </button>

        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"1rem"}}>
          <div style={{flex:1,height:1,background:T.border}}/>
          <span style={{fontSize:11,color:T.textTer}}>ou par email</span>
          <div style={{flex:1,height:1,background:T.border}}/>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {m==="signup"&&<Field value={name} onChange={setName} placeholder="Prénom (optionnel)" focused={fN} setFocused={setFN}/>}
          <Field value={email} onChange={setEmail} placeholder="Adresse email" type="email" focused={fE} setFocused={setFE}/>
          <Field value={pwd} onChange={setPwd} placeholder="Mot de passe (6 caractères min)" type="password" focused={fP} setFocused={setFP}/>
          {err&&<p style={{fontSize:12,color:T.red,fontWeight:500,...mono,background:"#FEF2F2",padding:"8px 12px",borderRadius:7,border:`1px solid ${T.red}20`}}>{err}</p>}
          <DarkBtn full size="lg" onClick={handleSubmit} disabled={loading} style={{marginTop:2,boxShadow:T.shadow3d}}>
            {loading?<><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/> Chargement…</> : m==="login"?"Se connecter →":"Créer mon compte →"}
          </DarkBtn>
        </div>
        <p style={{textAlign:"center",fontSize:12,color:T.textSec,marginTop:"1.25rem"}}>
          {m==="login"?"Pas de compte ? ":"Déjà inscrit ? "}
          <span style={{color:T.text,cursor:"pointer",fontWeight:700}} onClick={()=>{setM(m==="login"?"signup":"login");setErr("")}}>{m==="login"?"S'inscrire gratuitement":"Se connecter"}</span>
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   EXIT INTENT POPUP
═══════════════════════════════════════ */
function ExitIntentPopup({onClose,onSignup}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn 0.3s ease"}}>
      <div style={{background:T.bgWhite,borderRadius:22,width:"100%",maxWidth:480,position:"relative",overflow:"hidden",boxShadow:"0 30px 80px rgba(0,0,0,0.18)",animation:"scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)"}}>
        {/* top gradient bar */}
        <div style={{height:4,background:"linear-gradient(90deg,#6366F1,#F97316,#22C55E)"}}/>
        <div style={{padding:"2.5rem"}}>
          <button onClick={onClose} style={{position:"absolute",top:20,right:20,background:"transparent",border:"none",fontSize:18,cursor:"pointer",color:T.textTer}}>✕</button>
          {/* emoji */}
          <div style={{fontSize:48,marginBottom:"1.25rem",textAlign:"center"}}>👋</div>
          <h2 style={{fontSize:24,fontWeight:900,color:T.text,letterSpacing:-1,textAlign:"center",marginBottom:"0.75rem",lineHeight:1.2}}>
            Attendez, restez encore !
          </h2>
          <p style={{fontSize:14,color:T.textSec,textAlign:"center",lineHeight:1.75,marginBottom:"2rem"}}>
            Vous partez déjà ? Essayez TranscriptIA gratuitement — <strong style={{color:T.text}}>3 transcriptions offertes</strong>, sans carte bancaire.
          </p>
          {/* feature pills */}
          <div style={{display:"flex",flexWrap:"wrap",gap:7,justifyContent:"center",marginBottom:"2rem"}}>
            {["✨ Résumé IA auto","💬 Chat sur la vidéo","🌐 Traduction 8 langues","⬇️ Export .txt & .srt"].map(f=>(
              <span key={f} style={{fontSize:12,fontWeight:500,background:T.surface,border:`1px solid ${T.border}`,borderRadius:100,padding:"5px 12px",color:T.textSec}}>{f}</span>
            ))}
          </div>
          <DarkBtn full size="lg" onClick={onSignup} style={{boxShadow:"0 8px 0 rgba(0,0,0,0.15),0 12px 30px rgba(0,0,0,0.1)",marginBottom:12}}>
            Essayer gratuitement — c'est gratuit →
          </DarkBtn>
          <p onClick={onClose} style={{textAlign:"center",fontSize:12,color:T.textTer,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3}}>
            Non merci, je pars sans essayer
          </p>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   STATUS PAGE
═══════════════════════════════════════ */
function StatusPage({setView}){
  const services=[
    {name:"Transcription IA",status:"operational",latency:"142ms",uptime:"99.98%"},
    {name:"API Claude",status:"operational",latency:"380ms",uptime:"99.95%"},
    {name:"Traduction",status:"operational",latency:"210ms",uptime:"99.97%"},
    {name:"Export fichiers",status:"operational",latency:"65ms",uptime:"100%"},
    {name:"Authentification",status:"operational",latency:"88ms",uptime:"100%"},
    {name:"Dashboard",status:"degraded",latency:"1.2s",uptime:"99.80%"},
  ]
  const incidents=[
    {date:"14 mars 2025",title:"Latence élevée sur la transcription",status:"resolved",desc:"Latence temporairement élevée due à une surcharge serveur. Résolu en 23 minutes."},
    {date:"02 mars 2025",title:"Interruption partielle de l'export",status:"resolved",desc:"Un bug affectait l'export .srt pour les vidéos longues. Correctif déployé."},
  ]
  const statusColors={operational:T.green,degraded:T.orange,outage:T.red}
  const statusLabels={operational:"Opérationnel",degraded:"Dégradé",outage:"Panne"}
  const overallOk=services.every(s=>s.status==="operational")
  const hasIssue=services.some(s=>s.status==="degraded")

  return(
    <div style={{minHeight:"100vh",background:T.bg}}>
      <div style={{maxWidth:960,margin:"0 auto",padding:"3rem 2rem"}}>
        <button onClick={()=>setView("landing")} style={{fontFamily:"'Inter',sans-serif",background:"transparent",border:"none",color:T.textSec,fontSize:13,cursor:"pointer",marginBottom:"2rem",display:"flex",alignItems:"center",gap:6}}>← Retour</button>
        {/* Header */}
        <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:18,padding:"2rem",marginBottom:16,boxShadow:T.shadow,textAlign:"center"}}>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:10,
            background:overallOk?"#F0FDF4":hasIssue?"#FFF7ED":"#FEF2F2",
            border:`1px solid ${overallOk?"#BBF7D0":hasIssue?T.orange+"40":T.red+"40"}`,
            borderRadius:100,padding:"10px 24px",marginBottom:"1rem"
          }}>
            <div style={{width:10,height:10,borderRadius:"50%",background:overallOk?T.green:hasIssue?T.orange:T.red,boxShadow:`0 0 8px ${overallOk?T.green:hasIssue?T.orange:T.red}80`,animation:"pulse2 2s infinite"}}/>
            <span style={{fontSize:15,fontWeight:700,color:overallOk?"#166534":hasIssue?"#92400E":"#991B1B"}}>
              {overallOk?"Tous les systèmes opérationnels":hasIssue?"Dégradation en cours":"Panne détectée"}
            </span>
          </div>
          <p style={{fontSize:12,color:T.textTer,...mono}}>Mis à jour le {new Date().toLocaleDateString("fr-FR")} à {new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</p>
        </div>

        {/* Services */}
        <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",boxShadow:T.shadow,marginBottom:16}}>
          <div style={{padding:"1rem 1.5rem",borderBottom:`1px solid ${T.border}`}}>
            <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:1,...mono}}>Services</p>
          </div>
          {services.map((s,i)=>(
            <div key={s.name} style={{padding:"1rem 1.5rem",borderBottom:i<services.length-1?`1px solid ${T.border}`:"none",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:statusColors[s.status],flexShrink:0,boxShadow:s.status!=="operational"?`0 0 6px ${statusColors[s.status]}`:""}}/>
                <span style={{fontSize:14,fontWeight:500,color:T.text}}>{s.name}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                <span style={{fontSize:11,color:T.textTer,...mono}}>latence {s.latency}</span>
                <span style={{fontSize:11,color:T.textTer,...mono}}>uptime {s.uptime}</span>
                <span style={{fontSize:11,fontWeight:700,color:statusColors[s.status]}}>{statusLabels[s.status]}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 90-day uptime bars */}
        <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:14,padding:"1.5rem",boxShadow:T.shadow,marginBottom:16}}>
          <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:1,...mono,marginBottom:"1.25rem"}}>Disponibilité — 90 derniers jours</p>
          {services.slice(0,3).map(s=>(
            <div key={s.name} style={{marginBottom:"1rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,fontWeight:500,color:T.text}}>{s.name}</span>
                <span style={{fontSize:11,color:T.textTer,...mono}}>{s.uptime}</span>
              </div>
              <div style={{display:"flex",gap:2}}>
                {Array.from({length:90}).map((_,i)=>{
                  const bad=s.status==="degraded"&&(i===88||i===45)
                  return <div key={i} style={{flex:1,height:20,borderRadius:2,background:bad?T.orange:T.green,opacity:bad?0.9:0.75}}/>
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Incidents */}
        <div style={{background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",boxShadow:T.shadow}}>
          <div style={{padding:"1rem 1.5rem",borderBottom:`1px solid ${T.border}`}}>
            <p style={{fontSize:11,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:1,...mono}}>Incidents passés</p>
          </div>
          {incidents.map((inc,i)=>(
            <div key={i} style={{padding:"1.25rem 1.5rem",borderBottom:i<incidents.length-1?`1px solid ${T.border}`:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <span style={{fontSize:10,fontWeight:700,background:"#F0FDF4",color:T.green,padding:"2px 8px",borderRadius:4,border:`1px solid #BBF7D0`,...mono}}>RÉSOLU</span>
                <span style={{fontSize:12,color:T.textTer,...mono}}>{inc.date}</span>
              </div>
              <p style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:4}}>{inc.title}</p>
              <p style={{fontSize:13,color:T.textSec,lineHeight:1.65}}>{inc.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   MAINTENANCE SCREEN
═══════════════════════════════════════ */
function MaintenanceScreen({maintenance,onAdminAccess}){
  const [clicks,setClicks]=useState(0)
  const [pwd,setPwd]=useState("")
  const [showPwd,setShowPwd]=useState(false)
  const [err,setErr]=useState(false)
  function handleLogoClick(){
    const n=clicks+1; setClicks(n)
    if(n>=5)setShowPwd(true)
  }
  function tryAdmin(){
    if(pwd===ADMIN_PASSWORD){onAdminAccess()}
    else{setErr(true);setTimeout(()=>setErr(false),2000)}
  }
  return(
    <div className="grid-bg" style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem",position:"relative",overflow:"hidden"}}>
      {/* Radial overlay */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 70% at 50% 50%,rgba(248,248,246,0) 0%,rgba(248,248,246,0.96) 100%)",pointerEvents:"none"}}/>
      {/* Glow */}
      <div style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(249,115,22,0.06) 0%,transparent 70%)",pointerEvents:"none"}}/>

      <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:480,animation:"fadeUp 0.6s ease"}}>
        {/* Animated wrench icon */}
        <div onClick={handleLogoClick} style={{
          width:80,height:80,background:T.text,borderRadius:22,
          display:"flex",alignItems:"center",justifyContent:"center",
          margin:"0 auto 2rem",fontSize:36,cursor:"pointer",
          boxShadow:"0 10px 0 rgba(0,0,0,0.2),0 16px 40px rgba(0,0,0,0.12)",
          animation:"glow 4s ease-in-out infinite"
        }}>🔧</div>

        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:T.bgWhite,border:`1px solid ${T.orange}40`,borderRadius:100,padding:"5px 16px",fontSize:12,fontWeight:600,color:T.orange,marginBottom:"1.5rem",boxShadow:T.shadow}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:T.orange,animation:"pulse2 1.5s ease infinite"}}/>
          Maintenance en cours
        </div>

        <h1 style={{fontSize:"clamp(2rem,5vw,3rem)",fontWeight:900,color:T.text,letterSpacing:-2,lineHeight:1.1,marginBottom:"1rem"}}>
          {maintenance.title}
        </h1>
        <p style={{fontSize:16,color:T.textSec,lineHeight:1.75,marginBottom:"2rem"}}>
          {maintenance.message}
        </p>

        {maintenance.estimatedTime&&(
          <div style={{display:"inline-flex",alignItems:"center",gap:10,background:T.bgWhite,border:`1px solid ${T.border}`,borderRadius:12,padding:"0.875rem 1.5rem",marginBottom:"2rem",boxShadow:T.shadow}}>
            <span style={{fontSize:16}}>⏱</span>
            <div style={{textAlign:"left"}}>
              <p style={{fontSize:10,color:T.textTer,textTransform:"uppercase",letterSpacing:1,...mono,marginBottom:2}}>Retour estimé</p>
              <p style={{fontSize:14,fontWeight:700,color:T.text}}>{maintenance.estimatedTime}</p>
            </div>
          </div>
        )}

        {/* Progress bar decoration */}
        <div style={{background:T.border,borderRadius:100,height:4,overflow:"hidden",maxWidth:280,margin:"0 auto 2rem"}}>
          <div style={{height:"100%",width:"65%",background:`linear-gradient(90deg,${T.text},#555)`,borderRadius:100,animation:"shimmer 2s linear infinite",backgroundSize:"200% 100%"}}/>
        </div>

        <div onClick={()=>window.location.reload()} style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:13,color:T.textTer,cursor:"pointer",fontWeight:500}}>
          <span style={{fontSize:14}}>↺</span> Rafraîchir la page
        </div>

        {/* Hidden admin access */}
        {showPwd&&(
          <div style={{marginTop:"2rem",animation:"fadeUp 0.3s ease"}}>
            <p style={{fontSize:11,color:T.textTer,marginBottom:8,...mono}}>Accès administrateur</p>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <div style={{background:T.bgWhite,border:`1.5px solid ${err?T.red:T.border}`,borderRadius:9,padding:"0 14px",height:42,display:"flex",alignItems:"center",transition:"border-color 0.2s"}}>
                <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryAdmin()} placeholder="Mot de passe" style={{background:"transparent",border:"none",outline:"none",color:T.text,fontSize:13,fontFamily:"'Inter',sans-serif",width:160}}/>
              </div>
              <DarkBtn size="sm" onClick={tryAdmin} style={{boxShadow:T.shadow3d}}>→</DarkBtn>
            </div>
            {err&&<p style={{color:T.red,fontSize:11,marginTop:6,...mono}}>Mot de passe incorrect</p>}
          </div>
        )}
      </div>

      {/* Bottom logo */}
      <div style={{position:"absolute",bottom:24,left:"50%",transform:"translateX(-50%)"}}>
        <Logo onClick={()=>{}}/>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════
   LEGAL PAGES — KEVININDUSTRIE
═══════════════════════════════════════════════ */
const COMPANY = {
  name:"KEVININDUSTRIE",siren:"932 737 992",
  forme:"Société par Actions Simplifiée (SAS)",capital:"500 €",
  adresse:"Paris, France",dirigeant:"Kévin Nedzvedsky",
  email:"contact@transcriptia.app",site:"https://transcriptia.app",
  creation:"05 septembre 2024",
}
const LEGAL_CONTENT = {
  mentions:{title:"Mentions légales",sections:[
    {h:"Éditeur du site",p:"Le site TranscriptIA est édité par KEVININDUSTRIE, Société par Actions Simplifiée (SAS) au capital de 500 €, immatriculée au Registre du Commerce et des Sociétés sous le numéro SIREN 932 737 992.

Siège social : Paris, France
Directeur de la publication : Kévin Nedzvedsky
Contact : contact@transcriptia.app"},
    {h:"Hébergement",p:"Le site est hébergé par Vercel Inc., 340 Pine Street Suite 701, San Francisco, CA 94104, États-Unis."},
    {h:"Propriété intellectuelle",p:"Le contenu du site TranscriptIA est la propriété exclusive de KEVININDUSTRIE et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction est interdite sans autorisation préalable."},
    {h:"Données personnelles",p:"Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contact : contact@transcriptia.app"},
  ]},
  cgu:{title:"Conditions Générales d'Utilisation",sections:[
    {h:"1. Objet",p:"Les présentes CGU régissent l'accès et l'utilisation du service TranscriptIA, édité par KEVININDUSTRIE. En accédant au service, vous acceptez sans réserve ces CGU."},
    {h:"2. Description du service",p:"TranscriptIA est un service de transcription automatique de vidéos YouTube par intelligence artificielle. Le service génère une transcription textuelle et un résumé à partir de l'URL d'une vidéo YouTube publique."},
    {h:"3. Accès au service",p:"L'accès au service est gratuit dans la limite de 3 transcriptions par jour. Au-delà, un abonnement Pro est requis (5€/mois). KEVININDUSTRIE se réserve le droit de modifier les conditions d'accès à tout moment."},
    {h:"4. Utilisation autorisée",p:"Le service est destiné à un usage personnel et professionnel licite. Il est interdit d'utiliser TranscriptIA pour transcrire des contenus protégés sans autorisation, des contenus illicites, ou à des fins de collecte massive de données."},
    {h:"5. Responsabilité",p:"KEVININDUSTRIE ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du service ou d'une inexactitude des transcriptions générées par l'IA."},
    {h:"6. Droit applicable",p:"Les présentes CGU sont soumises au droit français. Tout litige relève de la compétence exclusive des tribunaux compétents de Paris."},
  ]},
  rgpd:{title:"Politique de confidentialité",sections:[
    {h:"1. Responsable du traitement",p:"KEVININDUSTRIE (SIREN : 932 737 992), représentée par Kévin Nedzvedsky. Contact : contact@transcriptia.app"},
    {h:"2. Données collectées",p:"Nous collectons :
• Données d'identification : nom, adresse email
• Données de navigation : adresses IP, pages visitées
• Données d'utilisation : URLs transcrites, historique
• Données de paiement : traitées exclusivement par Stripe"},
    {h:"3. Finalités",p:"Vos données sont utilisées pour :
• Fournir et améliorer le service
• Gérer votre compte et votre abonnement
• Respecter nos obligations légales"},
    {h:"4. Conservation",p:"Vos données sont conservées pendant la durée d'utilisation du service, puis archivées 3 ans après la fin du contrat."},
    {h:"5. Vos droits",p:"Conformément au RGPD : droit d'accès, rectification, suppression, portabilité, limitation, opposition.
Contact : contact@transcriptia.app
Réclamation CNIL : www.cnil.fr"},
    {h:"6. Cookies",p:"Nous utilisons uniquement des cookies essentiels au fonctionnement du service. Aucun cookie publicitaire ou de tracking tiers n'est utilisé."},
    {h:"7. Sous-traitants",p:"Supabase (base de données, USA), Vercel (hébergement, USA), Stripe (paiement, USA), Anthropic (IA — transcriptions anonymisées uniquement)."},
  ]},
  cgv:{title:"Conditions Générales de Vente",sections:[
    {h:"1. Vendeur",p:"KEVININDUSTRIE, SAS, SIREN 932 737 992, Paris, France. Contact : contact@transcriptia.app"},
    {h:"2. Services proposés",p:"Abonnement Pro à 5€/mois ou 48€/an : transcriptions illimitées, résumés automatiques, export .srt et .txt, historique complet."},
    {h:"3. Prix",p:"Les prix sont indiqués en euros. En tant qu'entreprise en phase de démarrage, KEVININDUSTRIE ne facture pas de TVA (article 293 B du CGI)."},
    {h:"4. Paiement",p:"Le paiement est sécurisé via Stripe. Vos coordonnées bancaires ne sont jamais stockées par KEVININDUSTRIE."},
    {h:"5. Résiliation",p:"Vous pouvez résilier votre abonnement à tout moment depuis votre tableau de bord, sans frais. La résiliation prend effet à la fin de la période en cours."},
    {h:"6. Remboursements",p:"Aucun remboursement pour les périodes déjà consommées. En cas de problème technique imputable à KEVININDUSTRIE, un remboursement au prorata pourra être envisagé sur demande."},
    {h:"7. Droit applicable",p:"Les présentes CGV sont soumises au droit français. En cas de litige, les tribunaux compétents de Paris seront saisis."},
  ]},
}
function LegalPage({type,setView}){
  const page=LEGAL_CONTENT[type]
  if(!page)return null
  return(
    <div style={{minHeight:"100vh",background:T.bg}}>
      <div style={{maxWidth:820,margin:"0 auto",padding:"3rem"}}>
        <button onClick={()=>setView("landing")} style={{fontFamily:"'Inter',sans-serif",background:"transparent",border:"none",color:T.textSec,fontSize:13,cursor:"pointer",marginBottom:"2rem",display:"flex",alignItems:"center",gap:6}}>← Retour</button>
        <div style={{marginBottom:"2.5rem",paddingBottom:"1.5rem",borderBottom:`2px solid ${T.text}`}}>
          <p style={{fontSize:10,fontWeight:700,color:T.textTer,textTransform:"uppercase",letterSpacing:2,marginBottom:8,...mono}}>KEVININDUSTRIE · TranscriptIA</p>
          <h1 style={{fontSize:30,fontWeight:900,color:T.text,letterSpacing:-1.5}}>{page.title}</h1>
          <p style={{fontSize:12,color:T.textSec,marginTop:8,...mono}}>Dernière mise à jour : {new Date().toLocaleDateString("fr-FR",{year:"numeric",month:"long",day:"numeric"})}</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:28}}>
          {page.sections.map((s,i)=>(
            <div key={i}>
              <h2 style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${T.border}`}}>{s.h}</h2>
              <p style={{fontSize:14,color:T.textSec,lineHeight:1.9,whiteSpace:"pre-line"}}>{s.p}</p>
            </div>
          ))}
        </div>
        <div style={{marginTop:"3rem",paddingTop:"1.5rem",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <p style={{fontSize:12,fontWeight:700,color:T.text}}>KEVININDUSTRIE</p>
            <p style={{fontSize:11,color:T.textTer,...mono}}>SIREN 932 737 992 · SAS · Paris</p>
          </div>
          <p style={{fontSize:11,color:T.textTer}}>contact@transcriptia.app</p>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════
   ROOT
═══════════════════════════════════════ */
export default function App(){
  useFont()
  const {toasts}=useToastProvider()
  const [view,setView]=useState("app")
  const [showAuth,setShowAuth]=useState(null)
  const [isLoggedIn,setLogged]=useState(false)
  const [user,setUser]=useState(null)      // {id, email, name, token}
  const [isPro,setIsPro]=useState(false)
  const [usageCount,setUsage]=useState(0)
  const [authLoading,setAuthLoading]=useState(true)

  // ── Session persistence ──
  useEffect(()=>{
    const stored = localStorage.getItem("tai_session")
    if(stored){
      try{
        const sess = JSON.parse(stored)
        // Verify token is still valid
        sbGetUser(sess.token).then(u=>{
          if(u&&u.id){
            setUser(sess)
            setLogged(true)
            setIsPro(sess.plan==="pro")
            setUsage(sess.transcriptions_count||0)
            // Refresh profile from DB
            sb("profiles?id=eq."+u.id+"&select=*").then(r=>{
              if(r?.data?.[0]){
                const p=r.data[0]
                const updated={...sess,name:p.name,plan:p.plan,transcriptions_count:p.transcriptions_count,credits:p.credits}
                setUser(updated)
                setIsPro(p.plan==="pro")
                setUsage(p.transcriptions_count||0)
                localStorage.setItem("tai_session",JSON.stringify(updated))
              }
            })
          } else {
            localStorage.removeItem("tai_session")
          }
          setAuthLoading(false)
        })
      }catch{localStorage.removeItem("tai_session");setAuthLoading(false)}
    } else {
      setAuthLoading(false)
    }
    // Handle OAuth redirect
    const hash = window.location.hash
    if(hash.includes("access_token")){
      const params = new URLSearchParams(hash.replace("#","?"))
      const token = params.get("access_token")
      if(token){
        sbGetUser(token).then(async u=>{
          if(u?.id){
            // Upsert profile
            await sb("profiles?id=eq."+u.id,{method:"GET"}).then(async r=>{
              if(!r?.data?.length){
                await sb("profiles",{method:"POST",body:JSON.stringify({id:u.id,name:u.user_metadata?.name||u.email?.split("@")[0],email:u.email,plan:"free",credits:3})})
              }
            })
            const profile = await sb("profiles?id=eq."+u.id+"&select=*")
            const p = profile?.data?.[0]||{}
            const sess = {id:u.id,email:u.email,name:p.name||u.user_metadata?.name||u.email?.split("@")[0],token,plan:p.plan||"free",transcriptions_count:p.transcriptions_count||0,credits:p.credits||3}
            localStorage.setItem("tai_session",JSON.stringify(sess))
            setUser(sess); setLogged(true); setIsPro(sess.plan==="pro"); setUsage(sess.transcriptions_count||0)
            window.location.hash = ""
            toast("Connexion Google réussie !","success")
          }
          setAuthLoading(false)
        })
      }
    }
  },[])
  const [bannerConfig,setBannerConfig]=useState({
    enabled:true,
    text:"🎉 <strong>Offre de lancement</strong> — 50% sur le plan annuel · Code <span style=\"background:rgba(255,255,255,0.15);padding:1px 8px;border-radius:4px;font-family:'DM Mono',monospace;font-size:12px\">LAUNCH50</span>",
    bg:"#0A0A0A",
    darkText:false,
    link:"",
    linkLabel:"En profiter →"
  })
  const [maintenance,setMaintenance]=useState({
    enabled:false,
    title:"Site en maintenance",
    message:"Nous effectuons des améliorations. Nous serons de retour très bientôt.",
    estimatedTime:"",
    allowAdmin:true
  })
  const [transcripts,setTxList]=useState([])
  const [reviews,setReviews]=useState(INITIAL_REVIEWS)
  const [logoClickCount,setLogoClickCount]=useState(0)
  const [showExitIntent,setShowExitIntent]=useState(false)
  const [exitShown,setExitShown]=useState(false)
  const [promoCodes,setPromoCodes]=useState([
    {id:1,code:"LAUNCH50",discount:"50%",type:"annual",uses:47,maxUses:100,active:true,expires:"30/06/2025"},
    {id:2,code:"WELCOME",discount:"1 mois offert",type:"monthly",uses:12,maxUses:50,active:true,expires:"31/12/2025"},
    {id:3,code:"STUDENT25",discount:"25%",type:"monthly",uses:89,maxUses:200,active:false,expires:"30/09/2025"},
  ])
  const [counterMin,setCounterMin]=useState(100)
  const [counterMax,setCounterMax]=useState(2000)

  useEffect(()=>{
    if(!isLoggedIn&&!exitShown){
      function handleMouseLeave(e){
        if(e.clientY<=0){setShowExitIntent(true);setExitShown(true)}
      }
      document.addEventListener("mouseleave",handleMouseLeave)
      return()=>document.removeEventListener("mouseleave",handleMouseLeave)
    }
  },[isLoggedIn,exitShown])

  function handleAuth(userData){
    if(!userData)return
    const {user,token,profile,name} = userData
    const sess = {
      id:user?.id,
      email:user?.email,
      name:name||profile?.name||user?.email?.split("@")[0]||"Utilisateur",
      token,
      plan:profile?.plan||"free",
      transcriptions_count:profile?.transcriptions_count||0,
      credits:profile?.credits||3
    }
    localStorage.setItem("tai_session",JSON.stringify(sess))
    setUser(sess)
    setLogged(true)
    setIsPro(sess.plan==="pro")
    setUsage(sess.transcriptions_count||0)
    setShowAuth(null)
    navigate("app")
  }
  async function handleLogout(){
    if(user?.token) await sbSignOut(user.token)
    localStorage.removeItem("tai_session")
    setUser(null); setLogged(false); setIsPro(false); setUsage(0)
    navigate("landing")
    toast("Déconnecté","info")
  }

  const bannerH = bannerConfig.enabled ? 38 : 0
  const showMaintenance = maintenance.enabled && view !== "admin"

  return(
    <div style={{fontFamily:"'Inter',sans-serif",background:T.bg,minHeight:"100vh",color:T.text,display:"flex",flexDirection:"column"}}>
      <ReadingProgress/>
      {authLoading?(
        <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
          <div style={{width:20,height:20,border:`2px solid ${T.border}`,borderTop:`2px solid ${T.text}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
          <p style={{fontSize:13,color:T.textTer}}>Chargement…</p>
        </div>
      ) : showMaintenance ? (
        <MaintenanceScreen maintenance={maintenance} onAdminAccess={()=>setView("admin")}/>
      ) : (
        <>
          <AnnouncementBanner config={bannerConfig}/>
          {view!=="admin"&&<Nav view={view} setView={navigate} isLoggedIn={isLoggedIn} setShowAuth={setShowAuth} isPro={isPro} logoClickCount={logoClickCount} setLogoClickCount={setLogoClickCount} user={user} onLogout={handleLogout}/>}
          {view==="profile"  &&<ProfilePage setView={navigate} isPro={isPro} usageCount={usageCount} user={user} onLogout={handleLogout}/>}
          {view==="landing"  &&<Landing  setView={setView} setShowAuth={setShowAuth} usageCount={usageCount} isPro={isPro} reviews={reviews} setReviews={setReviews} adminCounterMin={counterMin} adminCounterMax={counterMax}/>}
          {view==="app"      &&<AppView  usageCount={usageCount} setUsageCount={setUsage} isPro={isPro} setShowAuth={setShowAuth} transcripts={transcripts} setTranscripts={setTxList}/>}
          {view==="dashboard"&&<Dashboard usageCount={usageCount} isPro={isPro} setIsPro={setIsPro} transcripts={transcripts} setTranscripts={setTxList} setView={setView}/>}
          {view==="status"   &&<StatusPage setView={setView}/>}
          {view==="admin"    &&<AdminPanel setView={setView} bannerConfig={bannerConfig} setBannerConfig={setBannerConfig} maintenance={maintenance} setMaintenance={setMaintenance} promoCodes={promoCodes} setPromoCodes={setPromoCodes} counterMin={counterMin} setCounterMin={setCounterMin} counterMax={counterMax} setCounterMax={setCounterMax}/>}
          {["mentions","cgu","rgpd","cgv"].includes(view)&&<LegalPage type={view} setView={navigate}/>}
          {showAuth&&<AuthModal mode={showAuth} onClose={()=>setShowAuth(null)} onAuth={handleAuth}/>}
          {showExitIntent&&!isLoggedIn&&<ExitIntentPopup onClose={()=>setShowExitIntent(false)} onSignup={()=>{setShowExitIntent(false);setShowAuth("signup")}}/>}
        </>
      )}
      <ToastContainer toasts={toasts}/>
    </div>
  )
}
