const axios = require('axios');
const cheerio = require('cheerio');

async function run() {
  try {
    console.log('Fetching Target search...');
    const res = await axios.get('https://www.target.com/s?searchTerm=milk', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      },
      timeout: 5000
    });
    const $ = cheerio.load(res.data);
    console.log('Script tags count:', $('script').length);
    $('script').each((i, el) => {
      const text = $(el).html() || '';
      if (text.includes('__TGT_DATA__') || text.includes('initialState') || text.includes('__preloadedData') || text.includes('__CONFIG__')) {
        console.log(`Script ${i}: Length ${text.length}`);
        if (text.includes('__TGT_DATA__')) {
          console.log('Found __TGT_DATA__ in script', i);
        }
        if (text.includes('preloadedDetails') || text.includes('search_response')) {
          console.log('Found preloadedDetails or search_response in script', i);
        }
        // Let's search for where the products are
        const keywords = ['"products"', '"items"', '"price"', '"milk"'];
        keywords.forEach(kw => {
          if (text.includes(kw)) {
            console.log(`Script ${i} contains keyword: ${kw}`);
          }
        });
      }
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
