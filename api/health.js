// GET /api/health -> estado de la conexión. Solo devuelve sí/no, nunca claves ni datos.
const store = require('../lib/store');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const out = {
    storageConfigured: store.configured(),
    adminPasswordSet: !!process.env.ADMIN_PASSWORD,
    redisReachable: false,
  };
  if (out.storageConfigured) {
    try {
      await store.ping();
      out.redisReachable = true;
    } catch (e) {
      out.error = String((e && e.message) || e).slice(0, 80);
    }
  }
  return res.status(200).json(out);
};
