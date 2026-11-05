import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
const isHttps = u => { try { return new URL(u).protocol === 'https:' } catch { return false } }
const SEL = '*, league:leagues(name), home:teams!matches_home_team_id_fkey(name), away:teams!matches_away_team_id_fkey(name), live_match_links(*)'
const Box = ({children}) => <div className="rounded-xl bg-slate-800/70 p-4">{children}</div>
const Msg = ({children}) => <p className="text-slate-400 text-sm py-6 text-center">{children}</p>
const fmt = d => new Date(d).toLocaleString([], {weekday:'short',hour:'2-digit',minute:'2-digit',day:'numeric',month:'short'})

function MatchCard({m}) {
  const links = (m.live_match_links||[]).filter(l => l.is_active && isHttps(l.url))
  return <Box>
    <div className="flex justify-between text-xs text-slate-400"><span>{m.league?.name}</span>
      <span className={m.status==='LIVE'?'text-red-400 font-bold animate-pulse':''}>{m.status==='UPCOMING'?fmt(m.kickoff):m.status}</span></div>
    <div className="flex justify-between items-center my-2 font-semibold">
      <span>{m.home?.name}</span><span className="text-lg">{m.home_score??'-'} : {m.away_score??'-'}</span><span>{m.away?.name}</span></div>
    {m.description && <p className="text-xs text-slate-400">{m.description}</p>}
    {m.status!=='FINISHED' && links.length>0 && <div className="flex flex-wrap gap-2 mt-2">
      {links.map(l => <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer nofollow"
        className="bg-emerald-500 text-black text-sm font-bold px-3 py-1.5 rounded-lg">▶ WATCH LIVE{links.length>1?` · ${l.label}`:''}</a>)}</div>}
  </Box>
}

function Home() {
  const [matches, setM] = useState(null), [news, setN] = useState(null), [err, setErr] = useState(null), [q, setQ] = useState('')
  const load = useCallback(async () => {
    const [a, b] = await Promise.all([sb.from('matches').select(SEL).order('kickoff'),
      sb.from('football_news').select('*').order('created_at',{ascending:false}).limit(10)])
    if (a.error || b.error) return setErr((a.error||b.error).message)
    setM(a.data); setN(b.data)
  }, [])
  useEffect(() => { load()
    const ch = sb.channel('public').on('postgres_changes',{event:'*',schema:'public'},load).subscribe()
    return () => sb.removeChannel(ch) }, [load])
  if (err) return <Msg>Couldn't load data: {err}</Msg>
  if (!matches) return <Msg>Loading…</Msg>
  const f = matches.filter(m => !q || `${m.home?.name} ${m.away?.name} ${m.league?.name}`.toLowerCase().includes(q.toLowerCase()))
  const sect = (title, list) => <section><h2 className="font-bold mb-2 mt-5">{title}</h2>
    {list.length ? <div className="grid gap-2 sm:grid-cols-2">{list.map(m => <MatchCard key={m.id} m={m}/>)}</div> : <Msg>Nothing here yet.</Msg>}</section>
  return <>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search teams or leagues" className="w-full rounded-lg bg-slate-800 px-3 py-2"/>
    {sect('⭐ Featured', f.filter(m=>m.is_featured && m.status!=='FINISHED'))}
    {sect('🔴 Live now', f.filter(m=>m.status==='LIVE'))}
    {sect('Upcoming', f.filter(m=>m.status==='UPCOMING'))}
    {sect('Results', f.filter(m=>m.status==='FINISHED').reverse())}
    <h2 className="font-bold mb-2 mt-5">News</h2>
    {news.length ? news.map(n => <Box key={n.id}>{n.image_url && <img src={n.image_url} alt="" className="rounded mb-2 max-h-48 w-full object-cover"/>}
      <h3 className="font-semibold">{n.title}</h3><p className="text-sm text-slate-300 line-clamp-3">{n.body}</p></Box>) : <Msg>No news yet.</Msg>}
  </>
}

