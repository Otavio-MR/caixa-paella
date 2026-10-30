const express = require('express');
const crypto = require('crypto');
const path = require('path');
const os = require('os');
const createStore = require('./store');

const PORT = +process.env.PORT || 3000;
const store = createStore();

const DEFAULT_SETTINGS = {
  eventName: 'Paella Mineira Solidária',
  beneficiary: 'Hospital do Câncer de Londrina',
  edition: '6ª edição',
  featuredProductId: null,
  paperWidth: 80,
  voucherHeight: 50,
};

// produto cujo contador (vendidas e disponíveis) aparece na tela inicial; sem escolha, usa a paella
function featuredOf(products, settings) {
  const p = products.find((x) => x.id === settings.featuredProductId)
    || products.find((x) => x.active && /paella/i.test(x.name))
    || products.find((x) => x.active);
  return p ? { id: p.id, name: p.name, stock: p.stock, sold: p.sold } : null;
}
const getSettings = async () => {
  const saved = await store.getSettings();
  const out = { ...DEFAULT_SETTINGS };
  for (const k of Object.keys(out)) if (k in saved) out[k] = saved[k];
  return out;
};

/* ---------- auth ---------- */
const hashPw = (pw, salt) => crypto.scryptSync(pw, salt, 64).toString('hex');
const checkPw = (pw, salt, hash) => crypto.timingSafeEqual(Buffer.from(hashPw(pw, salt), 'hex'), Buffer.from(hash, 'hex'));
const SESSION_MS = 12 * 3600 * 1000;

function cookie(req, name) {
  const m = (req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
}
async function startSession(req, res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  await store.createSession(token, userId, Date.now() + SESSION_MS);
  const secure = req.secure ? '; Secure' : '';
  res.setHeader('Set-Cookie', `sid=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}${secure}`);
}
async function currentUser(req) {
  const token = cookie(req, 'sid');
  if (!token) return null;
  return store.userForSession(token, Date.now());
}
const needAuth = async (req, res, next) => {
  const u = await currentUser(req);
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

/* ---------- demonstração ---------- */
// só com DEMO_ADMIN_PASSWORD definida e banco sem usuários
async function seedDemo() {
  const adminPw = process.env.DEMO_ADMIN_PASSWORD;
  const caixaPw = process.env.DEMO_CAIXA_PASSWORD;
  if (!adminPw || (await store.countUsers())) return;
  const addUser = async (username, name, role, pw) => {
    const salt = crypto.randomBytes(16).toString('hex');
    return store.insertUser({ username, name, role, salt, hash: hashPw(pw, salt) });
  };
  const admin = await addUser('admin', 'Administrador', 'admin', adminPw);
  const caixa = caixaPw ? await addUser('caixa', 'Caixa 1', 'caixa', caixaPw) : admin;
  const caixaName = caixaPw ? 'Caixa 1' : 'Administrador';
  if ((await store.countProducts()) === 0) {
    for (const [name, price, color] of [['Paella Mineira (1 kg)', 8000, '#E8833A'], ['Refrigerante lata', 600, '#D8573F'], ['Suco natural', 500, '#8EB36B'], ['Água mineral', 300, '#5FA8A0'], ['Pudim', 700, '#C98BB5']]) {
      await store.insertProduct({ name, price, color, active: true, photo: '' });
    }
  }
  let prods = await store.listProducts();
  for (const [i, qty] of [[0, 300], [1, 200], [2, 150], [3, 300], [4, 100]]) if (prods[i]) await store.setStock(prods[i].id, qty);
  prods = await store.listProducts();
  const sale = async (minAgo, uid, uname, picks, method, received) => {
    const items = picks.map(([i, qty]) => ({ id: prods[i].id, name: prods[i].name, price: prods[i].price, qty }));
    const total = items.reduce((a, it) => a + it.price * it.qty, 0);
    const rec = method === 'dinheiro' ? Math.max(total, received || total) : total;
    await store.reserveStock(items.map(({ id, qty }) => ({ id, qty })));
    return store.insertSale({ at: new Date(Date.now() - minAgo * 60000).toISOString(), user_id: uid, user_name: uname, items, total, method, received: rec, change: rec - total, printed: true });
  };
  await sale(185, caixa, caixaName, [[0, 2]], 'pix');
  await sale(170, caixa, caixaName, [[0, 1], [1, 1]], 'dinheiro', 10000);
  await sale(150, admin, 'Administrador', [[0, 4]], 'cartao');
  await sale(132, caixa, caixaName, [[0, 3], [2, 3]], 'dinheiro', 30000);
  await sale(118, caixa, caixaName, [[0, 1]], 'pix');
  await sale(97, admin, 'Administrador', [[0, 2], [3, 2]], 'dinheiro', 20000);
  await sale(80, caixa, caixaName, [[0, 5]], 'pix');
  await sale(64, caixa, caixaName, [[0, 1], [4, 2]], 'cartao');
  await sale(41, admin, 'Administrador', [[0, 2]], 'dinheiro', 20000);
  await sale(25, caixa, caixaName, [[0, 3], [1, 2]], 'pix');
  await sale(12, caixa, caixaName, [[0, 1], [2, 1]], 'dinheiro', 10000);
}

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
  // DELETE não leva corpo; o navegador só o envia entre origens com permissão (CORS), então é seguro liberar
  if (!['GET', 'HEAD', 'DELETE'].includes(req.method) && !req.is('application/json')) return res.status(415).json({ error: 'Formato inválido.' });
  next();
});
// alguns navegadores pedem /favicon.ico direto, ignorando o link da página
app.get('/favicon.ico', (req, res) => res.type('image/png').sendFile(path.join(__dirname, 'public', 'assets', 'mark', 'favicon.png')));
app.use(express.static(path.join(__dirname, 'public')));

