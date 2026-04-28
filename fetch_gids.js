const fetch = require('node-fetch');

async function test() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/1ZFhqkyGs0lF_991r_vO3Q08EHkZ-Au1h4gT_K3Gxlbk/edit');
  const text = await res.text();
  const matches = [...text.matchAll(/"name":"(.*?)".*?"sheetId":(\d+)/g)];
  if(matches.length > 0) {
    console.log('Sheets found:');
    matches.forEach(m => console.log(m[1] + ': ' + m[2]));
  } else {
    console.log('No matches. Text length:', text.length);
  }
}
test();
