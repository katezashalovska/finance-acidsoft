const fetch = require('node-fetch');

async function debugPlanner() {
    const s = { name: 'Hours (March)', id: '1naDmgdozaXJbsqMHSkA-sDtfUaoUFUIARna4hoB7nKA', gid: '387891592' };
    
    try {
        const resp = await fetch(`https://docs.google.com/spreadsheets/d/${s.id}/gviz/tq?tqx=out:json&gid=${s.gid}`);
        const text = await resp.text();
        const json = JSON.parse(text.substring(text.indexOf("(") + 1, text.lastIndexOf(")")));
        
        let inPlanner = false;
        json.table.rows.forEach((r, i) => {
            const cells = r.c.map(cell => cell ? cell.v : 'null');
            const colA = String(cells[0] || '').toLowerCase();
            
            if (colA.includes('planner')) {
                inPlanner = true;
                console.log(`\nFound Planner at row ${i}:`, JSON.stringify(cells));
            } else if (inPlanner && colA === "total hours") {
                console.log(`Row ${i} (Total):`, JSON.stringify(cells));
                inPlanner = false;
            } else if (inPlanner) {
                console.log(`Row ${i}:`, JSON.stringify(cells));
            }
        });
    } catch (e) {
        console.error(e);
    }
}

debugPlanner();
