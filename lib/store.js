// Guardado de votos en Upstash Redis (se conecta desde Vercel > Storage).
// Busca las variables de conexión aunque Vercel les agregue un prefijo (KV_, STORAGE_, UPSTASH_REDIS_, etc.).
const KEY = 'tirante:votes';

function pick(re, exclude) {
  const k = Object.keys(process.env).find((n) => re.test(n) && !(exclude && exclude.test(n)) && process.env[n]);
  return k ? process.env[k] : undefined;
}
const endpoint = () =>
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || pick(/(REST_API_URL|REDIS_REST_URL)$/);
const token = () =>
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || pick(/(REST_API_TOKEN|REDIS_REST_TOKEN)$/, /READ_ONLY/);

async function cmd(args) {
  const url = endpoint();
  const tk = token();
  if (!url || !tk) throw new Error('storage_not_configured');
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + tk, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || 'storage_error');
  return j.result;
}

module.exports = {
  OPTIONS: ['a', 'b', 'c', 'd', 'e'],
  configured: () => !!(endpoint() && token()),
  ping: () => cmd(['PING']),
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
