const fetch = require('node-fetch');

async function debugRows() {
    const gid = "387891592"; // March
    const id = "1naDmgdozaXJbsqMHSkA-sDtfUaoUFUIARna4hoB7nKA";
    const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&gid=${gid}&t=${Date.now()}`;
    const resp = await fetch(url);
    const text = await resp.text();
    const json = JSON.parse(text.substring(text.indexOf("(") + 1, text.lastIndexOf(")")));
    const table = json.table;
    const rows = table.rows.map((row) => {
        const rowData = {};
        row.c.forEach((cell, index) => {
            const colLabel = table.cols[index].label || `col_${index}`;
            rowData[colLabel] = cell ? cell.v : null;
        });
        return rowData;
    });

    const skipHeaders = [
        "Name", "Billability %", "Plan per team (h)", "Actual team (h)", 
        "Overtime/Shortage (h)", "Total hours", "DATA FROM CLIENT",
        "Billability Kitsune (Kate)", "Billability Akatsuki (Oleksandr)"
    ];

    rows.forEach((r, idx) => {
        const colA_raw = r["col_0"];
        const colB_raw = r["col_1"];
        
        const colA = (colA_raw === null || colA_raw === undefined || colA_raw === "null") ? "" : colA_raw.toString().trim();
        const colB = (colB_raw === null || colB_raw === undefined || colB_raw === "null") ? "" : colB_raw.toString().trim();

        if (idx > 120 && idx < 130) {
            console.log(`Row ${idx}: colA_raw=[${colA_raw}] colB_raw=[${colB_raw}] -> colA=[${colA}] colB=[${colB}]`);
            console.log(`Result: colA && !colB = ${colA && !colB}`);
        }
    });
}

debugRows();
