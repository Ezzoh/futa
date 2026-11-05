import { leagueName } from '../lib/leagues'

const time = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

function Status({ m }) {
  if (m.status === 'live')
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
        <span className="live-dot h-2 w-2 rounded-full bg-red-500" />
        {m.minute ? `${m.minute}'` : 'Live'}
      </span>
    )
  if (m.status === 'finished') return <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">FT</span>
  if (m.status === 'postponed') return <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">PPD</span>
  return <span className="text-xs font-semibold tabular-nums text-slate-300">{time(m.kickoff)}</span>
}

export default function MatchCard({ m }) {
  const showScore = m.status === 'live' || m.status === 'finished'
  const links = Array.isArray(m.watch_links) ? m.watch_links : []
  const homeWin = showScore && m.home_score > m.away_score
  const awayWin = showScore && m.away_score > m.home_score

  return (
    <article className={`rounded-xl border bg-panel p-4 transition hover:border-slate-600 ${m.status === 'live' ? 'border-red-500/40' : 'border-line'}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{leagueName(m.league)}</span>
        <Status m={m} />
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-y-1.5">
        <span className={`truncate font-display text-xl ${homeWin ? 'font-bold text-white' : 'text-slate-200'}`}>{m.home_team}</span>
        <span className="font-display text-xl font-bold tabular-nums text-white">{showScore ? m.home_score ?? 0 : ''}</span>
        <span className={`truncate font-display text-xl ${awayWin ? 'font-bold text-white' : 'text-slate-200'}`}>{m.away_team}</span>
        <span className="font-display text-xl font-bold tabular-nums text-white">{showScore ? m.away_score ?? 0 : ''}</span>
      </div>
      {(m.venue || links.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          {m.venue && <span className="mr-auto text-xs text-slate-500">{m.venue}</span>}
          {links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
               className="rounded-full bg-pitch/10 px-2.5 py-1 text-xs font-semibold text-pitch hover:bg-pitch/20">
              ▶ {l.label}
            </a>
          ))}
        </div>
      )}
    </article>
  )
}
