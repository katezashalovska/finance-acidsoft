const fetch = require('node-fetch');

async function test() {
  const spreadsheetId = '1rVf7853cSxXa_DcErq062mSJzD0UlCITk4oFM0mQh-s';
  const res = await fetch('https://docs.google.com/spreadsheets/d/' + spreadsheetId + '/edit');
  const text = await res.text();
  
  // Find gids
  const tabs = ['Sales Model', 'LTV', 'Юніт економіка', 'Команда'];
  tabs.forEach(name => {
    const escaped = name.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&');
    const r = new RegExp('"(' + escaped + ')",(\\d{3,12})', 'g');
    const text2 = text.replace(/\\\\/g, '');
    const m = ('"' + name + '"').search(/./);
    // Try simpler approach
    const r2 = new RegExp(escaped + '.{0,200}', 'g');
    const matches = [...text.matchAll(new RegExp('"' + escaped + '"', 'g'))];
    console.log(name, 'occurrences count:', matches.length);
  });
  
  // Just print all GID matches
  const gidMatches = [...text.matchAll(/"(\d{6,12})"/g)];
  const uniqueGids = [...new Set(gidMatches.map(m => m[1]))];
  console.log('All GIDs from text:', uniqueGids.slice(0, 30));
}
test();
