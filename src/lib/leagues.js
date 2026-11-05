export const LEAGUES = [
  { id: 'all', name: 'All', short: 'All' },
  { id: 'EPL', name: 'Premier League', short: 'EPL' },
  { id: 'LALIGA', name: 'La Liga', short: 'La Liga' },
  { id: 'BUNDESLIGA', name: 'Bundesliga', short: 'Bundesliga' },
  { id: 'SERIEA', name: 'Serie A', short: 'Serie A' },
  { id: 'LIGUE1', name: 'Ligue 1', short: 'Ligue 1' },
  { id: 'UCL', name: 'Champions League', short: 'UCL' },
  { id: 'UEL', name: 'Europa League', short: 'UEL' },
]

export const leagueName = (id) => LEAGUES.find((l) => l.id === id)?.name ?? id
