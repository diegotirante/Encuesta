// POST /api/vote  -> guarda (o reemplaza) el voto de una persona.
const store = require('../lib/store');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method' });
  }
  const b = store.parseBody(req);
  const name = store.clean(b.name, 80);
  const phone = store.clean(b.phone, 30);
  const vid = store.clean(b.vid, 64);
  const ok = store.OPTIONS;

  if (name.length < 2) return res.status(400).json({ error: 'name' });
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(vid)) return res.status(400).json({ error: 'vid' });
  if (!ok.includes(b.first) || !ok.includes(b.second) || b.first === b.second) {
    return res.status(400).json({ error: 'options' });
  }
  try {
    // Un voto por dispositivo: si vuelve a votar, se reemplaza.
    await store.set(vid, { name, phone, first: b.first, second: b.second, ts: Date.now() });
    return res.status(200).json({ ok: true });
  } catch (e) {
    const reason = e && e.message === 'storage_not_configured' ? 'not_configured' : 'rejected';
    return res.status(503).json({ error: 'storage', reason });
  }
};
