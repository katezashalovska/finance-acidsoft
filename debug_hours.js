const fetch = require('node-fetch');

async function debugHours() {
    const s = { name: 'Hours (March)', id: '1naDmgdozaXJbsqMHSkA-sDtfUaoUFUIARna4hoB7nKA', gid: '387891592' };
    const ratesSheet = { id: '1rVf7853cSxXa_DcErq062mSJzD0UlCITk4oFM0mQh-s', gid: '307856390' };
    
    try {
        // Fetch Rates
        const ratesResp = await fetch(`https://docs.google.com/spreadsheets/d/${ratesSheet.id}/gviz/tq?tqx=out:json&gid=${ratesSheet.gid}`);
        const ratesText = await ratesResp.text();
        const ratesJson = JSON.parse(ratesText.substring(ratesText.indexOf("(") + 1, ratesText.lastIndexOf(")")));
        const validProjects = ratesJson.table.rows.map(r => r.c[0] ? r.c[0].v : null).filter(Boolean);
        console.log('Valid Projects from Rates:', validProjects);

        // Fetch Hours
        const resp = await fetch(`https://docs.google.com/spreadsheets/d/${s.id}/gviz/tq?tqx=out:json&gid=${s.gid}`);
        const text = await resp.text();
        const json = JSON.parse(text.substring(text.indexOf("(") + 1, text.lastIndexOf(")")));
        
        json.table.rows.slice(90, 150).forEach((r, i) => {
            const cells = r.c.map(cell => cell ? cell.v : 'null');
            console.log(`${i+90}:`, JSON.stringify(cells));
        });
    } catch (e) {
        console.error(e);
    }
}

debugHours();
