const fetch = require('node-fetch');

async function getSheet(spreadsheetId, gid) {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
  const res = await fetch(url);
  const t = await res.text();
  const j = JSON.parse(t.substring(t.indexOf('(')+1, t.lastIndexOf(')')));
  return j.table;
}

async function main() {
  const SALES_ID = '1ZFhqkyGs0lF_991r_vO3Q08EHkZ-Au1h4gT_K3Gxlbk';
  const FINANCE_ID = '1rVf7853cSxXa_DcErq062mSJzD0UlCITk4oFM0mQh-s';

  console.log('=== Sales Model (gid=0 from Sales spreadsheet) ===');
  const salesModel = await getSheet(SALES_ID, '0');
  salesModel.rows.forEach(r => {
    const v = r.c.map(c => c ? c.v : null);
    if (v[0]) console.log(v[0], ':', v.slice(1, 8));
  });

  console.log('\n=== Upwork Statistics (from Sales spreadsheet gid=779756756) ===');
  const upworkStats = await getSheet(SALES_ID, '779756756');
  upworkStats.rows.slice(0, 15).forEach(r => {
    const v = r.c.map(c => c ? c.v : null);
    if (v[0]) console.log(v[0], ':', v.slice(1, 8));
  });
}

main();
