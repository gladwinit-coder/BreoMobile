export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { requestId, falKey } = req.body;
  if (!requestId || !falKey) return res.status(400).json({ error: 'Missing requestId or falKey' });

  try {
    // Check status
    const statusResp = await fetch(
      `https://queue.fal.run/fal-ai/wan/v2/t2v/480p/requests/${requestId}/status`,
      { headers: { 'Authorization': 'Key ' + falKey } }
    );
    const status = await statusResp.json();

    if (status.status === 'COMPLETED') {
      // Fetch result
      const resultResp = await fetch(
        `https://queue.fal.run/fal-ai/wan/v2/t2v/480p/requests/${requestId}`,
        { headers: { 'Authorization': 'Key ' + falKey } }
      );
      const result = await resultResp.json();
      return res.status(200).json({ status: 'COMPLETED', videoUrl: result?.video?.url || result?.output?.video?.url });
    }

    return res.status(200).json({ status: status.status || 'IN_PROGRESS' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
