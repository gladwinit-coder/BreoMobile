export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, apiKey } = req.body;
  if (!apiKey || !prompt) return res.status(400).json({ error: 'Missing prompt or apiKey' });

  try {
    const resp = await fetch(
      'https://api.replicate.com/v1/models/wavespeedai/wan-2.1-t2v-480p/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            prompt,
            num_frames: 81,
            sample_steps: 30,
            sample_guide_scale: 6,
            negative_prompt: 'blur, low quality, distorted, ugly, watermark, text',
          },
        }),
      }
    );
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
