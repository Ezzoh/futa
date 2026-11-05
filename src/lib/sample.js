// Demo data shown only when Supabase isn't configured.
const h = (offsetHours) => new Date(Date.now() + offsetHours * 3600_000).toISOString()

export const SAMPLE_MATCHES = [
  { id: 's1', league: 'EPL', home_team: 'Arsenal', away_team: 'Chelsea', home_score: 1, away_score: 1, status: 'live', minute: 63, kickoff: h(-1), venue: 'Emirates Stadium', watch_links: [{ label: 'Sky Sports', url: 'https://www.skysports.com/watch' }] },
  { id: 's2', league: 'LALIGA', home_team: 'Real Sociedad', away_team: 'Sevilla', home_score: 2, away_score: 0, status: 'live', minute: 78, kickoff: h(-1.3), venue: 'Reale Arena', watch_links: [{ label: 'LaLiga+', url: 'https://www.laliga.com/en-GB/laliga-easports/how-to-watch' }] },
  { id: 's3', league: 'UCL', home_team: 'Inter', away_team: 'PSG', home_score: null, away_score: null, status: 'scheduled', minute: null, kickoff: h(5), venue: 'San Siro', watch_links: [{ label: 'UEFA broadcasters', url: 'https://www.uefa.com/uefachampionsleague/news/where-to-watch/' }] },
  { id: 's4', league: 'BUNDESLIGA', home_team: 'Leverkusen', away_team: 'Dortmund', home_score: null, away_score: null, status: 'scheduled', minute: null, kickoff: h(26), venue: 'BayArena', watch_links: [] },
  { id: 's5', league: 'SERIEA', home_team: 'Napoli', away_team: 'Roma', home_score: 3, away_score: 1, status: 'finished', minute: 90, kickoff: h(-20), venue: 'Stadio Maradona', watch_links: [] },
  { id: 's6', league: 'LIGUE1', home_team: 'Lyon', away_team: 'Marseille', home_score: 0, away_score: 2, status: 'finished', minute: 90, kickoff: h(-28), venue: 'Groupama Stadium', watch_links: [] },
  { id: 's7', league: 'UEL', home_team: 'Roma', away_team: 'Ajax', home_score: null, away_score: null, status: 'scheduled', minute: null, kickoff: h(50), venue: 'Stadio Olimpico', watch_links: [] },
]
