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
    let configText = '';
    $('script').each((i, el) => {
      const text = $(el).html() || '';
      if (text.includes('__CONFIG__')) {
        configText = text;
      }
    });

    if (configText) {
      // Find all matches of hex strings or alphanumeric strings that look like API keys (usually 32 chars of letters/numbers)
      const matches = configText.match(/[a-zA-Z0-9]{32,40}/g) || [];
      console.log('Alphanumeric strings (32-40 chars):', [...new Set(matches)]);
    }
  } catch (err) {
    console.error(err.message);
  }
}
run();
