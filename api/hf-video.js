export const config = { maxDuration: 120 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, hfToken } = req.body;
  if (!hfToken || !prompt) return res.status(400).json({ error: 'Missing prompt or hfToken' });

  const MODEL = 'damo-vilab/text-to-video-ms-1.7b';
  let attempts = 0;

  while (attempts < 6) {
    attempts++;
    const resp = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + hfToken,
        'Content-Type': 'application/json',
        'x-wait-for-model': 'true',
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (resp.status === 503) {
      const json = await resp.json().catch(() => ({}));
      const wait = Math.min((json.estimated_time || 20), 30) * 1000;
      await new Promise(r => setTimeout(r, wait));
      continue;
    }

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return res.status(resp.status).json({ error: err.error || 'HuggingFace error ' + resp.status });
    }

    const videoBuffer = Buffer.from(await resp.arrayBuffer());
    const contentType = resp.headers.get('content-type') || 'video/mp4';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline; filename="breo-video.mp4"');
    return res.send(videoBuffer);
  }

  return res.status(503).json({ error: 'Model is warming up — please try again in 30 seconds.' });
}
