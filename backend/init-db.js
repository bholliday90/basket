const { query } = require('./db');

async function initDb() {
  try {
    console.log('Creating tables...');
    
    query(`CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      url TEXT,
      active INTEGER DEFAULT 1
    )`);

    query(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      unit TEXT,
      image_url TEXT
    )`);

    query(`CREATE TABLE IF NOT EXISTS prices (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      store_id TEXT NOT NULL,
      price REAL NOT NULL,
      unit_price REAL,
      fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id),
      FOREIGN KEY (store_id) REFERENCES stores (id)
    )`);

    console.log('Seeding stores...');
    const stores = [
      ['target-id', 'Target', 'target', 'https://www.target.com', 1],
      ['walmart-id', 'Walmart', 'walmart', 'https://www.walmart.com', 1],
      ['kroger-id', 'Kroger', 'kroger', 'https://www.kroger.com', 1],
      ['aldi-id', 'Aldi', 'aldi', 'https://www.aldi.us', 1],
      ['costco-id', 'Costco', 'costco', 'https://www.costco.com', 1],
      ['sams-club-id', 'Sam\'\'s Club', 'sams-club', 'https://www.samsclub.com', 1],
    ];

    for (const [id, name, slug, url, active] of stores) {
      query(`INSERT OR REPLACE INTO stores (id, name, slug, url, active) VALUES ('${id}', '${name}', '${slug}', '${url}', ${active})`);
    }

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

initDb();
