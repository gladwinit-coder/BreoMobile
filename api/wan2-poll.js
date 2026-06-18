export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { predictionId, apiKey } = req.body;
  if (!predictionId || !apiKey) return res.status(400).json({ error: 'Missing predictionId or apiKey' });

  try {
    const resp = await fetch(
      'https://api.replicate.com/v1/predictions/' + predictionId,
      { headers: { Authorization: 'Bearer ' + apiKey } }
    );
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
