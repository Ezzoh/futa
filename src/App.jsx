import { useMemo, useState } from 'react'
import { LEAGUES } from './lib/leagues'
import { useMatches } from './lib/useMatches'
import MatchCard from './components/MatchCard.jsx'

const TABS = [
  { id: 'live', label: 'Live' },
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'results', label: 'Results' },
]

const dayLabel = (iso) => {
  const d = new Date(iso)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const that = new Date(d); that.setHours(0, 0, 0, 0)
  const diff = Math.round((that - today) / 86400_000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })
}

export default function App() {
  const { matches, loading, error, demo } = useMatches()
  const [tab, setTab] = useState('live')
  const [league, setLeague] = useState('all')

  const liveCount = matches.filter((m) => m.status === 'live').length

  const groups = useMemo(() => {
    let list = matches.filter((m) => league === 'all' || m.league === league)
    if (tab === 'live') list = list.filter((m) => m.status === 'live')
    if (tab === 'fixtures') list = list.filter((m) => m.status === 'scheduled' || m.status === 'postponed')
    if (tab === 'results') list = list.filter((m) => m.status === 'finished').reverse()
    const map = new Map()
    for (const m of list) {
      const k = dayLabel(m.kickoff)
      if (!map.has(k)) map.set(k, [])
      map.get(k).push(m)
    }
    return [...map.entries()]
  }, [matches, tab, league])

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 pb-16">
      <header className="flex items-center justify-between py-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">
          Goal<span className="text-pitch">Pulse</span>
        </h1>
        {liveCount > 0 && (
          <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-400">
            <span className="live-dot h-2 w-2 rounded-full bg-red-500" /> {liveCount} live
          </span>
        )}
      </header>

      {demo && (
        <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
          Showing demo matches. Connect Supabase to show real data.
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          Couldn't load matches: {error}
        </p>
      )}

      <nav className="mb-4 flex gap-1 rounded-xl bg-panel p-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${tab === t.id ? 'bg-pitch text-ink' : 'text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {LEAGUES.map((l) => (
          <button key={l.id} onClick={() => setLeague(l.id)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${league === l.id ? 'border-pitch text-pitch' : 'border-line text-slate-400 hover:text-white'}`}>
            {l.short}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-16 text-center text-slate-500">Loading matches…</p>
      ) : groups.length === 0 ? (
        <p className="py-16 text-center text-slate-500">
          {tab === 'live' ? 'No matches live right now.' : tab === 'fixtures' ? 'No upcoming fixtures.' : 'No recent results.'}
        </p>
      ) : (
        groups.map(([day, list]) => (
          <section key={day} className="mb-8">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">{day}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((m) => <MatchCard key={m.id} m={m} />)}
            </div>
          </section>
        ))
      )}

      <footer className="mt-12 text-center text-xs text-slate-600">
        Viewing links point to official broadcasters only.
      </footer>
    </div>
  )
}
