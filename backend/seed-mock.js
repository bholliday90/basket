const { query } = require('./db');

async function seedData() {
  try {
    console.log('Seeding products...');
    const products = [
      ['p1', 'Whole Milk, 1 Gal', 'Dairy', '1 Gal', 'https://example.com/milk.jpg'],
      ['p2', 'Large Eggs, 12ct', 'Dairy', '12 ct', 'https://example.com/eggs.jpg'],
      ['p3', 'White Bread', 'Bakery', '20 oz', 'https://example.com/bread.jpg'],
      ['p4', 'Bananas', 'Produce', '1 lb', 'https://example.com/bananas.jpg'],
    ];

    for (const [id, name, category, unit, image_url] of products) {
      query(`INSERT OR REPLACE INTO products (id, name, category, unit, image_url) VALUES ('${id}', '${name}', '${category}', '${unit}', '${image_url}')`);
    }

    console.log('Seeding prices...');
    const prices = [
      ['pr1', 'p1', 'target-id', 3.69, 3.69],
      ['pr2', 'p1', 'walmart-id', 3.48, 3.48],
      ['pr3', 'p1', 'kroger-id', 3.89, 3.89],
      ['pr4', 'p2', 'target-id', 2.49, 0.21],
      ['pr5', 'p2', 'walmart-id', 2.18, 0.18],
      ['pr6', 'p3', 'aldi-id', 1.29, 0.06],
      ['pr7', 'p4', 'target-id', 0.59, 0.59],
      ['pr8', 'p4', 'walmart-id', 0.58, 0.58],
    ];

    for (const [id, product_id, store_id, price, unit_price] of prices) {
      query(`INSERT OR REPLACE INTO prices (id, product_id, store_id, price, unit_price) VALUES ('${id}', '${product_id}', '${store_id}', ${price}, ${unit_price})`);
    }

    console.log('Mock data seeded successfully.');
  } catch (error) {
    console.error('Failed to seed data:', error);
  }
}

seedData();
