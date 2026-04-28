const fetch = require('node-fetch');

async function test() {
  const spreadsheetId = '1ZFhqkyGs0lF_991r_vO3Q08EHkZ-Au1h4gT_K3Gxlbk';
  const gid = '1809725206';
  const response = await fetch(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${gid}`);
  if(!response.ok) return;
  const text = await response.text();
  const jsonData = JSON.parse(text.substring(text.indexOf('(') + 1, text.lastIndexOf(')')));
  const rows = jsonData.table.rows.map(row => {
    const r = {};
    row.c.forEach((c, i) => {
      r[`col_${i}`] = c ? c.v : null;
    });
    return r;
  });

  console.dir(rows.map(r => r.col_0).filter(Boolean), { depth: null });
}
test();
