// Banco local (SQLite): usado quando não há MONGODB_URI. Serve para o notebook na rede do evento, sem internet.
const path = require('path');
const fs = require('fs');

module.exports = function createSqliteStore(dataDir) {
  const { DatabaseSync } = require('node:sqlite');
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, 'caixa.db'));

  const user = (r) => r && { id: r.id, username: r.username, name: r.name, role: r.role, salt: r.salt, hash: r.hash, active: !!r.active };
  const product = (p) => ({ id: p.id, name: p.name, price: p.price, color: p.color, active: !!p.active, photo: p.photo || '', stock: p.stock == null ? null : p.stock, sold: p.sold || 0 });
  const sale = (r) => r && { id: r.id, at: r.at, user_id: r.user_id, user_name: r.user_name, items: JSON.parse(r.items), total: r.total, method: r.method, received: r.received, change: r.change, printed: !!r.printed };

  return {
    kind: 'SQLite local',

    async init() {
      db.exec(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY, name TEXT NOT NULL, price INTEGER NOT NULL, color TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, photo TEXT NOT NULL DEFAULT '', stock INTEGER, sold INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS sales(id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, user_id INTEGER NOT NULL, user_name TEXT NOT NULL, items TEXT NOT NULL, total INTEGER NOT NULL, method TEXT NOT NULL, received INTEGER NOT NULL, change INTEGER NOT NULL, printed INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);
      try { db.exec("ALTER TABLE products ADD COLUMN photo TEXT NOT NULL DEFAULT ''"); } catch { /* coluna já existe */ }
      try { db.exec('ALTER TABLE products ADD COLUMN stock INTEGER'); } catch { /* coluna já existe */ }
      try { db.exec('ALTER TABLE products ADD COLUMN sold INTEGER NOT NULL DEFAULT 0'); } catch { /* coluna já existe */ }
    },

    /* usuários */
    async countUsers() { return db.prepare('SELECT COUNT(*) c FROM users').get().c; },
    async findUserByUsername(un) { return user(db.prepare('SELECT * FROM users WHERE username = ?').get(un)); },
    async findUserById(id) { return user(db.prepare('SELECT * FROM users WHERE id = ?').get(id)); },
    async insertUser(u) {
      return Number(db.prepare('INSERT INTO users(username, name, role, salt, hash) VALUES (?, ?, ?, ?, ?)').run(u.username, u.name, u.role, u.salt, u.hash).lastInsertRowid);
    },
    async updateUser(id, f) { db.prepare('UPDATE users SET name = ?, role = ?, active = ? WHERE id = ?').run(f.name, f.role, f.active ? 1 : 0, id); },
    async setUserPassword(id, salt, hash) { db.prepare('UPDATE users SET salt = ?, hash = ? WHERE id = ?').run(salt, hash, id); },
    async listUsers() { return db.prepare('SELECT * FROM users ORDER BY id').all().map((r) => ({ id: r.id, username: r.username, name: r.name, role: r.role, active: !!r.active })); },
    async countOtherActiveAdmins(id) { return db.prepare("SELECT COUNT(*) c FROM users WHERE role = 'admin' AND active = 1 AND id != ?").get(id).c; },

    /* sessões */
    async createSession(token, userId, expires) { db.prepare('INSERT INTO sessions(token, user_id, expires) VALUES (?, ?, ?)').run(token, userId, expires); },
    async userForSession(token, now) {
      return db.prepare('SELECT u.id, u.username, u.name, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires > ? AND u.active = 1').get(token, now) || null;
    },
    async deleteSession(token) { db.prepare('DELETE FROM sessions WHERE token = ?').run(token); },
    async deleteSessionsOfUser(userId, exceptToken) {
      if (exceptToken) db.prepare('DELETE FROM sessions WHERE user_id = ? AND token != ?').run(userId, exceptToken);
      else db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
    },
    async purgeSessions(now) { db.prepare('DELETE FROM sessions WHERE expires < ?').run(now); },

    /* produtos */
    async countProducts() { return db.prepare('SELECT COUNT(*) c FROM products').get().c; },
    async listProducts() { return db.prepare('SELECT id, name, price, color, active, photo, stock, sold FROM products ORDER BY id').all().map(product); },
    async findActiveProduct(id) { const p = db.prepare('SELECT id, name, price, color, active, photo, stock, sold FROM products WHERE id = ? AND active = 1').get(id); return p ? product(p) : null; },
    async insertProduct(p) {
      return Number(db.prepare('INSERT INTO products(name, price, color, active, photo, stock) VALUES (?, ?, ?, ?, ?, ?)').run(p.name, p.price, p.color, p.active ? 1 : 0, p.photo, p.stock == null ? null : p.stock).lastInsertRowid);
    },
    async updateProduct(id, p) { db.prepare('UPDATE products SET name = ?, price = ?, color = ?, active = ?, photo = ? WHERE id = ?').run(p.name, p.price, p.color, p.active ? 1 : 0, p.photo, id); },
    async deleteProduct(id) { db.prepare('DELETE FROM products WHERE id = ?').run(id); },

    /* estoque: tudo ou nada, para duas vendas ao mesmo tempo não passarem do limite */
    async reserveStock(lines) {
      db.exec('BEGIN IMMEDIATE');
      try {
        for (const l of lines) {
          const p = db.prepare('SELECT name, stock FROM products WHERE id = ?').get(l.id);
          if (!p) { db.exec('ROLLBACK'); return { ok: false, id: l.id, name: '', available: 0 }; }
          if (p.stock != null && p.stock < l.qty) { db.exec('ROLLBACK'); return { ok: false, id: l.id, name: p.name, available: p.stock }; }
          db.prepare('UPDATE products SET stock = CASE WHEN stock IS NULL THEN NULL ELSE stock - ? END, sold = sold + ? WHERE id = ?').run(l.qty, l.qty, l.id);
        }
        db.exec('COMMIT');
        return { ok: true };
      } catch (e) { try { db.exec('ROLLBACK'); } catch { /* já desfeito */ } throw e; }
    },
    async releaseStock(lines) {
      for (const l of lines) db.prepare('UPDATE products SET stock = CASE WHEN stock IS NULL THEN NULL ELSE stock + ? END, sold = MAX(0, sold - ?) WHERE id = ?').run(l.qty, l.qty, l.id);
    },
    async setStock(id, stock) { db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(stock == null ? null : stock, id); },
    async addStock(id, delta) { db.prepare('UPDATE products SET stock = MAX(0, COALESCE(stock, 0) + ?) WHERE id = ?').run(delta, id); },
    async resetSold() { db.prepare('UPDATE products SET sold = 0').run(); },

    /* ajustes */
    async getSettings() {
      const out = {};
      for (const r of db.prepare('SELECT key, value FROM settings').all()) out[r.key] = JSON.parse(r.value);
      return out;
    },
    async saveSettings(obj) {
      const up = db.prepare('INSERT INTO settings(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
      for (const [k, v] of Object.entries(obj)) up.run(k, JSON.stringify(v));
    },

    /* vendas */
    async insertSale(s) {
      const r = db.prepare('INSERT INTO sales(at, user_id, user_name, items, total, method, received, change, printed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(s.at, s.user_id, s.user_name, JSON.stringify(s.items), s.total, s.method, s.received, s.change, s.printed ? 1 : 0);
      return sale(db.prepare('SELECT * FROM sales WHERE id = ?').get(Number(r.lastInsertRowid)));
    },
    async listSales({ since, userId, limit }) {
      const where = []; const args = [];
      if (since) { where.push('at >= ?'); args.push(since); }
      if (userId != null) { where.push('user_id = ?'); args.push(userId); }
      const sql = `SELECT * FROM sales ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC LIMIT ${Math.max(1, Math.min(10000, limit | 0))}`;
      return db.prepare(sql).all(...args).map(sale);
    },
    async deleteSale(id) {
      const r = db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
      if (!r) return null;
      db.prepare('DELETE FROM sales WHERE id = ?').run(id);
      return sale(r);
    },
    // apaga todas as vendas, volta a numeração para 1 e devolve os vendidos ao estoque
    async resetSales() {
      db.exec('BEGIN IMMEDIATE');
      try {
        db.exec("DELETE FROM sales; DELETE FROM sqlite_sequence WHERE name = 'sales';");
        db.exec('UPDATE products SET stock = CASE WHEN stock IS NULL THEN NULL ELSE stock + sold END, sold = 0');
        db.exec('COMMIT');
      } catch (e) { try { db.exec('ROLLBACK'); } catch { /* já desfeito */ } throw e; }
    },
    // deixa o sistema como novo: sem produtos, estoque e vendas (os usuários ficam)
    async wipeData() {
      db.exec('BEGIN IMMEDIATE');
      try {
        db.exec("DELETE FROM sales; DELETE FROM products; DELETE FROM sqlite_sequence WHERE name IN ('sales', 'products'); DELETE FROM settings WHERE key = 'featuredProductId';");
        db.exec('COMMIT');
      } catch (e) { try { db.exec('ROLLBACK'); } catch { /* já desfeito */ } throw e; }
    },
    async findSale(id) { const r = db.prepare('SELECT id, user_id FROM sales WHERE id = ?').get(id); return r || null; },
    async markPrinted(id) { db.prepare('UPDATE sales SET printed = 1 WHERE id = ?').run(id); },
  };
};
