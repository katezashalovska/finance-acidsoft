const fetch = require('node-fetch');

async function test() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/1ZFhqkyGs0lF_991r_vO3Q08EHkZ-Au1h4gT_K3Gxlbk/gviz/tq?tqx=out:json&gid=957980656');
  const t = await res.text();
  const j = JSON.parse(t.substring(t.indexOf('(')+1, t.lastIndexOf(')')));
  
  const map = {};
  j.table.rows.forEach(r => {
    let title = r.c[0] ? r.c[0].v.trim() : null;
    if (title) {
       console.log(title, r.c[1] ? r.c[1].v : null);
    }
  });
}
test();
