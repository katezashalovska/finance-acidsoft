const fetch = require('node-fetch');

async function test() {
  const response = await fetch('https://docs.google.com/spreadsheets/d/1naDmgdozaXJbsqMHSkA-sDtfUaoUFUIARna4hoB7nKA/gviz/tq?tqx=out:json&gid=716654456');
  const text = await response.text();
  const jsonData = JSON.parse(text.substring(text.indexOf('(') + 1, text.lastIndexOf(')')));
  const rows = jsonData.table.rows.map(row => {
    const r = {};
    row.c.forEach((c, i) => {
      r['col_'+i] = c ? c.v : null;
    });
    return r;
  });

  console.log("Headers for first 10 columns:", jsonData.table.cols.map(c => c.label));
  console.dir(rows.slice(0, 5));
}
test();
