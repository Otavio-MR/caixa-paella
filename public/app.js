'use strict';

/* ---------- ícones: sprite autoral embutido na página ---------- */
const KIT = { cart: 'caixa', package: 'produtos', receipt: 'vendas', sliders: 'ajustes', users: 'equipe', printer: 'impressora', plus: 'mais', minus: 'menos', search: 'busca', trash: 'excluir', check: 'check', cash: 'dinheiro', qr: 'pix', card: 'cartao', pencil: 'editar', download: 'download', alert: 'alerta', logout: 'sair' };
const icon = (n) => `<svg class="i" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><use href="#i-${KIT[n] || n}"/></svg>`;

async function loadSprite() {
  if (document.getElementById('sprite')) return;
  try {
    const txt = await (await fetch('assets/icons.svg')).text();
    const d = document.createElement('div');
    d.id = 'sprite'; d.hidden = true; d.innerHTML = txt;
    document.body.prepend(d);
  } catch { /* sem sprite os ícones ficam vazios e o texto continua legível */ }
}

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const brl = (cents) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function parseMoney(str) {
  const t = String(str).replace(/[^\d,.]/g, '');
  if (!t) return 0;
  const clean = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t;
  const v = Math.round(parseFloat(clean) * 100);
  return Number.isFinite(v) ? v : 0;
}
const moneyInput = (cents) => (cents / 100).toFixed(2).replace('.', ',');
const COLORS = ['#E8833A', '#F2B35E', '#D8573F', '#8EB36B', '#5FA8A0', '#C98BB5', '#B79A7A'];
const COLOR_NAMES = { '#E8833A': 'Laranja', '#F2B35E': 'Amarelo', '#D8573F': 'Vermelho', '#8EB36B': 'Verde', '#5FA8A0': 'Azul esverdeado', '#C98BB5': 'Rosa', '#B79A7A': 'Areia' };
const METHODS = { dinheiro: ['Dinheiro', 'cash'], pix: ['Pix', 'qr'], cartao: ['Cartão', 'card'] };
const fmtDate = (iso) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.toISOString(); };
// ícone padrão do produto, escolhido pelo nome
const glyph = (name) => { const t = norm(name) + ' '; return /suco|refri|agua|cerveja|bebida|cha |cafe|vinho|guarana|copo|limonada/.test(t) ? 'copo' : /doce|sobremesa|pudim|bolo|torta|mousse|brigadeiro|sorvete|pave/.test(t) ? 'sobremesa' : /arroz|porcao|acompanh|feijao/.test(t) ? 'arroz' : /concha|sopa|caldo/.test(t) ? 'concha' : 'panela-lateral'; };
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- estado ---------- */
let me = null;
let brand = {};
let db = { products: [], settings: {} };
let cart = []; // [{id, qty}]
let method = 'dinheiro';
let received = '';
let search = '';
let view = 'caixa';
let printerError = false;
let salesFilter = 'hoje';
let busy = false;
let loadedSales = [];

async function api(m, url, body) {
  const res = await fetch(url, { method: m, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined, credentials: 'same-origin' });
  let data = {};
  try { data = await res.json(); } catch { /* resposta vazia */ }
  if (res.status === 401 && me) { me = null; authScreen(false, 'Sua sessão expirou. Entre de novo.'); }
  if (!res.ok) { const e = new Error(data.error || 'Não foi possível concluir. Tente de novo.'); e.status = res.status; throw e; }
  return data;
}
const failToast = (e) => toast(e.message, 'error');

/* ---------- voucher e impressão ---------- */
const MARK_PB = '<img class="lg" src="/assets/mark/emblema-pb.png" alt="">';

