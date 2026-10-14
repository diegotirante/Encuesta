// Solo para Diego. Todo requiere el encabezado x-admin-key con la contraseña (variable ADMIN_PASSWORD).
//   GET    /api/admin           -> lista de votos
//   POST   /api/admin           -> carga un voto recibido por WhatsApp
//   DELETE /api/admin?id=...    -> quita un voto
const crypto = require('crypto');
const store = require('../lib/store');

function authed(req) {
  const key = process.env.ADMIN_PASSWORD || '';
  const got = String(req.headers['x-admin-key'] || '');
  const a = crypto.createHash('sha256').update(got).digest();
  const b = crypto.createHash('sha256').update(key).digest();
  return crypto.timingSafeEqual(a, b);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.ADMIN_PASSWORD) return res.status(503).json({ error: 'no_password' });
  if (!authed(req)) {
    await new Promise((r) => setTimeout(r, 600)); // frena los intentos de adivinar la clave
    return res.status(401).json({ error: 'auth' });
  }
  try {
    if (req.method === 'GET') {
      return res.status(200).json({ votes: await store.all() });
    }
    if (req.method === 'POST') {
      const b = store.parseBody(req);
      const name = store.clean(b.name, 80);
      const phone = store.clean(b.phone, 30);
      const ok = store.OPTIONS;
      if (name.length < 2 || !ok.includes(b.first) || !ok.includes(b.second) || b.first === b.second) {
        return res.status(400).json({ error: 'invalid' });
      }
      const id = 'm_' + crypto.randomBytes(9).toString('hex');
      await store.set(id, { name, phone, first: b.first, second: b.second, ts: Date.now(), manual: true });
      return res.status(200).json({ ok: true, id });
    }
    if (req.method === 'DELETE') {
      const id = store.clean((req.query && req.query.id) || '', 64);
      if (!id) return res.status(400).json({ error: 'id' });
      await store.del(id);
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'method' });
  } catch (e) {
    return res.status(503).json({ error: 'storage' });
  }
};
