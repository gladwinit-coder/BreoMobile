export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, falKey } = req.body;
  if (!falKey || !prompt) return res.status(400).json({ error: 'Missing prompt or falKey' });

  try {
    const resp = await fetch('https://queue.fal.run/fal-ai/wan/v2/t2v/480p', {
      method: 'POST',
      headers: {
        'Authorization': 'Key ' + falKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt,
          negative_prompt: 'blur, distorted, ugly, low quality, watermark, text overlay',
          num_frames: 81,
          fps: 16,
          aspect_ratio: '9:16',
        },
      }),
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json({ error: data.detail || data.error || 'fal.ai error ' + resp.status });
    return res.status(200).json(data); // { request_id: "..." }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