function voucherHtml(sale, s) {
  const w = s.paperWidth, h = s.voucherHeight;
  const when = fmtDate(sale.at);
  const pages = [];
  for (const it of sale.items) {
    for (let k = 1; k <= it.qty; k++) {
      const len = it.name.length;
      const fs = len <= 9 ? 12 : len <= 16 ? 9.5 : len <= 26 ? 7 : 5.5;
      pages.push(`<section class="v"><div class="vh">${MARK_PB}<div class="vt"><span class="ve">${esc(s.eventName)}</span></div></div><div class="n" style="font-size:${fs}mm">${esc(it.name)}</div><div class="bot"><b>${k}/${it.qty}</b><span>${esc(when)}</span><span>#${sale.n}</span></div>${s.beneficiary ? `<div class="ben">Em prol do ${esc(s.beneficiary)}</div>` : ''}</section>`);
    }
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Archivo;src:url(/assets/fonts/Archivo.ttf) format("truetype");font-weight:100 900;font-stretch:62% 125%}
@page{size:${w}mm ${h}mm;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#000;font-family:Archivo,Arial,Helvetica,sans-serif}
.v{width:${w}mm;height:${h}mm;padding:2mm 3mm;display:flex;flex-direction:column;justify-content:space-between;text-align:center;page-break-after:always;break-after:page;overflow:hidden}
.v:last-child{page-break-after:auto;break-after:auto}
.vh{display:flex;align-items:center;justify-content:center;gap:2mm;border-bottom:.4mm solid #000;padding-bottom:1mm}
.lg{height:11mm;width:11mm;flex:none}
.vt{display:flex;flex-direction:column;align-items:flex-start;line-height:1.05}
.ve{font-stretch:75%;font-weight:800;text-transform:uppercase;font-size:4.4mm;letter-spacing:.2mm}
.n{font-stretch:75%;font-weight:800;text-transform:uppercase;line-height:1.02;flex:1;display:flex;align-items:center;justify-content:center;overflow-wrap:anywhere}
.bot{display:flex;justify-content:space-between;align-items:baseline;font-size:3mm;border-top:.4mm dashed #000;padding-top:1mm;font-weight:600}
.bot b{font-stretch:75%;font-weight:800;font-size:5mm}
.ben{font-size:2.5mm;padding-top:.8mm}
</style></head><body>${pages.join('')}</body></html>`;
}

function printHtml(html) {
  return new Promise((resolve) => {
    const f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;width:0;height:0;border:0;opacity:0';
    f.srcdoc = html;
    f.onload = async () => {
      try {
        const d = f.contentDocument;
        await Promise.race([d.fonts.load('800 20px Archivo').then(() => d.fonts.ready), new Promise((r) => setTimeout(r, 1500))]);
        f.contentWindow.focus();
        f.contentWindow.print();
        resolve({ ok: true });
      } catch (e) { resolve({ ok: false, error: e.message }); }
      setTimeout(() => f.remove(), 5000);
    };
    document.body.appendChild(f);
  });
}
async function printSale(sale) {
  const res = await printHtml(voucherHtml(sale, db.settings));
  printerError = !res.ok;
  renderStatus();
  return res;
}

/* ---------- avisos e janelas ---------- */
function toast(msg, kind = 'ok', action) {
  const el = document.createElement('div');
  el.className = 'toast' + (kind === 'error' ? ' error' : '');
  el.innerHTML = `${icon(kind === 'error' ? 'alert' : 'check')}<span>${esc(msg)}</span>`;
  if (action) {
    const b = document.createElement('button');
    b.className = 'btn sm';
    b.textContent = action.label;
    b.onclick = () => { action.run(); el.remove(); };
    el.appendChild(b);
  }
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), kind === 'error' ? 9000 : 5000);
}

let lastFocus;
function modal(html, onMount) {
  lastFocus = document.activeElement;
  $('#modal-root').innerHTML = `<div class="scrim" data-scrim><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
  const first = $('#modal-root').querySelector('[autofocus], input, button');
  first && first.focus();
  onMount && onMount($('#modal-root'));
}
function closeModal() {
  $('#modal-root').innerHTML = '';
  lastFocus && lastFocus.focus && lastFocus.focus();
}
function confirmBox(title, text, okLabel, onOk) {
  modal(`<h2>${esc(title)}</h2><p>${esc(text)}</p><div class="actions"><button class="btn" data-close>Cancelar</button><button class="btn primary" id="ok" autofocus>${esc(okLabel)}</button></div>`,
    (r) => { r.querySelector('#ok').onclick = () => { closeModal(); onOk(); }; });
}
const emptyState = (title, text, action = '') => `<div class="empty"><strong>${title}</strong><p>${text}</p>${action}</div>`;

/* ---------- acesso ---------- */
function authScreen(setup, message) {
  $('#topbar').hidden = true;
  $('#view').className = 'bare';
  $('#view').innerHTML = `<div class="auth">
    <section class="auth-art" aria-hidden="true">
      <div class="collage">
        <figure class="ph a"><img src="assets/photos/login-panela.webp" alt=""></figure>
        <figure class="ph b"><img src="assets/photos/login-marmita.webp" alt=""></figure>
      </div>
    </section>
    <section class="auth-form">
      <div class="auth-wrap">
        <div class="auth-brand">
          <img class="login-logo" src="assets/mark/logo.png" alt="${esc(brand.eventName || 'Caixa')}">
        </div>
        <form id="lf" novalidate>
          <h1>${setup ? 'Primeiro acesso' : 'Entrar'}</h1>
          <p class="sub">${setup ? 'Crie o administrador do sistema. Ele cadastra produtos e a equipe.' : 'Use o usuário e a senha que o administrador criou para você.'}</p>
          ${setup ? '<div class="field"><label for="ln">Seu nome</label><input class="input" id="ln" autocomplete="name"></div>' : ''}
          <div class="field"><label for="lu">Usuário</label><input class="input" id="lu" autocomplete="username" autocapitalize="none" spellcheck="false"></div>
          <div class="field"><label for="lp">Senha${setup ? ' (mínimo 6 caracteres)' : ''}</label><input class="input" id="lp" type="password" autocomplete="${setup ? 'new-password' : 'current-password'}"></div>
          <div class="err" id="lerr" role="alert">${esc(message || '')}</div>
          <button class="btn primary" type="submit">${setup ? 'Criar administrador' : 'Entrar'}</button>
        </form>
        ${brand.beneficiary || brand.organizer ? `<p class="auth-foot">${brand.beneficiary ? 'Em prol do ' + esc(brand.beneficiary) + '. ' : ''}${brand.organizer ? esc(brand.organizer) : ''}</p>` : ''}
      </div>
    </section></div>`;
  (setup ? $('#ln') : $('#lu')).focus();
  $('#lf').onsubmit = async (e) => {
    e.preventDefault();
    const body = { username: $('#lu').value, password: $('#lp').value };
    if (setup) body.name = $('#ln').value;
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    try { await api('POST', setup ? '/api/setup' : '/api/login', body); await boot(); }
    catch (err) { $('#lerr').textContent = err.message; btn.disabled = false; $('#lp').select(); }
  };
}

/* ---------- pedido ---------- */
const prod = (id) => db.products.find((p) => p.id === +id);
const lines = () => cart.map((c) => ({ ...c, p: prod(c.id) })).filter((l) => l.p);
const total = () => lines().reduce((a, l) => a + l.p.price * l.qty, 0);
const unitCount = () => lines().reduce((a, l) => a + l.qty, 0);

function addToCart(id, qty = 1) {
  const l = cart.find((c) => c.id === +id);
  if (l) l.qty = Math.min(99, l.qty + qty); else cart.push({ id: +id, qty: Math.min(99, qty) });
  renderCaixa(false);
}
function setQty(id, qty) {
  cart = qty <= 0 ? cart.filter((c) => c.id !== +id) : cart.map((c) => (c.id === +id ? { ...c, qty: Math.min(qty, 99) } : c));
  renderCaixa(false);
}
function parseSearch(q) {
  const m = q.match(/^\s*(\d{1,2})\s*[x*×]?\s*(.*)$/i);
  return m ? { qty: Math.max(1, +m[1]), term: m[2].trim() } : { qty: 1, term: q.trim() };
}
function matches() {
  const t = norm(parseSearch(search).term);
  return db.products.filter((p) => p.active && (!t || norm(p.name).includes(t)));
}

// o canhoto do pedido sai do painel quando a venda é confirmada
function tearSlip() {
  const el = $('.slip');
  if (!el || reduced()) return;
  const r = el.getBoundingClientRect();
  const g = el.cloneNode(true);
  g.classList.add('ghost');
  g.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  Object.assign(g.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', margin: '0', zIndex: 40 });
  document.body.appendChild(g);
  g.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-12%)', opacity: 0 }], { duration: 420, easing: 'cubic-bezier(.16, 1, .3, 1)' }).onfinish = () => g.remove();
}

async function confirmSale() {
  const ls = lines();
  const t = total();
  if (!ls.length || busy) return;
  const rec = method === 'dinheiro' ? parseMoney(received) || t : t;
  if (method === 'dinheiro' && rec < t) return;
  busy = true;
  renderCart();
  let sale;
  try {
    sale = (await api('POST', '/api/sales', { items: ls.map((l) => ({ id: l.id, qty: l.qty })), method, received: rec })).sale;
  } catch (e) {
    busy = false;
    renderCart();
    if (e.status === 409) await refreshProducts();
    return failToast(e);
  }
  busy = false;
  const units = sale.items.reduce((a, i) => a + i.qty, 0);
  tearSlip();
  cart = []; received = ''; search = '';
  renderCaixa(true);
  const res = await printSale(sale);
  if (res.ok) api('POST', `/api/sales/${sale.id}/printed`, {}).catch(() => {});
  if (res.ok) toast(`Venda ${sale.n} confirmada. ${units} ${units === 1 ? 'voucher enviado' : 'vouchers enviados'} para impressão.`, 'ok', { label: 'Reimprimir', run: () => reprint(sale) });
  else toast(`Venda ${sale.n} salva, mas a impressão falhou${res.error ? ' (' + res.error + ')' : ''}.`, 'error', { label: 'Tentar de novo', run: () => reprint(sale) });
}
async function reprint(sale) {
  const res = await printSale(sale);
  if (res.ok) api('POST', `/api/sales/${sale.id}/printed`, {}).catch(() => {});
  toast(res.ok ? `Vouchers da venda ${sale.n} reenviados.` : 'A impressão falhou. Verifique a impressora.', res.ok ? 'ok' : 'error');
}
async function refreshProducts() {
  db = await api('GET', '/api/bootstrap');
  cart = cart.filter((c) => prod(c.id) && prod(c.id).active);
  view === 'caixa' && renderCaixa(false);
}

/* ---------- navegação ---------- */
const isAdmin = () => me && me.role === 'admin';
function renderChrome() {
  $('#topbar').hidden = false;
  $('#view').className = '';
  $('#brand').innerHTML = `<img class="logo-full" src="assets/mark/logo.png" alt="${esc(brand.eventName || 'Caixa')}">`;
  const tabs = [['caixa', 'Caixa', 'cart', 'F1'], ['vendas', isAdmin() ? 'Vendas' : 'Minhas vendas', 'receipt', 'F3']];
  if (isAdmin()) tabs.push(['produtos', 'Produtos', 'package', 'F4'], ['usuarios', 'Equipe', 'users', ''], ['config', 'Ajustes', 'sliders', '']);
  $('#tabs').innerHTML = tabs.map(([k, l, ic, key]) => `<button class="tab" data-view="${k}" ${view === k ? 'aria-current="page"' : ''}>${icon(ic)}<span>${l}</span>${key ? `<kbd>${key}</kbd>` : ''}</button>`).join('');
  $('#who').textContent = me.name;
  $('#logout').innerHTML = `${icon('logout')}Sair`;
  renderStatus();
}
function renderStatus() {
  const s = $('#status');
  if (!s) return;
  s.className = 'status' + (printerError ? ' warn' : '');
  s.innerHTML = `<span class="st-text">${printerError ? 'Falha na impressão' : 'Impressão pronta'}</span>`;
}
function go(v) {
  view = v;
  renderChrome();
  ({ caixa: () => renderCaixa(true), produtos: renderProdutos, vendas: renderVendas, usuarios: renderUsuarios, config: renderConfig })[v]();
}

/* ---------- caixa ---------- */
function renderCaixa(full) {
  if (view !== 'caixa') return;
  if (full || !$('.pos')) {
    $('#view').innerHTML = `<div class="pos">
      <section class="catalog" aria-label="Produtos">
        <label class="search">${icon('search')}<input id="search" type="search" autocomplete="off" placeholder="Buscar produto. Ex.: 5 paella e Enter" aria-label="Buscar produto"><kbd>F2</kbd></label>
        <div class="hint" id="hint"></div>
        <div class="grid" id="grid"></div>
      </section>
      <aside class="slip" aria-label="Pedido atual">
        <div class="slip-head"><div><h2>Pedido</h2><small id="count"></small></div><button class="btn ghost sm" id="clear">Limpar</button></div>
        <div class="lines" id="lines"></div>
        <div class="slip-foot" id="pay"></div>
      </aside>
    </div>`;
    $('#search').value = search;
  }
  renderGrid();
  renderCart();
  if (full) $('#search') && $('#search').focus();
}

function renderGrid() {
  const list = matches();
  const { qty, term } = parseSearch(search);
  const inCart = Object.fromEntries(cart.map((c) => [c.id, c.qty]));
  const any = db.products.some((p) => p.active);
  $('#grid').innerHTML = list.length
    ? list.map((p, i) => `<button class="tile ${inCart[p.id] ? 'sel' : ''} ${term && i === 0 ? 'hit' : ''}" data-add="${p.id}" aria-label="Adicionar ${esc(p.name)}, ${brl(p.price)}">
        ${inCart[p.id] ? `<span class="count">${inCart[p.id]}</span>` : ''}<span class="media">${p.photo ? `<img src="${esc(p.photo)}" alt="">` : icon(glyph(p.name))}</span><span class="info"><span class="name"><span class="dot" style="--c:${p.color}"></span>${esc(p.name)}</span><span class="price">${brl(p.price)}</span></span></button>`).join('')
    : (any ? emptyState('Nenhum produto encontrado', 'Confira o nome digitado ou limpe a busca com Esc.') : emptyState('Nenhum produto cadastrado', 'Peça ao administrador para cadastrar os produtos.'));
  $('#hint').textContent = term && list[0] ? `Enter adiciona ${qty} × ${list[0].name}` : search ? '' : 'Digite a quantidade antes do nome (5 paella) e aperte Enter. Alt+1, 2 ou 3 escolhe o pagamento.';
}

function renderCart() {
  const ls = lines();
  const t = total();
  const units = unitCount();
  $('#count').textContent = units ? `${units} ${units === 1 ? 'voucher será impresso' : 'vouchers serão impressos'}` : 'Nenhum item';
  $('#clear').disabled = !ls.length;
  $('#lines').innerHTML = ls.length
    ? ls.map((l) => `<div class="line"><span class="ln">${esc(l.p.name)}<span class="unit">${brl(l.p.price)} cada</span></span>
        <span class="stepper"><button data-dec="${l.id}" aria-label="Diminuir ${esc(l.p.name)}">${icon('minus')}</button><output aria-label="Quantidade">${l.qty}</output><button data-inc="${l.id}" aria-label="Aumentar ${esc(l.p.name)}">${icon('plus')}</button></span>
        <span class="ls">${brl(l.p.price * l.qty)}</span></div>`).join('')
    : emptyState('Pedido vazio', 'Toque em um produto ou digite o nome na busca.');
  const rec = parseMoney(received);
  const missing = Math.max(0, t - rec);
  const canGo = ls.length && !busy && (method !== 'dinheiro' || !received || rec >= t);
  const keep = document.activeElement && document.activeElement.id === 'received';
  $('#pay').innerHTML = `
    <div class="total"><span>Total</span><strong>${brl(t)}</strong></div>
    <div class="seg" role="group" aria-label="Forma de pagamento">${Object.entries(METHODS).map(([k, [l, ic]]) => `<button data-method="${k}" aria-pressed="${method === k}">${icon(ic)}${l}</button>`).join('')}</div>
    ${method === 'dinheiro' ? `<div class="cash">
      <div class="field"><label for="received">Valor recebido</label><input class="input big" id="received" inputmode="decimal" autocomplete="off" placeholder="${moneyInput(t)}" value="${esc(received)}"></div>
      <div class="quick"><button class="btn sm" data-exact ${ls.length ? '' : 'disabled'}>Exato</button>${[10, 20, 50, 100].map((v) => `<button class="btn sm" data-bill="${v}">R$ ${v}</button>`).join('')}</div>
      <div class="change ${received ? (missing ? 'low' : 'ok') : ''}"><span>${received && missing ? 'Faltam' : 'Troco'}</span><strong>${brl(received ? (missing ? missing : rec - t) : 0)}</strong></div>
    </div>` : ''}
    <button class="btn primary go" id="go" ${canGo ? '' : 'disabled'}>${icon('printer')}Confirmar e imprimir<kbd>F9</kbd></button>`;
  if (keep) { const n = $('#received'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }
}

/* ---------- produtos (admin) ---------- */
// recorta a foto em quadrado e reduz, para caber no banco de dados
function squareImage(file, size) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(img.width, img.height);
      const c = document.createElement('canvas');
      c.width = c.height = size;
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      let q = 0.84; let out = c.toDataURL('image/jpeg', q);
      while (out.length > 400000 && q > 0.4) { q -= 0.1; out = c.toDataURL('image/jpeg', q); }
      resolve(out);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Não foi possível ler essa imagem. Use JPG, PNG ou WebP.')); };
    img.src = url;
  });
}
function renderProdutos() {
  const ps = db.products;
  $('#view').innerHTML = `<div class="page compact">
    <div class="page-head"><h1>Produtos</h1><div class="tools"><button class="btn primary" data-edit="new">${icon('plus')}Novo produto</button></div></div>
    <div class="panel">${ps.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Produto</th><th class="r">Preço</th><th><span class="sr-only">Ações</span></th></tr></thead><tbody>${ps.map((p) => `<tr>
      <td><span class="dotc" style="--c:${p.color}"></span><span class="strong">${esc(p.name)}</span> ${p.active ? '' : '<span class="badge off">Oculto no caixa</span>'}</td>
      <td class="r">${brl(p.price)}</td>
      <td class="act"><button class="btn sm" data-edit="${p.id}" aria-label="Editar ${esc(p.name)}">${icon('pencil')}Editar</button><button class="btn sm danger" data-del="${p.id}" aria-label="Excluir ${esc(p.name)}">${icon('trash')}Excluir</button></td></tr>`).join('')}</tbody></table></div>`
    : `<div class="pad">${emptyState('Nenhum produto', 'Cadastre o primeiro produto para começar a vender.', `<button class="btn primary" data-edit="new">${icon('plus')}Novo produto</button>`)}</div>`}</div></div>`;
}

function editProduct(id) {
  const p = id === 'new' ? { id: null, name: '', price: 0, color: COLORS[db.products.length % COLORS.length], active: true, photo: '' } : { ...prod(id) };
  modal(`<h2>${id === 'new' ? 'Novo produto' : 'Editar produto'}</h2>
    <form class="form" id="pf" novalidate>
      <div class="field"><label for="pn">Nome (aparece no voucher)</label><input class="input" id="pn" value="${esc(p.name)}" maxlength="40" autocomplete="off" autofocus></div>
      <div class="field"><label for="pp">Preço (R$)</label><input class="input" id="pp" inputmode="decimal" value="${p.price ? moneyInput(p.price) : ''}" placeholder="0,00" autocomplete="off"></div>
      <div class="field"><label for="ppick">Foto do produto (opcional)</label>
        <div class="photo-pick"><span class="media" id="pprev"></span><div class="photo-actions"><input id="pfile" type="file" accept="image/*" hidden><button type="button" class="btn" id="ppick">Escolher foto</button><button type="button" class="btn ghost" id="prem">Remover foto</button></div></div>
        <span class="sub">Sem foto, o produto usa o ícone padrão.</span></div>
      <div class="field"><label id="cl">Cor de identificação</label><div class="swatches" role="group" aria-labelledby="cl">${COLORS.map((c) => `<button type="button" style="--c:${c}" data-color="${c}" aria-pressed="${p.color === c}" aria-label="Cor ${COLOR_NAMES[c] || c}">${icon('check')}</button>`).join('')}</div></div>
      <label class="switch"><input type="checkbox" id="pa" ${p.active ? 'checked' : ''}>Mostrar no caixa</label>
      <div class="err" id="perr" role="alert"></div>
      <div class="actions"><button type="button" class="btn" data-close>Cancelar</button><button class="btn primary" type="submit">Salvar</button></div>
    </form>`, (r) => {
    const prev = () => { r.querySelector('#pprev').innerHTML = p.photo ? `<img src="${esc(p.photo)}" alt="">` : icon(glyph(r.querySelector('#pn').value || ' ')); r.querySelector('#prem').disabled = !p.photo; };
    r.querySelector('#pn').addEventListener('input', () => { if (!p.photo) prev(); });
    r.querySelector('#ppick').onclick = () => r.querySelector('#pfile').click();
    r.querySelector('#prem').onclick = () => { p.photo = ''; prev(); };
    r.querySelector('#pfile').onchange = async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try { p.photo = await squareImage(f, 480); r.querySelector('#perr').textContent = ''; prev(); } catch (er) { r.querySelector('#perr').textContent = er.message; }
    };
    prev();
    r.querySelectorAll('[data-color]').forEach((b) => (b.onclick = () => {
      p.color = b.dataset.color;
      r.querySelectorAll('[data-color]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    }));
    r.querySelector('#pf').onsubmit = async (e) => {
      e.preventDefault();
      const name = r.querySelector('#pn').value.trim();
      const price = parseMoney(r.querySelector('#pp').value);
      const err = r.querySelector('#perr');
      if (!name) { err.textContent = 'Informe o nome do produto.'; r.querySelector('#pn').focus(); return; }
      if (price <= 0) { err.textContent = 'Informe um preço maior que zero. Ex.: 8,50'; r.querySelector('#pp').focus(); return; }
      const body = { name, price, color: p.color, active: r.querySelector('#pa').checked, photo: p.photo || '' };
      try {
        await (p.id ? api('PUT', `/api/products/${p.id}`, body) : api('POST', '/api/products', body));
        await refreshProducts(); closeModal(); renderProdutos(); toast('Produto salvo.');
      } catch (er) { err.textContent = er.message; }
    };
  });
}

/* ---------- vendas ---------- */
async function renderVendas() {
  $('#view').innerHTML = `<div class="page"><div class="empty"><p>Carregando vendas</p></div></div>`;
  let list;
  try {
    const since = !isAdmin() || salesFilter === 'hoje' ? startOfToday() : '';
    list = (await api('GET', '/api/sales' + (since ? `?since=${encodeURIComponent(since)}` : ''))).sales;
  } catch (e) { failToast(e); return ($('#view').innerHTML = `<div class="page"><div class="panel"><div class="pad">${emptyState('Não foi possível carregar as vendas', esc(e.message), '<button class="btn primary" data-retry>Tentar de novo</button>')}</div></div></div>`); }
  if (view !== 'vendas') return;
  loadedSales = list;
  const sum = (arr) => arr.reduce((a, s) => a + s.total, 0);
  const units = list.reduce((a, s) => a + s.items.reduce((b, i) => b + i.qty, 0), 0);
  const byProd = {}; const byUser = {};
  list.forEach((s) => { s.items.forEach((i) => (byProd[i.name] = (byProd[i.name] || 0) + i.qty)); byUser[s.userName] = (byUser[s.userName] || 0) + s.total; });
  const li = (a, b) => `<li><span>${a}</span><strong>${b}</strong></li>`;
  const scope = isAdmin() ? (salesFilter === 'hoje' ? 'hoje' : 'registrada') : 'hoje';
  $('#view').innerHTML = `<div class="page">
    <div class="page-head"><h1>${isAdmin() ? 'Vendas' : 'Minhas vendas'}</h1><div class="tools">
      ${isAdmin() ? `<div class="seg2" role="group" aria-label="Período"><button data-filter="hoje" aria-pressed="${salesFilter === 'hoje'}">Hoje</button><button data-filter="tudo" aria-pressed="${salesFilter === 'tudo'}">Tudo</button></div>
      <button class="btn" id="csv" ${list.length ? '' : 'disabled'}>${icon('download')}Exportar CSV</button>` : ''}</div></div>
    <dl class="summary"><div><dt>Faturamento</dt><dd>${brl(sum(list))}</dd></div><div><dt>Vendas</dt><dd>${list.length}</dd></div><div><dt>Vouchers emitidos</dt><dd>${units}</dd></div></dl>
    ${list.length ? `<div class="breakdown">
      <div><h2>Por forma de pagamento</h2><ul>${Object.entries(METHODS).map(([k, [l]]) => li(l, brl(sum(list.filter((s) => s.method === k))))).join('')}</ul></div>
      <div><h2>Por produto</h2><ul>${Object.entries(byProd).map(([n, q]) => li(esc(n), q + ' un.')).join('')}</ul></div>
      ${isAdmin() ? `<div><h2>Por caixa</h2><ul>${Object.entries(byUser).map(([n, v]) => li(esc(n), brl(v))).join('')}</ul></div>` : ''}</div>` : ''}
    <div class="panel">${list.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Venda</th><th>Data e hora</th>${isAdmin() ? '<th>Caixa</th>' : ''}<th>Itens</th><th>Pagamento</th><th class="r">Total</th><th><span class="sr-only">Ações</span></th></tr></thead><tbody>${list.map((s) => `<tr>
      <td class="strong">${s.n}</td><td class="nw">${fmtDate(s.at)}</td>${isAdmin() ? `<td class="nw">${esc(s.userName)}</td>` : ''}
      <td>${s.items.map((i) => `${i.qty}× ${esc(i.name)}`).join(', ')}</td>
      <td class="nw">${METHODS[s.method][0]}</td><td class="r strong">${brl(s.total)}</td>
      <td class="act">${s.printed ? '' : '<span class="badge warn">Não impresso</span> '}<button class="btn sm" data-reprint="${s.id}">${icon('printer')}Reimprimir</button></td></tr>`).join('')}</tbody></table></div>`
    : `<div class="pad">${emptyState('Nenhuma venda ' + scope + ' ainda', 'As vendas confirmadas aparecem aqui.')}</div>`}</div></div>`;
}

function exportCsv() {
  const rows = [['Venda', 'Data', 'Caixa', 'Pagamento', 'Itens', 'Total']];
  loadedSales.forEach((s) => rows.push([s.n, new Date(s.at).toLocaleString('pt-BR'), s.userName, METHODS[s.method][0], s.items.map((i) => `${i.qty}x ${i.name}`).join(' | '), (s.total / 100).toFixed(2).replace('.', ',')]));
  const csv = '﻿' + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `vendas-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ---------- equipe (admin) ---------- */
async function renderUsuarios() {
  let users;
  try { users = (await api('GET', '/api/users')).users; } catch (e) { failToast(e); return ($('#view').innerHTML = `<div class="page compact"><div class="panel"><div class="pad">${emptyState('Não foi possível carregar a equipe', esc(e.message), '<button class="btn primary" data-retry>Tentar de novo</button>')}</div></div></div>`); }
  if (view !== 'usuarios') return;
  $('#view').innerHTML = `<div class="page compact">
    <div class="page-head"><h1>Equipe</h1><div class="tools"><button class="btn primary" data-user="new">${icon('plus')}Novo usuário</button></div></div>
    <div class="panel"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nome</th><th>Usuário</th><th>Perfil</th><th>Situação</th><th><span class="sr-only">Ações</span></th></tr></thead><tbody>${users.map((u) => `<tr>
      <td class="strong">${esc(u.name)}</td><td>${esc(u.username)}</td><td>${u.role === 'admin' ? 'Administrador' : 'Caixa'}</td>
      <td>${u.active ? 'Ativo' : '<span class="badge off">Desativado</span>'}</td>
      <td class="act"><button class="btn sm" data-user='${esc(JSON.stringify(u))}' aria-label="Editar ${esc(u.name)}">${icon('pencil')}Editar</button></td></tr>`).join('')}</tbody></table></div></div></div>`;
}

function editUser(raw) {
  const u = raw === 'new' ? { id: null, name: '', username: '', role: 'caixa', active: true } : JSON.parse(raw);
  modal(`<h2>${u.id ? 'Editar usuário' : 'Novo usuário'}</h2>
    <form class="form" id="uf" novalidate>
      <div class="field"><label for="un">Nome</label><input class="input" id="un" value="${esc(u.name)}" maxlength="60" autocomplete="off" autofocus></div>
      <div class="field"><label for="uu">Usuário (para entrar)</label><input class="input" id="uu" value="${esc(u.username)}" maxlength="30" autocomplete="off" autocapitalize="none" ${u.id ? 'readonly' : ''}></div>
      <div class="field"><label for="up">${u.id ? 'Nova senha (deixe vazio para manter)' : 'Senha (mínimo 6 caracteres)'}</label><input class="input" id="up" type="text" autocomplete="off"></div>
      <div class="field"><label for="ur">Perfil</label><select class="input" id="ur"><option value="caixa" ${u.role === 'caixa' ? 'selected' : ''}>Caixa (vende e imprime)</option><option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Administrador (tudo)</option></select></div>
      ${u.id ? `<label class="switch"><input type="checkbox" id="ua" ${u.active ? 'checked' : ''}>Pode entrar no sistema</label>` : ''}
      <div class="err" id="uerr" role="alert"></div>
      <div class="actions"><button type="button" class="btn" data-close>Cancelar</button><button class="btn primary" type="submit">Salvar</button></div>
    </form>`, (r) => {
    r.querySelector('#uf').onsubmit = async (e) => {
      e.preventDefault();
      const body = { name: r.querySelector('#un').value, username: r.querySelector('#uu').value, password: r.querySelector('#up').value, role: r.querySelector('#ur').value, active: u.id ? r.querySelector('#ua').checked : true };
      try {
        await (u.id ? api('PUT', `/api/users/${u.id}`, body) : api('POST', '/api/users', body));
        closeModal(); renderUsuarios(); toast('Usuário salvo.');
      } catch (er) { r.querySelector('#uerr').textContent = er.message; }
    };
  });
}

/* ---------- ajustes (admin) ---------- */
function renderConfig() {
  const s = db.settings;
  $('#view').innerHTML = `<div class="page narrow">
    <div class="page-head"><h1>Ajustes</h1></div>
    <form class="form" id="cf" novalidate>
      <section class="panel"><div class="pad form">
        <div><h2>Textos do voucher</h2><p class="lead">Aparecem no topo e no rodapé de cada voucher impresso.</p></div>
        <div class="form two">
          <div class="field" style="grid-column: 1 / -1"><label for="cn">Nome do evento</label><input class="input" id="cn" value="${esc(s.eventName)}" maxlength="50"></div>
          <div class="field"><label for="cb">Em prol de</label><input class="input" id="cb" value="${esc(s.beneficiary)}" maxlength="60"></div>
          <div class="field"><label for="co">Organização</label><input class="input" id="co" value="${esc(s.organizer)}" maxlength="60"></div>
        </div>
      </div></section>
      <section class="panel"><div class="pad form">
        <div><h2>Papel da impressora</h2><p class="lead">Para imprimir direto, sem janela de confirmação, abra o caixa pelo atalho "Abrir Caixa.bat" e deixe a impressora térmica como padrão do Windows.</p></div>
        <div class="form two">
          <div class="field"><label for="cw">Largura do papel</label><select class="input" id="cw"><option value="58" ${s.paperWidth === 58 ? 'selected' : ''}>58 mm</option><option value="80" ${s.paperWidth === 80 ? 'selected' : ''}>80 mm</option></select></div>
          <div class="field"><label for="ch">Altura de cada voucher (mm)</label><input class="input" id="ch" type="number" min="20" max="120" value="${s.voucherHeight}"></div>
        </div>
      </div></section>
      <div class="err" id="cerr" role="alert"></div>
      <div class="form-actions"><button class="btn primary" type="submit">${icon('check')}Salvar ajustes</button><button class="btn" type="button" id="test">${icon('printer')}Imprimir voucher de teste</button></div>
    </form></div>`;
  const read = () => ({ eventName: $('#cn').value, beneficiary: $('#cb').value, organizer: $('#co').value, paperWidth: +$('#cw').value, voucherHeight: +$('#ch').value });
  const save = async () => {
    const r = await api('PUT', '/api/settings', read());
    db.settings = r.settings;
    brand = { eventName: r.settings.eventName, beneficiary: r.settings.beneficiary, organizer: r.settings.organizer };
    document.title = brand.eventName || 'Caixa';
    renderChrome();
  };
  $('#cf').onsubmit = async (e) => {
    e.preventDefault();
    try { await save(); toast('Ajustes salvos.'); } catch (er) { $('#cerr').textContent = er.message; }
  };
  $('#test').onclick = async () => {
    try { await save(); } catch (er) { return ($('#cerr').textContent = er.message); }
    const res = await printSale({ n: 0, at: new Date().toISOString(), items: [{ name: 'TESTE', qty: 2 }] });
    toast(res.ok ? 'Voucher de teste enviado.' : `Falha ao imprimir${res.error ? ': ' + res.error : '.'}`, res.ok ? 'ok' : 'error');
  };
}

/* ---------- eventos ---------- */
document.addEventListener('click', (e) => {
  const t = e.target.closest('button, [data-scrim]');
  if (!t) return;
  const d = t.dataset;
  if (t.matches('[data-scrim]')) { if (e.target === t) closeModal(); return; }
  if ('close' in d) return closeModal();
  if (d.view) return go(d.view);
  if (t.id === 'logout') return api('POST', '/api/logout', {}).finally(() => { me = null; cart = []; boot(); });
  if (d.add) return addToCart(d.add, 1);
  if (d.inc) return setQty(d.inc, cart.find((c) => c.id === +d.inc).qty + 1);
  if (d.dec) return setQty(d.dec, cart.find((c) => c.id === +d.dec).qty - 1);
  if (d.method) { method = d.method; return renderCart(); }
  if ('exact' in d) { received = moneyInput(total()); return renderCart(); }
  if (d.bill) { received = moneyInput(+d.bill * 100); return renderCart(); }
  if (t.id === 'clear') return confirmBox('Limpar pedido?', 'Todos os itens do pedido atual serão removidos.', 'Limpar', () => { cart = []; received = ''; renderCaixa(true); });
  if (t.id === 'go') return confirmSale();
  if (d.edit) return editProduct(d.edit);
  if (d.del) {
    const p = prod(d.del);
    return confirmBox(`Excluir ${p.name}?`, 'O produto some do caixa. As vendas já feitas não mudam.', 'Excluir', async () => {
      try { await api('DELETE', `/api/products/${p.id}`); await refreshProducts(); renderProdutos(); toast('Produto excluído.'); } catch (er) { failToast(er); }
    });
  }
  if (d.user) return editUser(d.user);
  if ('retry' in d) return go(view);
  if (d.filter) { salesFilter = d.filter; return renderVendas(); }
  if (t.id === 'csv') return exportCsv();
  if (d.reprint) return reprint(loadedSales.find((s) => s.id === +d.reprint));
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'search') { search = e.target.value; renderGrid(); }
  if (e.target.id === 'received') { received = e.target.value; renderCart(); }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if ($('#modal-root').firstChild) return closeModal();
    if (view === 'caixa' && search && $('#search')) { search = ''; $('#search').value = ''; renderGrid(); }
    return;
  }
  if ($('#modal-root').firstChild) {
    if (e.key === 'Tab') { // mantém o foco dentro da janela
      const f = [...$('#modal-root').querySelectorAll('button, input, select')].filter((x) => !x.disabled && !x.hidden);
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
    return;
  }
  if (!me) return;
  if (e.key === 'F1') { e.preventDefault(); return go('caixa'); }
  if (e.key === 'F3') { e.preventDefault(); return go('vendas'); }
  if (e.key === 'F4' && isAdmin()) { e.preventDefault(); return go('produtos'); }
  if (e.key === 'F2') { e.preventDefault(); if (view !== 'caixa') go('caixa'); $('#search').focus(); $('#search').select(); return; }
  if (view !== 'caixa' || !$('#search')) return;
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); $('#search').focus(); $('#search').select(); return; }
  if (e.key === 'F9' || (e.key === 'Enter' && e.ctrlKey)) { e.preventDefault(); confirmSale(); return; }
  if (e.altKey && ['1', '2', '3'].includes(e.key)) { e.preventDefault(); method = ['dinheiro', 'pix', 'cartao'][+e.key - 1]; renderCart(); if (method === 'dinheiro') { const r = $('#received'); r && r.focus(); } return; }
  if (e.key === 'Enter' && e.target.id === 'search') {
    e.preventDefault();
    const first = matches()[0];
    if (first) { addToCart(first.id, parseSearch(search).qty); search = ''; $('#search').value = ''; renderGrid(); }
  }
  if (e.key === 'Enter' && e.target.id === 'received') { e.preventDefault(); confirmSale(); }
});

/* ---------- início ---------- */
async function boot() {
  await loadSprite();
  let info;
  try { info = await api('GET', '/api/me'); }
  catch {
    $('#topbar').hidden = true;
    $('#view').className = '';
    $('#view').innerHTML = emptyState('Sem conexão com o servidor', 'Confira se o servidor está ligado e se este aparelho está na mesma rede.', '<button class="btn primary" onclick="location.reload()">Tentar de novo</button>');
    return;
  }
  brand = info.brand;
  document.title = brand.eventName || 'Caixa';
  if (info.needsSetup) return authScreen(true);
  if (!info.user) return authScreen(false);
  me = info.user;
  try { db = await api('GET', '/api/bootstrap'); } catch (e) { return authScreen(false, e.message); }
  view = 'caixa';
  go('caixa');
}
boot();
