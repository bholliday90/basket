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
      console.log('Found __CONFIG__ script length:', configText.length);
      // Let's parse out the JSON string inside JSON.parse("...")
      const match = configText.match(/JSON\.parse\("([^"]+)"\)/) || configText.match(/JSON\.parse\('([^']+)'\)/);
      if (match) {
        const rawJson = match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        try {
          const config = JSON.parse(rawJson);
          console.log('Config parsed successfully!');
          // Print some keys of config
          console.log('Top level keys:', Object.keys(config));
          if (config.services) {
            console.log('Services keys:', Object.keys(config.services));
            // Let's print out if there's any key or apiKey inside services
            console.log('Full services config:', JSON.stringify(config.services, null, 2).slice(0, 1000));
          }
        } catch (e) {
          console.log('JSON parse failed:', e.message);
          console.log('First 500 chars of raw matched JSON:', rawJson.slice(0, 500));
        }
      } else {
        // Try regex match on JSON.parse
        console.log('Failed to match JSON.parse with regex. Printing snippet around window.__CONFIG__:');
        const idx = configText.indexOf('__CONFIG__');
        console.log(configText.slice(idx, idx + 1000));
      }
    } else {
      console.log('No __CONFIG__ script found.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
