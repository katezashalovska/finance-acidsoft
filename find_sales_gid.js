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

  console.log('=== Sales Model tab (GID from the workbook.xml - sheetId=1, might be gid=0 or something) ===');

  // In Google Sheets gviz, the gid is the sheet's gid, not its sheetId from xlsx
  // The xlsx file had sheetId but not gid. The only gids we know are from earlier:
  // - Upwork January-March: 1809725206
  // - Upwork April: 957980656
  // - Linkedin April: 532983770
  
  // Let's try to find gid of Sales Model tab in sales spreadsheet
  // Testing a few gids to find the Sales Model
  const candidates = [0, 1, 2, 3, 100, 200, 300];
  for (const gid of candidates) {
    try {
      const table = await getSheet(SALES_ID, gid.toString());
      const firstRows = table.rows.slice(0, 3).map(r => r.c.map(c => c ? c.v : null).filter(Boolean));
      console.log(`GID ${gid}:`, firstRows.slice(0, 2));
    } catch(e) {
      console.log(`GID ${gid}: error - `, e.message);
    }
  }
}

main();
