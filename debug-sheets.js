const https = require('https');

function fetchSheet(gid) {
  const spreadsheetId = "1naDmgdozaXJbsqMHSkA-sDtfUaoUFUIARna4hoB7nKA"; 
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${gid}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data.substring(data.indexOf("(") + 1, data.lastIndexOf(")")));
          resolve(jsonData);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function debug() {
  try {
    const data = await fetchSheet("387891592");
    data.table.rows.forEach((r, i) => {
      const content = r.c.map(cell => cell ? cell.v : 'null').join(' | ');
      if (content.toLowerCase().includes("solo")) {
          console.log(`Row ${i}:`, content);
      }
    });
  } catch (e) {
    console.error(e);
  }
}

debug();