function Admin() {
  const [session, setS] = useState(undefined), [ok, setOk] = useState(null)
  const [leagues, setL] = useState([]), [teams, setT] = useState([]), [matches, setM] = useState([]), [msg, setMsg] = useState('')
  const [f, setF] = useState({league_id:'',home_team_id:'',away_team_id:'',kickoff:'',description:''})
  const [tn, setTn] = useState(''), [lk, setLk] = useState({})
  useEffect(() => { sb.auth.getSession().then(({data}) => setS(data.session))
    const {data:{subscription}} = sb.auth.onAuthStateChange((_,s) => setS(s)); return () => subscription.unsubscribe() }, [])
  const load = useCallback(async () => {
    const [l,t,m] = await Promise.all([sb.from('leagues').select('*'), sb.from('teams').select('*').order('name'), sb.from('matches').select(SEL).order('kickoff',{ascending:false})])
    setL(l.data||[]); setT(t.data||[]); setM(m.data||[]) }, [])
  useEffect(() => { if (!session) return setOk(null)
    sb.from('admins').select('user_id').eq('user_id',session.user.id).maybeSingle().then(({data}) => { setOk(!!data); if (data) load() }) }, [session, load])
  const run = async p => { const {error} = await p; setMsg(error ? error.message : 'Saved ✓'); load() }

  if (session === undefined) return <Msg>Loading…</Msg>
  if (!session) return <form className="grid gap-2 max-w-sm mx-auto" onSubmit={async e => { e.preventDefault()
    const d = new FormData(e.target); const {error} = await sb.auth.signInWithPassword({email:d.get('e'),password:d.get('p')}); if (error) setMsg(error.message) }}>
    <h1 className="font-bold text-xl">Admin sign in</h1>
    <input name="e" type="email" required placeholder="Email" className="rounded bg-slate-800 px-3 py-2"/>
    <input name="p" type="password" required placeholder="Password" className="rounded bg-slate-800 px-3 py-2"/>
    <button className="bg-emerald-500 text-black font-bold rounded py-2">Sign in</button><Msg>{msg}</Msg></form>
  if (ok === null) return <Msg>Checking access…</Msg>
  if (!ok) return <Msg>This account is not an administrator. <button className="underline" onClick={()=>sb.auth.signOut()}>Sign out</button></Msg>

  const inp = "rounded bg-slate-800 px-2 py-1.5 text-sm"
  const set = k => e => setF({...f,[k]:e.target.value})
  const lteams = teams.filter(t => t.league_id == f.league_id)
  return <div className="grid gap-4">
    <div className="flex justify-between"><h1 className="font-bold text-xl">Admin</h1><button className="underline text-sm" onClick={()=>sb.auth.signOut()}>Sign out</button></div>
    {msg && <p className="text-emerald-400 text-sm">{msg}</p>}
    <Box><h2 className="font-semibold mb-2">Add team</h2><div className="flex gap-2 flex-wrap">
      <input className={inp} value={tn} onChange={e=>setTn(e.target.value)} placeholder="Team name"/>
      <button className="bg-slate-700 px-3 rounded" onClick={()=>{ if(tn && f.league_id){ run(sb.from('teams').insert({name:tn.trim(),league_id:+f.league_id})); setTn('') } else setMsg('Pick a league below and enter a name') }}>Add to selected league</button></div></Box>
    <Box><h2 className="font-semibold mb-2">Create match</h2><div className="grid gap-2 sm:grid-cols-2">
      <select className={inp} value={f.league_id} onChange={set('league_id')}><option value="">League</option>{leagues.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select>
      <input type="datetime-local" className={inp} value={f.kickoff} onChange={set('kickoff')}/>
      <select className={inp} value={f.home_team_id} onChange={set('home_team_id')}><option value="">Home</option>{lteams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
      <select className={inp} value={f.away_team_id} onChange={set('away_team_id')}><option value="">Away</option>{lteams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
      <input className={inp+' sm:col-span-2'} maxLength={300} placeholder="Short description" value={f.description} onChange={set('description')}/>
      <button className="bg-emerald-500 text-black font-bold rounded py-2 sm:col-span-2" onClick={()=>{
        if(!f.league_id||!f.home_team_id||!f.away_team_id||!f.kickoff) return setMsg('Fill league, teams and kickoff')
        run(sb.from('matches').insert({...f,league_id:+f.league_id,kickoff:new Date(f.kickoff).toISOString()})) }}>Create</button></div></Box>
    {matches.map(m => <Box key={m.id}>
      <div className="font-semibold">{m.home?.name} vs {m.away?.name} <span className="text-xs text-slate-400">· {m.league?.name} · {fmt(m.kickoff)}</span></div>
      <div className="flex flex-wrap gap-2 my-2 items-center text-sm">
        <select className={inp} value={m.status} onChange={e=>run(sb.from('matches').update({status:e.target.value}).eq('id',m.id))}>{['UPCOMING','LIVE','FINISHED'].map(s=><option key={s}>{s}</option>)}</select>
        <input type="number" min="0" className={inp+' w-14'} defaultValue={m.home_score??''} onBlur={e=>run(sb.from('matches').update({home_score:e.target.value===''?null:+e.target.value}).eq('id',m.id))}/>:
        <input type="number" min="0" className={inp+' w-14'} defaultValue={m.away_score??''} onBlur={e=>run(sb.from('matches').update({away_score:e.target.value===''?null:+e.target.value}).eq('id',m.id))}/>
        <label><input type="checkbox" checked={m.is_active} onChange={e=>run(sb.from('matches').update({is_active:e.target.checked}).eq('id',m.id))}/> Active</label>
        <label><input type="checkbox" checked={m.is_featured} onChange={e=>run(sb.from('matches').update({is_featured:e.target.checked}).eq('id',m.id))}/> Featured</label>
        <button className="text-red-400 ml-auto" onClick={()=>confirm('Delete match?')&&run(sb.from('matches').delete().eq('id',m.id))}>Delete</button></div>
      {(m.live_match_links||[]).map(l => <div key={l.id} className="flex gap-2 text-sm items-center">
        <span className="truncate flex-1">{l.label}: {l.url}</span>
        <label><input type="checkbox" checked={l.is_active} onChange={e=>run(sb.from('live_match_links').update({is_active:e.target.checked}).eq('id',l.id))}/> on</label>
        <button className="text-red-400" onClick={()=>run(sb.from('live_match_links').delete().eq('id',l.id))}>✕</button></div>)}
      <div className="flex gap-2 mt-2"><input className={inp} placeholder="Label (e.g. Official)" value={lk[m.id]?.label||''} onChange={e=>setLk({...lk,[m.id]:{...lk[m.id],label:e.target.value}})}/>
        <input className={inp+' flex-1'} placeholder="https://official-broadcaster…" value={lk[m.id]?.url||''} onChange={e=>setLk({...lk,[m.id]:{...lk[m.id],url:e.target.value}})}/>
        <button className="bg-slate-700 px-3 rounded" onClick={()=>{ const x=lk[m.id]||{}
          if(!x.label||!isHttps(x.url)) return setMsg('Enter a label and a valid https:// URL')
          run(sb.from('live_match_links').insert({match_id:m.id,label:x.label.trim(),url:new URL(x.url).href})); setLk({...lk,[m.id]:{}}) }}>Add link</button></div>
    </Box>)}
  </div>
}

export default function App() {
  const [h, setH] = useState(location.hash)
  useEffect(() => { const f = () => setH(location.hash); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  const admin = h === '#admin'
  return <div className="max-w-3xl mx-auto px-4 pt-4 pb-24">
    <header className="mb-4 font-extrabold text-xl">Goal<span className="text-emerald-400">Pulse</span></header>
    {admin ? <Admin/> : <Home/>}
    <nav className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 flex justify-around py-3 text-sm">
      <a href="#">⚽ Matches</a><a href="#admin">🔐 Admin</a></nav>
  </div>
}
