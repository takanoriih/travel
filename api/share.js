// Vercel Serverless Function: CORSプロキシとしてjsonblob.comにデータを保存・取得
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // POST: 旅データを保存してIDを返す
  if (req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk.toString();
    try {
      const r = await fetch('https://jsonblob.com/api/jsonBlob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body,
      });
      const loc = r.headers.get('Location') || '';
      const id = loc.split('/').pop();
      if (!id) throw new Error('no id from jsonblob');
      return res.json({ id });
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  }

  // GET: IDから旅データを取得
  if (req.method === 'GET') {
    const id = req.query && req.query.id;
    if (!id) return res.status(400).json({ error: 'missing id' });
    try {
      const r = await fetch(`https://jsonblob.com/api/jsonBlob/${id}`, {
        headers: { 'Accept': 'application/json' },
      });
      if (!r.ok) return res.status(404).json({ error: 'not found' });
      return res.json(await r.json());
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  }

  return res.status(405).end();
};
