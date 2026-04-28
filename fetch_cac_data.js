const fetch = require('node-fetch');

async function getSheetData(spreadsheetId, gid) {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
  const res = await fetch(url);
  const t = await res.text();
  const j = JSON.parse(t.substring(t.indexOf('(')+1, t.lastIndexOf(')')));
  return j.table;
}

async function main() {
  const FINANCE_ID = '1rVf7853cSxXa_DcErq062mSJzD0UlCITk4oFM0mQh-s';
  const SALES_ID = '1ZFhqkyGs0lF_991r_vO3Q08EHkZ-Au1h4gT_K3Gxlbk';
  
  // Main financial model (first sheet)
  const financeTable = await getSheetData(FINANCE_ID, '0');
  console.log('=== Фінансова модель (gid=0) ===');
  financeTable.rows.forEach(r => {
    const v = r.c.map(c => c ? c.v : null);
    if (v[0]) console.log(v[0], ':', v.slice(1, 6));
  });

  // Sales model from FINANCE spreadsheet
  console.log('\n=== Шукаємо Sales Model gid в основній таблиці ===');
  // The sales model tab name is in the financial sheet
  // Try common GIDs
  for (const gid of ['1', '2', '3', '4', '5', '100', '200', '300']) {
    try {
      const t = await getSheetData(FINANCE_ID, gid);
      if (t.rows.length > 0) {
        const title = t.rows[0].c.map(c => c ? c.v : null).filter(Boolean);
        console.log('GID', gid, ':', title.slice(0, 3));
      }
    } catch(e) {}
  }

}

main();
