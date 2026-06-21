const { execSync } = require('child_process');

/**
 * Executes a SQL query using the team-db CLI with built-in retries for locking errors.
 * @param {string} sql - The SQL statement to execute.
 * @param {number} retries - Number of retries remaining.
 * @param {number} delay - Base delay for retry backoff in ms.
 * @returns {Array|Object} - The parsed JSON result from team-db.
 */
function query(sql, retries = 5, delay = 500) {
  try {
    const output = execSync(`team-db "${sql.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
    return JSON.parse(output);
  } catch (error) {
    const errorMsg = error.message || '';
    const isLockError = errorMsg.includes('Locking error') || errorMsg.includes('locked by another process') || errorMsg.includes('sync engine operation failed');
    
    if (isLockError && retries > 0) {
      const backoff = delay + Math.random() * 500;
      console.warn(`[db.js] Database locked or sync failed. Retrying in ${backoff.toFixed(0)}ms... (${retries} retries left). Query: "${sql.slice(0, 60)}..."`);
      execSync(`node -e "setTimeout(() => {}, ${backoff})"`); // simple block delay
      return query(sql, retries - 1, delay * 1.5);
    }
    
    console.error('Database query error:', error.message);
    throw error;
  }
}

module.exports = { query };
