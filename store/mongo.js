// Banco online (MongoDB Atlas): usado quando MONGODB_URI está definida. Os dados ficam permanentes.
const { MongoClient } = require('mongodb');

module.exports = function createMongoStore(uri, dbName) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  let db;
  const col = (n) => db.collection(n);

  const nextId = async (name) => {
    const r = await col('counters').findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' });
    return r.seq;
  };
  const user = (d) => d && { id: d._id, username: d.username, name: d.name, role: d.role, salt: d.salt, hash: d.hash, active: !!d.active };
  const product = (d) => ({ id: d._id, name: d.name, price: d.price, color: d.color, active: !!d.active, photo: d.photo || '', stock: d.stock == null ? null : d.stock, sold: d.sold || 0 });
  const sale = (d) => d && { id: d._id, at: d.at, user_id: d.user_id, user_name: d.user_name, items: d.items, total: d.total, method: d.method, received: d.received, change: d.change, printed: !!d.printed };

  return {
    kind: 'MongoDB Atlas',

    async init() {
      await client.connect();
      db = client.db(dbName || 'caixa');
      await col('users').createIndex({ username: 1 }, { unique: true });
      await col('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      await col('sales').createIndex({ at: -1 });
      await col('sales').createIndex({ user_id: 1, at: -1 });
    },

    /* usuários */
    async countUsers() { return col('users').countDocuments(); },
    async findUserByUsername(un) { return user(await col('users').findOne({ username: un })); },
    async findUserById(id) { return user(await col('users').findOne({ _id: id })); },
    async insertUser(u) {
      const id = await nextId('users');
      await col('users').insertOne({ _id: id, username: u.username, name: u.name, role: u.role, salt: u.salt, hash: u.hash, active: true });
      return id;
    },
    async updateUser(id, f) { await col('users').updateOne({ _id: id }, { $set: { name: f.name, role: f.role, active: !!f.active } }); },
    async setUserPassword(id, salt, hash) { await col('users').updateOne({ _id: id }, { $set: { salt, hash } }); },
    async listUsers() {
      const rows = await col('users').find({}).sort({ _id: 1 }).toArray();
      return rows.map((d) => ({ id: d._id, username: d.username, name: d.name, role: d.role, active: !!d.active }));
    },
    async countOtherActiveAdmins(id) { return col('users').countDocuments({ role: 'admin', active: true, _id: { $ne: id } }); },

    /* sessões */
    async createSession(token, userId, expires) { await col('sessions').insertOne({ _id: token, user_id: userId, expiresAt: new Date(expires) }); },
    async userForSession(token, now) {
      const s = await col('sessions').findOne({ _id: token, expiresAt: { $gt: new Date(now) } });
      if (!s) return null;
      const u = await col('users').findOne({ _id: s.user_id, active: true });
      return u ? { id: u._id, username: u.username, name: u.name, role: u.role } : null;
    },
    async deleteSession(token) { await col('sessions').deleteOne({ _id: token }); },
    async deleteSessionsOfUser(userId, exceptToken) { await col('sessions').deleteMany(exceptToken ? { user_id: userId, _id: { $ne: exceptToken } } : { user_id: userId }); },
    async purgeSessions() { /* o índice TTL do Mongo apaga sozinho */ },

    /* produtos */
    async countProducts() { return col('products').countDocuments(); },
    async listProducts() {
      const rows = await col('products').find({}).sort({ _id: 1 }).toArray();
      return rows.map(product);
    },
    async findActiveProduct(id) {
      const d = await col('products').findOne({ _id: id, active: true });
      return d ? product(d) : null;
    },
    async insertProduct(p) {
      const id = await nextId('products');
      await col('products').insertOne({ _id: id, name: p.name, price: p.price, color: p.color, active: !!p.active, photo: p.photo, stock: p.stock == null ? null : p.stock, sold: 0 });
      return id;
    },
    async updateProduct(id, p) { await col('products').updateOne({ _id: id }, { $set: { name: p.name, price: p.price, color: p.color, active: !!p.active, photo: p.photo } }); },
    async deleteProduct(id) { await col('products').deleteOne({ _id: id }); },

    /* estoque: cada baixa é uma operação única no banco, então vendas simultâneas não passam do limite */
    async reserveStock(lines) {
      const done = [];
      for (const l of lines) {
        const r = await col('products').updateOne(
          { _id: l.id, $or: [{ stock: null }, { stock: { $gte: l.qty } }] },
          [{ $set: {
            stock: { $cond: [{ $eq: [{ $ifNull: ['$stock', null] }, null] }, null, { $subtract: ['$stock', l.qty] }] },
            sold: { $add: [{ $ifNull: ['$sold', 0] }, l.qty] },
          } }],
        );
        if (r.matchedCount === 0) {
          await this.releaseStock(done);
          const p = await col('products').findOne({ _id: l.id });
          return { ok: false, id: l.id, name: p ? p.name : '', available: p && p.stock != null ? p.stock : 0 };
        }
        done.push(l);
      }
      return { ok: true };
    },
    async releaseStock(lines) {
      for (const l of lines) {
        await col('products').updateOne({ _id: l.id }, [{ $set: {
          stock: { $cond: [{ $eq: [{ $ifNull: ['$stock', null] }, null] }, null, { $add: ['$stock', l.qty] }] },
          sold: { $max: [0, { $subtract: [{ $ifNull: ['$sold', 0] }, l.qty] }] },
        } }]);
      }
    },
    async setStock(id, stock) { await col('products').updateOne({ _id: id }, { $set: { stock: stock == null ? null : stock } }); },
    async addStock(id, delta) { await col('products').updateOne({ _id: id }, [{ $set: { stock: { $max: [0, { $add: [{ $ifNull: ['$stock', 0] }, delta] }] } } }]); },
    async resetSold() { await col('products').updateMany({}, { $set: { sold: 0 } }); },

    /* ajustes */
    async getSettings() {
      const out = {};
      for (const d of await col('settings').find({}).toArray()) out[d._id] = d.value;
      return out;
    },
    async saveSettings(obj) {
      for (const [k, v] of Object.entries(obj)) await col('settings').updateOne({ _id: k }, { $set: { value: v } }, { upsert: true });
    },

    /* vendas */
    async insertSale(s) {
      const id = await nextId('sales');
      const doc = { _id: id, at: s.at, user_id: s.user_id, user_name: s.user_name, items: s.items, total: s.total, method: s.method, received: s.received, change: s.change, printed: !!s.printed };
      await col('sales').insertOne(doc);
      return sale(doc);
    },
    async listSales({ since, userId, limit }) {
      const q = {};
      if (since) q.at = { $gte: since };
      if (userId != null) q.user_id = userId;
      const rows = await col('sales').find(q).sort({ _id: -1 }).limit(Math.max(1, Math.min(10000, limit | 0))).toArray();
      return rows.map(sale);
    },
    async deleteSale(id) {
      const d = await col('sales').findOneAndDelete({ _id: id });
      return d ? sale(d) : null;
    },
    // apaga todas as vendas, volta a numeração para 1 e devolve os vendidos ao estoque
    async resetSales() {
      await col('sales').deleteMany({});
      await col('counters').updateOne({ _id: 'sales' }, { $set: { seq: 0 } }, { upsert: true });
      await col('products').updateMany({}, [{ $set: {
        stock: { $cond: [{ $eq: [{ $ifNull: ['$stock', null] }, null] }, null, { $add: ['$stock', { $ifNull: ['$sold', 0] }] }] },
        sold: 0,
      } }]);
    },
    // deixa o sistema como novo: sem produtos, estoque e vendas (os usuários ficam)
    async wipeData() {
      await col('sales').deleteMany({});
      await col('products').deleteMany({});
      await col('counters').deleteMany({ _id: { $in: ['sales', 'products'] } });
      await col('settings').deleteOne({ _id: 'featuredProductId' });
    },
    async findSale(id) { const d = await col('sales').findOne({ _id: id }, { projection: { user_id: 1 } }); return d ? { id: d._id, user_id: d.user_id } : null; },
    async markPrinted(id) { await col('sales').updateOne({ _id: id }, { $set: { printed: true } }); },
  };
};
