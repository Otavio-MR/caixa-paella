const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const os = require('os');

const PORT = +process.env.PORT || 3000;
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(DATA, { recursive: true });

const db = new DatabaseSync(path.join(DATA, 'caixa.db'));
db.exec(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY, name TEXT NOT NULL, price INTEGER NOT NULL, color TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, photo TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS sales(id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, user_id INTEGER NOT NULL, user_name TEXT NOT NULL, items TEXT NOT NULL, total INTEGER NOT NULL, method TEXT NOT NULL, received INTEGER NOT NULL, change INTEGER NOT NULL, printed INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);

try { db.exec("ALTER TABLE products ADD COLUMN photo TEXT NOT NULL DEFAULT ''"); } catch { /* coluna já existe */ }

const DEFAULT_SETTINGS = {
  eventName: 'Paella Mineira Solidária',
  beneficiary: 'Hospital do Câncer de Londrina',
  paperWidth: 80,
  voucherHeight: 50,
};
const getSettings = () => {
  const out = { ...DEFAULT_SETTINGS };
  for (const r of db.prepare('SELECT key, value FROM settings').all()) {
    if (r.key in out) out[r.key] = JSON.parse(r.value);
  }
  return out;
};

if (!db.prepare('SELECT COUNT(*) c FROM products').get().c) {
  db.prepare('INSERT INTO products(name, price, color, photo) VALUES (?, ?, ?, ?)').run('Paella Mineira (1 kg)', 8000, '#E8833A', '');
}

/* ---------- auth ---------- */
const hashPw = (pw, salt) => crypto.scryptSync(pw, salt, 64).toString('hex');
const checkPw = (pw, salt, hash) => crypto.timingSafeEqual(Buffer.from(hashPw(pw, salt), 'hex'), Buffer.from(hash, 'hex'));
const SESSION_MS = 12 * 3600 * 1000;

function cookie(req, name) {
  const m = (req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
}
function startSession(req, res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions(token, user_id, expires) VALUES (?, ?, ?)').run(token, userId, Date.now() + SESSION_MS);
  const secure = req.secure ? '; Secure' : '';
  res.setHeader('Set-Cookie', `sid=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}${secure}`);
}
function currentUser(req) {
  const token = cookie(req, 'sid');
  if (!token) return null;
  return db.prepare('SELECT u.id, u.username, u.name, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires > ? AND u.active = 1').get(token, Date.now()) || null;
}
const needAuth = (req, res, next) => {
  const u = currentUser(req);
  if (!u) return res.status(401).json({ error: 'Faça login para continuar.' });
  req.user = u;
  next();
};
const needAdmin = (req, res, next) => (req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Apenas administradores podem fazer isso.' }));

const attempts = new Map();
function tooManyAttempts(key) {
  const now = Date.now();
  const list = (attempts.get(key) || []).filter((t) => now - t < 10 * 60 * 1000);
  attempts.set(key, list);
  return list.length >= 8;
}

/* ---------- demonstração (opcional, só com as variáveis de ambiente) ---------- */
function seedDemo() {
  const adminPw = process.env.DEMO_ADMIN_PASSWORD;
  const caixaPw = process.env.DEMO_CAIXA_PASSWORD;
  if (!adminPw || db.prepare('SELECT COUNT(*) c FROM users').get().c) return;
  const addUser = (username, name, role, pw) => {
    const salt = crypto.randomBytes(16).toString('hex');
    return Number(db.prepare('INSERT INTO users(username, name, role, salt, hash) VALUES (?, ?, ?, ?, ?)').run(username, name, role, salt, hashPw(pw, salt)).lastInsertRowid);
  };
  const admin = addUser('admin', 'Administrador', 'admin', adminPw);
  const caixa = caixaPw ? addUser('caixa', 'Caixa 1', 'caixa', caixaPw) : admin;
  const caixaName = caixaPw ? 'Caixa 1' : 'Administrador';
  if (db.prepare('SELECT COUNT(*) c FROM products').get().c <= 1) {
    const ins = db.prepare('INSERT INTO products(name, price, color) VALUES (?, ?, ?)');
    ins.run('Refrigerante lata', 600, '#D8573F');
    ins.run('Suco natural', 500, '#8EB36B');
    ins.run('Água mineral', 300, '#5FA8A0');
    ins.run('Pudim', 700, '#C98BB5');
  }
  const prods = db.prepare('SELECT id, name, price FROM products ORDER BY id').all();
  const sale = (minAgo, uid, uname, picks, method, received) => {
    const items = picks.map(([i, qty]) => ({ id: prods[i].id, name: prods[i].name, price: prods[i].price, qty }));
    const total = items.reduce((a, it) => a + it.price * it.qty, 0);
    const rec = method === 'dinheiro' ? Math.max(total, received || total) : total;
    db.prepare('INSERT INTO sales(at, user_id, user_name, items, total, method, received, change, printed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)')
      .run(new Date(Date.now() - minAgo * 60000).toISOString(), uid, uname, JSON.stringify(items), total, method, rec, rec - total);
  };
  sale(185, caixa, caixaName, [[0, 2]], 'pix');
  sale(170, caixa, caixaName, [[0, 1], [1, 1]], 'dinheiro', 10000);
  sale(150, admin, 'Administrador', [[0, 4]], 'cartao');
  sale(132, caixa, caixaName, [[0, 3], [2, 3]], 'dinheiro', 30000);
  sale(118, caixa, caixaName, [[0, 1]], 'pix');
  sale(97, admin, 'Administrador', [[0, 2], [3, 2]], 'dinheiro', 20000);
  sale(80, caixa, caixaName, [[0, 5]], 'pix');
  sale(64, caixa, caixaName, [[0, 1], [4, 2]], 'cartao');
  sale(41, admin, 'Administrador', [[0, 2]], 'dinheiro', 20000);
  sale(25, caixa, caixaName, [[0, 3], [1, 2]], 'pix');
  sale(12, caixa, caixaName, [[0, 1], [2, 1]], 'dinheiro', 10000);
}
seedDemo();

/* ---------- app ---------- */
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-src 'self' about:; object-src 'none'; base-uri 'none'; form-action 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});
app.use(express.json({ limit: '1.5mb' }));
app.use('/api', (req, res, next) => {
  if (req.method !== 'GET' && !req.is('application/json')) return res.status(415).json({ error: 'Formato inválido.' });
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

const bad = (res, msg, code = 400) => res.status(code).json({ error: msg });
const cleanName = (v, max) => String(v || '').trim().slice(0, max);

app.get('/api/me', (req, res) => {
  const users = db.prepare('SELECT COUNT(*) c FROM users').get().c;
  const settings = getSettings();
  const brand = { eventName: settings.eventName, beneficiary: settings.beneficiary };
  res.json({ user: currentUser(req), needsSetup: users === 0, brand });
});

app.post('/api/setup', (req, res) => {
  if (db.prepare('SELECT COUNT(*) c FROM users').get().c) return bad(res, 'O sistema já foi configurado.', 403);
  const { name, username, password } = req.body || {};
  const un = cleanName(username, 30).toLowerCase();
  if (!cleanName(name, 60) || !un || String(password || '').length < 6) return bad(res, 'Informe nome, usuário e uma senha de pelo menos 6 caracteres.');
  const salt = crypto.randomBytes(16).toString('hex');
  const r = db.prepare('INSERT INTO users(username, name, role, salt, hash) VALUES (?, ?, ?, ?, ?)').run(un, cleanName(name, 60), 'admin', salt, hashPw(password, salt));
  startSession(req, res, Number(r.lastInsertRowid));
  res.json({ ok: true });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const un = cleanName(username, 30).toLowerCase();
  const key = req.ip + '|' + un;
  if (tooManyAttempts(key)) return bad(res, 'Muitas tentativas. Aguarde alguns minutos e tente de novo.', 429);
  const u = db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').get(un);
  if (!u || !checkPw(String(password || ''), u.salt, u.hash)) {
    attempts.get(key).push(Date.now());
    return bad(res, 'Usuário ou senha incorretos.', 401);
  }
  attempts.delete(key);
  startSession(req, res, u.id);
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  const token = cookie(req, 'sid');
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.setHeader('Set-Cookie', 'sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  res.json({ ok: true });
});

app.use('/api', needAuth);

app.get('/api/bootstrap', (req, res) => {
  const products = db.prepare('SELECT id, name, price, color, active, photo FROM products ORDER BY id').all().map((p) => ({ ...p, active: !!p.active }));
  res.json({ products, settings: getSettings() });
});

/* produtos */
function readProduct(body) {
  const name = cleanName(body.name, 40);
  const price = Math.round(+body.price);
  const color = /^#[0-9a-f]{6}$/i.test(body.color) ? body.color : '#e8833a';
  if (!name) return { error: 'Informe o nome do produto.' };
  if (!Number.isInteger(price) || price <= 0 || price > 10000000) return { error: 'Informe um preço válido.' };
  const ph = String(body.photo || '');
  const photo = ph.length <= 450000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(ph) ? ph : '';
  return { name, price, color, photo, active: body.active === false ? 0 : 1 };
}
app.post('/api/products', needAdmin, (req, res) => {
  const p = readProduct(req.body || {});
  if (p.error) return bad(res, p.error);
  const r = db.prepare('INSERT INTO products(name, price, color, active, photo) VALUES (?, ?, ?, ?, ?)').run(p.name, p.price, p.color, p.active, p.photo);
  res.json({ id: Number(r.lastInsertRowid) });
});
app.put('/api/products/:id', needAdmin, (req, res) => {
  const p = readProduct(req.body || {});
  if (p.error) return bad(res, p.error);
  db.prepare('UPDATE products SET name = ?, price = ?, color = ?, active = ?, photo = ? WHERE id = ?').run(p.name, p.price, p.color, p.active, p.photo, +req.params.id);
  res.json({ ok: true });
});
app.delete('/api/products/:id', needAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(+req.params.id);
  res.json({ ok: true });
});

/* ajustes e marca */
app.put('/api/settings', needAdmin, (req, res) => {
  const b = req.body || {};
  const next = {
    eventName: cleanName(b.eventName, 50) || DEFAULT_SETTINGS.eventName,
    beneficiary: cleanName(b.beneficiary, 60),
    paperWidth: +b.paperWidth === 58 ? 58 : 80,
    voucherHeight: Math.min(120, Math.max(20, Math.round(+b.voucherHeight) || 45)),
  };
  const up = db.prepare('INSERT INTO settings(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  for (const [k, v] of Object.entries(next)) up.run(k, JSON.stringify(v));
  res.json({ settings: getSettings() });
});

/* vendas */
const METHODS = ['dinheiro', 'pix', 'cartao'];
const saleRow = (r) => ({ id: r.id, n: r.id, at: r.at, userName: r.user_name, userId: r.user_id, items: JSON.parse(r.items), total: r.total, method: r.method, received: r.received, change: r.change, printed: !!r.printed });

app.post('/api/sales', (req, res) => {
  const { items, method, received } = req.body || {};
  if (!Array.isArray(items) || !items.length || items.length > 50) return bad(res, 'O pedido está vazio.');
  if (!METHODS.includes(method)) return bad(res, 'Forma de pagamento inválida.');
  const lines = [];
  let total = 0;
  let units = 0;
  for (const it of items) {
    const qty = Math.round(+it.qty);
    const p = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(+it.id);
    if (!p) return bad(res, 'Um dos produtos não está mais disponível. Atualize a tela.', 409);
    if (!(qty >= 1 && qty <= 99)) return bad(res, 'Quantidade inválida.');
    lines.push({ id: p.id, name: p.name, price: p.price, qty });
    total += p.price * qty;
    units += qty;
  }
  if (units > 500) return bad(res, 'Quantidade total acima do limite.');
  let rec = total;
  if (method === 'dinheiro' && received != null) rec = Math.round(+received);
  if (!Number.isInteger(rec) || rec < total) return bad(res, 'O valor recebido é menor que o total.');
  const at = new Date().toISOString();
  const r = db.prepare('INSERT INTO sales(at, user_id, user_name, items, total, method, received, change) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(at, req.user.id, req.user.name, JSON.stringify(lines), total, method, rec, rec - total);
  res.json({ sale: saleRow(db.prepare('SELECT * FROM sales WHERE id = ?').get(Number(r.lastInsertRowid))) });
});

app.get('/api/sales', (req, res) => {
  const since = req.query.since && !Number.isNaN(Date.parse(req.query.since)) ? new Date(req.query.since).toISOString() : '';
  let rows;
  if (req.user.role === 'admin') {
    rows = since ? db.prepare('SELECT * FROM sales WHERE at >= ? ORDER BY id DESC LIMIT 5000').all(since) : db.prepare('SELECT * FROM sales ORDER BY id DESC LIMIT 5000').all();
  } else {
    const from = since || new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    rows = db.prepare('SELECT * FROM sales WHERE user_id = ? AND at >= ? ORDER BY id DESC LIMIT 500').all(req.user.id, from);
  }
  res.json({ sales: rows.map(saleRow) });
});

app.post('/api/sales/:id/printed', (req, res) => {
  const row = db.prepare('SELECT user_id FROM sales WHERE id = ?').get(+req.params.id);
  if (!row || (req.user.role !== 'admin' && row.user_id !== req.user.id)) return bad(res, 'Venda não encontrada.', 404);
  db.prepare('UPDATE sales SET printed = 1 WHERE id = ?').run(+req.params.id);
  res.json({ ok: true });
});

/* usuários */
app.get('/api/users', needAdmin, (req, res) => {
  res.json({ users: db.prepare('SELECT id, username, name, role, active FROM users ORDER BY id').all().map((u) => ({ ...u, active: !!u.active })) });
});
app.post('/api/users', needAdmin, (req, res) => {
  const { name, username, password, role } = req.body || {};
  const un = cleanName(username, 30).toLowerCase();
  if (!cleanName(name, 60) || !un) return bad(res, 'Informe nome e usuário.');
  if (String(password || '').length < 6) return bad(res, 'A senha precisa ter pelo menos 6 caracteres.');
  if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(un)) return bad(res, 'Esse usuário já existe.', 409);
  const salt = crypto.randomBytes(16).toString('hex');
  db.prepare('INSERT INTO users(username, name, role, salt, hash) VALUES (?, ?, ?, ?, ?)').run(un, cleanName(name, 60), role === 'admin' ? 'admin' : 'caixa', salt, hashPw(password, salt));
  res.json({ ok: true });
});
app.put('/api/users/:id', needAdmin, (req, res) => {
  const id = +req.params.id;
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!u) return bad(res, 'Usuário não encontrado.', 404);
  const { name, password, role, active } = req.body || {};
  const nextRole = role === 'admin' ? 'admin' : 'caixa';
  const nextActive = active === false ? 0 : 1;
  const admins = db.prepare("SELECT COUNT(*) c FROM users WHERE role = 'admin' AND active = 1 AND id != ?").get(id).c;
  if (admins === 0 && (nextRole !== 'admin' || !nextActive)) return bad(res, 'Precisa existir pelo menos um administrador ativo.');
  if (password && String(password).length < 6) return bad(res, 'A senha precisa ter pelo menos 6 caracteres.');
  db.prepare('UPDATE users SET name = ?, role = ?, active = ? WHERE id = ?').run(cleanName(name, 60) || u.name, nextRole, nextActive, id);
  if (password) {
    const salt = crypto.randomBytes(16).toString('hex');
    db.prepare('UPDATE users SET salt = ?, hash = ? WHERE id = ?').run(salt, hashPw(String(password), salt), id);
  }
  if (!nextActive || password) db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
  res.json({ ok: true });
});

app.use('/api', (req, res) => bad(res, 'Não encontrado.', 404));

setInterval(() => db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now()), 3600 * 1000).unref();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\nCaixa rodando. Neste computador: http://localhost:${PORT}`);
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) if (i.family === 'IPv4' && !i.internal) console.log(`Outros aparelhos na rede: http://${i.address}:${PORT}`);
  }
});
