const fetch = require('node-fetch');

async function main() {
  const FINANCE_ID = '1rVf7853cSxXa_DcErq062mSJzD0UlCITk4oFM0mQh-s';
  const res = await fetch('https://docs.google.com/spreadsheets/d/' + FINANCE_ID + '/edit');
  const text = await res.text();
  
  const tabs = ['Sales Model', 'LTV', 'Unit'];
  tabs.forEach(name => {
    const matches = [...text.matchAll(new RegExp(name + '.{0,100}', 'g'))];
    if (matches.length > 0) {
      console.log(name + ':', matches[0][0]);
    }
  });
  
  // Use the xlsx already downloaded from sales sheet
  // XLS already extracted - let's just look at finance sheet directly
  // Let's just look at rows of main finance sheet (gid=0) which had CAC already
  const gid0 = await fetch(`https://docs.google.com/spreadsheets/d/${FINANCE_ID}/gviz/tq?tqx=out:json&gid=0`);
  const t0 = await gid0.text();
  const j0 = JSON.parse(t0.substring(t0.indexOf('(') + 1, t0.lastIndexOf(')')));
  
  console.log('\n=== FINANCE SHEET (gid=0): All rows ===');
  j0.table.rows.forEach(r => {
    const v = r.c.map(c => c ? c.v : null);
    if (v[0]) console.log(v[0], '->', v.slice(1, 6));
  });
}

main();
