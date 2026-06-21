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
    let stateText = '';
    $('script').each((i, el) => {
      const text = $(el).html() || '';
      if (text.includes('__TGT_DATA__')) {
        stateText = text;
      }
    });

    if (stateText) {
      console.log('Found state text length:', stateText.length);
      // Let's find where __TGT_DATA__ is
      const idx = stateText.indexOf('__TGT_DATA__');
      console.log('__TGT_DATA__ index:', idx);
      // Usually, it's something like window.__TGT_DATA__ = JSON.parse("...") or window.__TGT_DATA__ = {...}
      // Let's print around the __TGT_DATA__ assignment
      console.log('Snippet around __TGT_DATA__:', stateText.slice(idx, idx + 1000));
    } else {
      console.log('No __TGT_DATA__ script found.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