// rotas assíncronas: qualquer erro cai no tratador no fim
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const bad = (res, msg, code = 400) => res.status(code).json({ error: msg });
const cleanName = (v, max) => String(v || '').trim().slice(0, max);

app.get('/api/me', wrap(async (req, res) => {
  const [users, settings, user, products] = await Promise.all([store.countUsers(), getSettings(), currentUser(req), store.listProducts()]);
  const f = featuredOf(products, settings);
  res.json({ user, needsSetup: users === 0, brand: { eventName: settings.eventName, beneficiary: settings.beneficiary, edition: settings.edition, featured: f ? { name: f.name, available: f.stock, sold: f.sold } : null } });
}));

app.post('/api/setup', wrap(async (req, res) => {
  if (await store.countUsers()) return bad(res, 'O sistema já foi configurado.', 403);
  const { name, username, password } = req.body || {};
  const un = cleanName(username, 30).toLowerCase();
  if (!cleanName(name, 60) || !un || String(password || '').length < 6) return bad(res, 'Informe nome, usuário e uma senha de pelo menos 6 caracteres.');
  const salt = crypto.randomBytes(16).toString('hex');
  const id = await store.insertUser({ username: un, name: cleanName(name, 60), role: 'admin', salt, hash: hashPw(password, salt) });
  await startSession(req, res, id);
  res.json({ ok: true });
}));

app.post('/api/login', wrap(async (req, res) => {
  const { username, password } = req.body || {};
  const un = cleanName(username, 30).toLowerCase();
  const key = req.ip + '|' + un;
  if (tooManyAttempts(key)) return bad(res, 'Muitas tentativas. Aguarde alguns minutos e tente de novo.', 429);
  const u = await store.findUserByUsername(un);
  if (!u || !u.active || !checkPw(String(password || ''), u.salt, u.hash)) {
    attempts.get(key).push(Date.now());
    return bad(res, 'Usuário ou senha incorretos.', 401);
  }
  attempts.delete(key);
  await startSession(req, res, u.id);
  res.json({ ok: true });
}));

