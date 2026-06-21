const axios = require('axios');
const cheerio = require('cheerio');

async function run() {
  try {
    const res = await axios.get('https://www.target.com/s?searchTerm=milk', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      },
      timeout: 5000
    });
    const $ = cheerio.load(res.data);
    
    // Search for any element containing price (e.g. $ followed by digits)
    console.log('Searching for price texts...');
    const bodyText = $('body').text();
    const pricesFound = bodyText.match(/\$\d+\.\d{2}/g);
    console.log('Prices found in body text:', pricesFound ? pricesFound.slice(0, 20) : 'None');

    // Search for product cards / links / headings
    console.log('\nSearching for links/text with milk:');
    const milkElements = [];
    $('*').each((i, el) => {
      const text = $(el).text().trim();
      if (text.toLowerCase() === 'milk' || (text.toLowerCase().includes('milk') && text.length < 50)) {
        if (!milkElements.includes(text)) {
          milkElements.push(text);
        }
      }
    });
    console.log('Unique "milk" text occurrences:', milkElements.slice(0, 30));

  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
