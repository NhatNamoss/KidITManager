import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

const equal = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = Buffer.from(a || ''); const right = Buffer.from(b || '');
  return left.length === right.length && timingSafeEqual(left, right);
};

export function registerAuth(app, config = process.env) {
  const password = config.APP_PASSWORD;
  const secret = config.SESSION_SECRET;
  const configured = password?.length >= 12 && secret?.length >= 32;
  const attempts = new Map();
  const sign = value => createHmac('sha256', secret).update(value).digest('hex');
  const authenticated = req => {
    if (!configured) return false;
    const token = req.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith('kidit_session='))?.slice(14);
    if (!token) return false;
    const [expires, nonce, signature] = token.split('.');
    return Number(expires) > Date.now() && equal(signature, sign(`${expires}.${nonce}`));
  };
  app.get('/api/auth/session', (req, res) => res.json({ authenticated: authenticated(req), configured: Boolean(configured) }));
  app.post('/api/auth/login', async (req, res) => {
    if (!configured) return res.status(503).json({ error: 'Cần cấu hình APP_PASSWORD và SESSION_SECRET trên máy chủ.' });
    const key = req.socket.remoteAddress;
    const now = Date.now();
    for (const [ip, entry] of attempts) if (entry.until < now) attempts.delete(ip);
    const entry = attempts.get(key) || { count: 0, until: now + 15 * 60 * 1000 };
    if (entry.count >= 10) return res.status(429).json({ error: 'Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.' });
    if (!equal(req.body?.password, password)) {
      entry.count++; attempts.set(key, entry);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res.status(401).json({ error: 'Mật khẩu không đúng.' });
    }
    attempts.delete(key);
    const data = `${Date.now() + 8 * 60 * 60 * 1000}.${randomBytes(16).toString('hex')}`;
    res.setHeader('Set-Cookie', `kidit_session=${data}.${sign(data)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    res.json({ success: true });
  });
  app.post('/api/auth/logout', (req, res) => {
    res.setHeader('Set-Cookie', 'kidit_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
    res.json({ success: true });
  });
  app.use('/api', (req, res, next) => {
    if (!configured) return res.status(503).json({ error: 'Máy chủ chưa được cấu hình đăng nhập.' });
    if (!authenticated(req)) return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn.' });
    next();
  });
}