app.post('/api/logout', wrap(async (req, res) => {
  const token = cookie(req, 'sid');
  if (token) await store.deleteSession(token);
  res.setHeader('Set-Cookie', 'sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  res.json({ ok: true });
}));

app.use('/api', wrap(needAuth));

app.get('/api/bootstrap', wrap(async (req, res) => {
  const [products, settings] = await Promise.all([store.listProducts(), getSettings()]);
  res.json({ products, settings, featured: featuredOf(products, settings) });
}));

/* produtos */
function readProduct(body) {
  const name = cleanName(body.name, 40);
  const price = Math.round(+body.price);
  const color = /^#[0-9a-f]{6}$/i.test(body.color) ? body.color : '#e8833a';
  if (!name) return { error: 'Informe o nome do produto.' };
  if (!Number.isInteger(price) || price <= 0 || price > 10000000) return { error: 'Informe um preço válido.' };
  const ph = String(body.photo || '');
  const photo = ph.length <= 450000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(ph) ? ph : '';
  let stock = null;
  if (body.stock !== undefined && body.stock !== null && body.stock !== '') {
    stock = Math.round(+body.stock);
    if (!Number.isInteger(stock) || stock < 0 || stock > 1000000) return { error: 'Estoque inválido.' };
  }
  return { name, price, color, photo, stock, active: body.active !== false };
}
app.post('/api/products', needAdmin, wrap(async (req, res) => {
  const p = readProduct(req.body || {});
  if (p.error) return bad(res, p.error);
  res.json({ id: await store.insertProduct(p) });
}));
app.put('/api/products/:id', needAdmin, wrap(async (req, res) => {
  const p = readProduct(req.body || {});
  if (p.error) return bad(res, p.error);
  await store.updateProduct(+req.params.id, p);
  res.json({ ok: true });
}));
app.delete('/api/products/:id', needAdmin, wrap(async (req, res) => {
  await store.deleteProduct(+req.params.id);
  res.json({ ok: true });
}));

/* estoque */
app.put('/api/products/:id/stock', needAdmin, wrap(async (req, res) => {
  const id = +req.params.id;
  const b = req.body || {};
  const prods = await store.listProducts();
  if (!prods.some((p) => p.id === id)) return bad(res, 'Produto não encontrado.', 404);
  if ('set' in b) {
    if (b.set === null || b.set === '') { await store.setStock(id, null); } else {
      const n = Math.round(+b.set);
      if (!Number.isInteger(n) || n < 0 || n > 1000000) return bad(res, 'Informe uma quantidade de 0 a 1.000.000.');
      await store.setStock(id, n);
    }
  } else if ('add' in b) {
    const n = Math.round(+b.add);
    if (!Number.isInteger(n) || Math.abs(n) > 1000000) return bad(res, 'Informe uma quantidade válida.');
    await store.addStock(id, n);
  } else {
    return bad(res, 'Nada para alterar.');
  }
  const p = (await store.listProducts()).find((x) => x.id === id);
  res.json({ product: p });
}));
app.post('/api/stock/reset-sold', needAdmin, wrap(async (req, res) => {
  await store.resetSold();
  res.json({ ok: true });
}));

/* ajustes */
app.put('/api/settings', needAdmin, wrap(async (req, res) => {
  const b = req.body || {};
  const fpId = Math.round(+b.featuredProductId);
  const fp = (await store.listProducts()).some((p) => p.id === fpId) ? fpId : null;
  await store.saveSettings({
    eventName: cleanName(b.eventName, 50) || DEFAULT_SETTINGS.eventName,
    beneficiary: cleanName(b.beneficiary, 60),
    edition: cleanName(b.edition, 30),
    featuredProductId: fp,
    paperWidth: +b.paperWidth === 58 ? 58 : 80,
    voucherHeight: Math.min(120, Math.max(20, Math.round(+b.voucherHeight) || 45)),
  });
  res.json({ settings: await getSettings() });
}));

/* vendas */
const METHODS = ['dinheiro', 'pix', 'cartao'];
const saleRow = (r) => ({ id: r.id, n: r.id, at: r.at, userName: r.user_name, userId: r.user_id, items: r.items, total: r.total, method: r.method, received: r.received, change: r.change, printed: !!r.printed });

app.post('/api/sales', wrap(async (req, res) => {
  const { items, method, received } = req.body || {};
  if (!Array.isArray(items) || !items.length || items.length > 50) return bad(res, 'O pedido está vazio.');
  if (!METHODS.includes(method)) return bad(res, 'Forma de pagamento inválida.');
  const lines = [];
  let total = 0;
  let units = 0;
  for (const it of items) {
    const qty = Math.round(+it.qty);
    const p = await store.findActiveProduct(+it.id);
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
  // baixa no estoque antes de gravar a venda: se não houver o bastante, nada é vendido
  const need = new Map();
  for (const l of lines) need.set(l.id, (need.get(l.id) || 0) + l.qty);
  const reserve = [...need].map(([id, qty]) => ({ id, qty }));
  const rs = await store.reserveStock(reserve);
  if (!rs.ok) {
    const msg = rs.available > 0 ? `Estoque insuficiente de ${rs.name}: restam ${rs.available}.` : `${rs.name || 'O produto'} esgotou.`;
    return res.status(409).json({ error: msg, productId: rs.id });
  }
  let row;
  try {
    row = await store.insertSale({ at: new Date().toISOString(), user_id: req.user.id, user_name: req.user.name, items: lines, total, method, received: rec, change: rec - total, printed: false });
  } catch (e) {
    await store.releaseStock(reserve);
    throw e;
  }
  res.json({ sale: saleRow(row) });
}));

app.get('/api/sales', wrap(async (req, res) => {
  const since = req.query.since && !Number.isNaN(Date.parse(req.query.since)) ? new Date(req.query.since).toISOString() : '';
  let rows;
  if (req.user.role === 'admin') {
    rows = await store.listSales({ since, limit: 5000 });
  } else {
    rows = await store.listSales({ since: since || new Date(Date.now() - 24 * 3600 * 1000).toISOString(), userId: req.user.id, limit: 500 });
  }
  res.json({ sales: rows.map(saleRow) });
}));

app.post('/api/sales/:id/printed', wrap(async (req, res) => {
  const row = await store.findSale(+req.params.id);
  if (!row || (req.user.role !== 'admin' && row.user_id !== req.user.id)) return bad(res, 'Venda não encontrada.', 404);
  await store.markPrinted(row.id);
  res.json({ ok: true });
}));

/* apagar vendas e recomeçar */
app.delete('/api/sales/:id', needAdmin, wrap(async (req, res) => {
  const s = await store.deleteSale(+req.params.id);
  if (!s) return bad(res, 'Venda não encontrada.', 404);
  const need = new Map();
  for (const it of s.items) need.set(it.id, (need.get(it.id) || 0) + it.qty);
  await store.releaseStock([...need].map(([id, qty]) => ({ id, qty }))); // os itens voltam para o estoque
  res.json({ ok: true, number: s.id });
}));
app.post('/api/sales/reset', needAdmin, wrap(async (req, res) => {
  await store.resetSales();
  res.json({ ok: true });
}));
app.post('/api/system/reset', needAdmin, wrap(async (req, res) => {
  if (!req.body || req.body.confirm !== 'APAGAR') return bad(res, 'Digite APAGAR para confirmar.');
  await store.wipeData();
  res.json({ ok: true });
}));

/* senha de quem está logado */
app.post('/api/me/password', wrap(async (req, res) => {
  const { current, next } = req.body || {};
  const u = await store.findUserById(req.user.id);
  if (!u || !checkPw(String(current || ''), u.salt, u.hash)) return bad(res, 'A senha atual está incorreta.', 403);
  if (String(next || '').length < 6) return bad(res, 'A nova senha precisa ter pelo menos 6 caracteres.');
  const salt = crypto.randomBytes(16).toString('hex');
  await store.setUserPassword(u.id, salt, hashPw(String(next), salt));
  await store.deleteSessionsOfUser(u.id, cookie(req, 'sid')); // sai dos outros aparelhos, continua neste
  res.json({ ok: true });
}));

/* usuários */
app.get('/api/users', needAdmin, wrap(async (req, res) => {
  res.json({ users: await store.listUsers() });
}));
app.post('/api/users', needAdmin, wrap(async (req, res) => {
  const { name, username, password, role } = req.body || {};
  const un = cleanName(username, 30).toLowerCase();
  if (!cleanName(name, 60) || !un) return bad(res, 'Informe nome e usuário.');
  if (String(password || '').length < 6) return bad(res, 'A senha precisa ter pelo menos 6 caracteres.');
  if (await store.findUserByUsername(un)) return bad(res, 'Esse usuário já existe.', 409);
  const salt = crypto.randomBytes(16).toString('hex');
  await store.insertUser({ username: un, name: cleanName(name, 60), role: role === 'admin' ? 'admin' : 'caixa', salt, hash: hashPw(password, salt) });
  res.json({ ok: true });
}));
app.put('/api/users/:id', needAdmin, wrap(async (req, res) => {
  const id = +req.params.id;
  const u = await store.findUserById(id);
  if (!u) return bad(res, 'Usuário não encontrado.', 404);
  const { name, password, role, active } = req.body || {};
  const nextRole = role === 'admin' ? 'admin' : 'caixa';
  const nextActive = active !== false;
  if ((await store.countOtherActiveAdmins(id)) === 0 && (nextRole !== 'admin' || !nextActive)) return bad(res, 'Precisa existir pelo menos um administrador ativo.');
  if (password && String(password).length < 6) return bad(res, 'A senha precisa ter pelo menos 6 caracteres.');
  await store.updateUser(id, { name: cleanName(name, 60) || u.name, role: nextRole, active: nextActive });
  if (password) {
    const salt = crypto.randomBytes(16).toString('hex');
    await store.setUserPassword(id, salt, hashPw(String(password), salt));
  }
  if (!nextActive || password) await store.deleteSessionsOfUser(id, id === req.user.id && nextActive ? cookie(req, 'sid') : null);
  res.json({ ok: true });
}));

app.use('/api', (req, res) => bad(res, 'Não encontrado.', 404));
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('Erro:', err && err.message);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Erro interno. Tente de novo em instantes.' });
});

async function main() {
  await store.init();
  await seedDemo();
  setInterval(() => store.purgeSessions(Date.now()).catch(() => {}), 3600 * 1000).unref();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\nBanco de dados: ${store.kind}`);
    console.log(`Caixa rodando. Neste computador: http://localhost:${PORT}`);
    for (const list of Object.values(os.networkInterfaces())) {
      for (const i of list || []) if (i.family === 'IPv4' && !i.internal) console.log(`Outros aparelhos na rede: http://${i.address}:${PORT}`);
    }
  });
}
main().catch((e) => { console.error('Não foi possível iniciar:', e.message); process.exit(1); });
