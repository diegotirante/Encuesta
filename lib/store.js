// Guardado de votos en Upstash Redis (se conecta desde Vercel > Storage).
// Acepta los nombres de variables que crea Vercel: KV_REST_API_* o UPSTASH_REDIS_REST_*.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = 'tirante:votes';

async function cmd(args) {
  if (!URL_ || !TOKEN) throw new Error('storage_not_configured');
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || 'storage_error');
  return j.result;
}

module.exports = {
  OPTIONS: ['a', 'b', 'c', 'd', 'e'],
  set: (id, vote) => cmd(['HSET', KEY, id, JSON.stringify(vote)]),
  del: (id) => cmd(['HDEL', KEY, id]),
  async all() {
    const r = await cmd(['HGETALL', KEY]);
    const pairs = Array.isArray(r) ? r : Object.entries(r || {}).flat();
    const out = [];
    for (let i = 0; i < pairs.length; i += 2) {
      try { out.push({ id: pairs[i], ...JSON.parse(pairs[i + 1]) }); } catch (e) { /* voto ilegible: se ignora */ }
    }
    return out;
  },
  clean: (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n),
  parseBody(req) {
    if (req.body && typeof req.body === 'object') return req.body;
    try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; }
  },
};
