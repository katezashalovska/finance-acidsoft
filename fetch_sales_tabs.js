const fetch = require('node-fetch');

async function test() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/1ZFhqkyGs0lF_991r_vO3Q08EHkZ-Au1h4gT_K3Gxlbk/edit');
  const text = await res.text();
  
  // Searching for any JSON arrays that look like sheet definitions
  // Typically: ["Sheet1",1809725206] or something similar
  const matches = [...text.matchAll(/"([^"]+)",(\d{6,12})/g)];
  if(matches) {
    const sheets = matches.filter(m => {
       const digits = m[2];
       // Common sheet GIDs are > 0, sometimes 0, let's filter those that are very likely sheet IDs
       return digits.length > 5;
    });
    console.log("Possible sheets:", sheets.map(m => m[1] + " -> " + m[2]));
  }
}
test();
