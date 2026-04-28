const fetch = require('node-fetch');

async function getSheet(spreadsheetId, gid) {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
  const res = await fetch(url);
  const t = await res.text();
  const j = JSON.parse(t.substring(t.indexOf('(')+1, t.lastIndexOf(')')));
  return j.table;
}

async function main() {
  const FINANCE_ID = '1rVf7853cSxXa_DcErq062mSJzD0UlCITk4oFM0mQh-s';
  const SALES_ID = '1ZFhqkyGs0lF_991r_vO3Q08EHkZ-Au1h4gT_K3Gxlbk';

  // Try to find the AcidSoft financial model sheet (different from gid=0 which looks like generic model)
  // gid=0 had: P&L, Cashflow, etc. rows (very generic)
  // Let's try other tabs by searching for known row names from AcidSoft model
  
  // Let's get the main Finance Model
  console.log('=== Пробуємо Upwork Statistics + Sales Model tabs ===');
  
  // From previous work: main finance = "Фінансова модель" which is the main sheet
  // Let's look at what the Upwork Statistics tab in the FINANCE sheet contains
  const res2 = await fetch('https://docs.google.com/spreadsheets/d/' + FINANCE_ID + '/edit');
  const text = await res2.text();
  
  // Find GID by looking for snippet near tab names
  const tabsToFind = ['AcidSoft', 'Sales Model', 'LTV', 'Upwork'];
  tabsToFind.forEach(name => {
    const idx = text.indexOf(name);
    if (idx > 0) {
      const snippet = text.substring(idx - 100, idx + 100);
      const m = snippet.match(/(\d{7,12})/g);
      console.log(name, '- nearby numbers:', m ? m.slice(0, 3) : 'none');
    }
  });
}

main();
