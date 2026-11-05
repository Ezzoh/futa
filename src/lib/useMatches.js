import { useEffect, useState } from 'react'
import { supabase, isConfigured } from './supabase'
import { SAMPLE_MATCHES } from './sample'

// Loads matches from Supabase and keeps them fresh via Realtime.
export function useMatches() {
  const [matches, setMatches] = useState(isConfigured ? [] : SAMPLE_MATCHES)
  const [loading, setLoading] = useState(isConfigured)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabase) return
    let active = true
    const from = new Date(Date.now() - 7 * 86400_000).toISOString()
    const to = new Date(Date.now() + 14 * 86400_000).toISOString()

    const load = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .gte('kickoff', from)
        .lte('kickoff', to)
        .order('kickoff', { ascending: true })
      if (!active) return
      if (error) setError(error.message)
      else { setMatches(data ?? []); setError(null) }
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel('matches-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        setMatches((prev) => {
          if (payload.eventType === 'DELETE') return prev.filter((m) => m.id !== payload.old.id)
          const row = payload.new
          const exists = prev.some((m) => m.id === row.id)
          const next = exists ? prev.map((m) => (m.id === row.id ? row : m)) : [...prev, row]
          return next.sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
        })
      })
      .subscribe()

    // Fallback refresh in case Realtime isn't enabled on the table.
    const timer = setInterval(load, 60_000)
    return () => { active = false; clearInterval(timer); supabase.removeChannel(channel) }
  }, [])

  return { matches, loading, error, demo: !isConfigured }
}
