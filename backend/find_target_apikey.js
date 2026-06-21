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
    const html = res.data;
    
    // Target API key usually matches patterns like key=... or api_key or similar
    // Or starts with a hex string of length 32 or 40.
    // Let's search the HTML for any apiKey patterns
    const apiKeys = [];
    const regexes = [
      /\"apiKey\"\s*:\s*\"([^\"]+)\"/g,
      /\"key\"\s*:\s*\"([^\"]+)\"/g,
      /apiKey=([a-zA-Z0-9_-]+)/g,
      /\"client_id\"\s*:\s*\"([^\"]+)\"/g
    ];

    for (const regex of regexes) {
      let match;
      while ((match = regex.exec(html)) !== null) {
        apiKeys.push({ regex: regex.toString(), val: match[1] });
      }
    }

    console.log('Found potential keys:', apiKeys);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
