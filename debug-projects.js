const https = require('https');

function fetchSheet(gid) {
  const spreadsheetId = "1rVf7853cSxXa_DcErq062mSJzD0UlCITk4oFM0mQh-s";
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
    const data = await fetchSheet("204297728");
    console.log("Revenue per Project Sheet Rows:");
    data.table.rows.forEach((r, i) => {
      console.log(`Row ${i}:`, r.c.map(cell => cell ? cell.v : 'null').join(' | '));
    });
  } catch (e) {
    console.error(e);
  }
}

debug();
