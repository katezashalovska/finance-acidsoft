const fetch = require('node-fetch');

async function explorePayments() {
    const s = { name: 'Revenue per project', id: '1rVf7853cSxXa_DcErq062mSJzD0UlCITk4oFM0mQh-s', gid: '204297728' };
    const url = `https://docs.google.com/spreadsheets/d/${s.id}/gviz/tq?tqx=out:json&gid=${s.gid}`;
    
    try {
        const resp = await fetch(url);
        const text = await resp.text();
        const json = JSON.parse(text.substring(text.indexOf("(") + 1, text.lastIndexOf(")")));
        
        console.log('Cols:', json.table.cols.map((c, i) => `${i}: [${c.label || 'no-label'}]`));
        console.log('Sample Rows:');
        json.table.rows.slice(0, 10).forEach((r, i) => {
            const cells = r.c.map(cell => cell ? cell.v : 'null');
            console.log(`${i}:`, JSON.stringify(cells));
        });
    } catch (e) {
        console.error(e);
    }
}

explorePayments();
