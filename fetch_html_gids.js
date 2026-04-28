const fetch = require('node-fetch');

async function test() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/1ZFhqkyGs0lF_991r_vO3Q08EHkZ-Au1h4gT_K3Gxlbk/edit');
  const text = await res.text();
  console.log("Looking for sheet ids in HTML...");
  
  // Try to find the bootstrap data where sheets are defined
  const regex = /\["([^"]+)",(\d{6,12})\]/g;
  const matches = [...text.matchAll(regex)];

  // We can also just search for gid=
  const gidRegex = /gid=(\d+)/g;
  const gidMatches = [...text.matchAll(gidRegex)];
  const uniqueGids = [...new Set(gidMatches.map(m => m[1]))];
  
  console.log("Unique GIDs found in text:", uniqueGids);

  // Let's also just extract text windows:
  const snippets = text.match(/.{0,20}1809725206.{0,20}/g);
  if (snippets) {
     console.log("Snippets around main gid:", snippets);
  }
}
test();
