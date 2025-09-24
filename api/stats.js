/**
 * Serverless proxy to msstats.optimalwayconsulting.com to avoid CORS issues.
 */
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Metode no permis' });
    }

    const { matchId, currentSeason = 'true' } = req.query ?? {};
    if (!matchId) {
      return res.status(400).json({ error: 'Falta el parametre matchId' });
    }

    const upstream = `https://msstats.optimalwayconsulting.com/v1/fcbq/getJsonWithMatchStats/${encodeURIComponent(matchId)}?currentSeason=${encodeURIComponent(currentSeason)}`;
    const upstreamRes = await fetch(upstream, { headers: { accept: 'application/json' } });
    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({ error: `Error de l'origen (${upstreamRes.status})` });
    }

    const json = await upstreamRes.json();

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).json(json);
  } catch (err) {
    return res.status(500).json({ error: 'Error intern', detail: String(err?.message ?? err) });
  }
}
