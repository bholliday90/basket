const axios = require('axios');
const cheerio = require('cheerio');

async function run() {
  try {
    console.log('Sending request...');
    const res = await axios.get('https://www.target.com/s?searchTerm=milk', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      },
      timeout: 5000
    });
    console.log('Response status:', res.status);
    const $ = cheerio.load(res.data);
    let configText = '';
    $('script').each((i, el) => {
      const text = $(el).html() || '';
      if (text.includes('__CONFIG__')) {
        configText = text;
      }
    });

    console.log('Found configText length:', configText.length);
    if (configText) {
      // Find JSON.parse(...)
      const startIdx = configText.indexOf('JSON.parse("');
      console.log('JSON.parse(" index:', startIdx);
      if (startIdx !== -1) {
        const afterParse = configText.slice(startIdx + 12);
        const endIdx = afterParse.lastIndexOf('")');
        const escapedJson = afterParse.slice(0, endIdx);
        console.log('Escaped JSON length:', escapedJson.length);
        // Unescape the string
        const rawJson = escapedJson.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        try {
          const config = JSON.parse(rawJson);
          console.log('Config parsed successfully!');
          function searchObj(obj, path = '') {
            if (!obj || typeof obj !== 'object') return;
            for (const key of Object.keys(obj)) {
              const currentPath = path ? `${path}.${key}` : key;
              if (key.toLowerCase().includes('key') || key.toLowerCase().includes('clientid') || key.toLowerCase().includes('token')) {
                console.log(`${currentPath}:`, obj[key]);
              }
              if (typeof obj[key] === 'object') {
                searchObj(obj[key], currentPath);
              }
            }
          }
          searchObj(config);
        } catch (err) {
          console.log('Error parsing parsed unescaped JSON:', err.message);
          // Let's print out parts that look like keys
          const matches = escapedJson.match(/[a-zA-Z0-9_-]{20,50}/g) || [];
          console.log('Potential key tokens:', [...new Set(matches)].slice(0, 30));
        }
      }
    }
  } catch (err) {
    console.error('Outer error:', err.message);
  }
}
run();
