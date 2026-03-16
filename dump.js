const fetch = require('node-fetch');

async function dumpSheet() {
    const gid = '387891592'; 
    const url = `https://docs.google.com/spreadsheets/d/1naDmgdozaXJbsqMHSkA-sDtfUaoUFUIARna4hoB7nKA/gviz/tq?tqx=out:json&gid=${gid}`;
    
    try {
        const response = await fetch(url);
        const text = await response.text();
        const jsonData = JSON.parse(text.substring(text.indexOf("(") + 1, text.lastIndexOf(")")));
        const table = jsonData.table;
        
        jsonData.table.rows.forEach((r, i) => {
            const cells = r.c.map(cell => cell ? cell.v : 'null');
            if(i > 270 && i < 330) {
               console.log(`${i}:`, JSON.stringify(cells));
            }
        });
    } catch (e) {
        console.error(e);
    }
}
dumpSheet();
