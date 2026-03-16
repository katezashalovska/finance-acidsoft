const fetch = require('node-fetch');

async function debugTransform() {
    const gid = '387891592'; // March
    const url = `https://docs.google.com/spreadsheets/d/1naDmgdozaXJbsqMHSkA-sDtfUaoUFUIARna4hoB7nKA/gviz/tq?tqx=out:json&gid=${gid}`;
    
    try {
        const response = await fetch(url);
        const text = await response.text();
        const jsonData = JSON.parse(text.substring(text.indexOf("(") + 1, text.lastIndexOf(")")));
        const table = jsonData.table;
        const rows = table.rows.map((row) => {
            const rowData = {};
            row.c.forEach((cell, index) => {
                const colLabel = table.cols[index].label || `col_${index}`;
                rowData[colLabel] = cell ? cell.v : null;
                rowData[`col_${index}`] = cell ? cell.v : null;
            });
            return rowData;
        });

        const skipHeaders = [
            "Name", "Billability %", "Plan per team (h)", "Actual team (h)", 
            "Overtime/Shortage (h)", "Total hours", "DATA FROM CLIENT",
            "Billability Kitsune (Kate)", "Billability Akatsuki (Oleksandr)",
            "Kitsune (Kate)", "Other activity", "Akatsuki (Oleksandr)"
        ];

        const projects = [];
        let currentProject = null;
        let lastPersonName = "";

        rows.forEach(r => {
            const colA = (r["col_0"] === null || r["col_0"] === undefined || r["col_0"] === "null") ? "" : r["col_0"].toString().trim();
            const colB = (r["col_1"] === null || r["col_1"] === undefined || r["col_1"] === "null") ? "" : r["col_1"].toString().trim();

            if (colA && !colB && !skipHeaders.some(h => colA.includes(h))) {
                currentProject = {
                    name: colA,
                    members: []
                };
                projects.push(currentProject);
            } 
            
            if (colA && colB && colB.includes("(h)")) {
                lastPersonName = colA;
            }

            if (currentProject && colB === "Actual (h)") {
                const weeklyHours = [
                    parseFloat(r["col_2"]) || 0,
                    parseFloat(r["col_3"]) || 0,
                    parseFloat(r["col_4"]) || 0,
                    parseFloat(r["col_5"]) || 0
                ];
                const total = parseFloat(r["col_6"]) || 0;

                if (total > 0) {
                    currentProject.members.push({
                        name: lastPersonName || "Unknown",
                        weeklyHours,
                        total
                    });
                }
            }
        });

        const result = projects.map(p => {
            const totalHours = p.members.reduce((sum, m) => sum + m.total, 0);
            return {
                projectName: p.name,
                totalHours,
                members: p.members
            };
        }).filter(p => p.totalHours > 0);

        console.log(JSON.stringify(result, null, 2));

    } catch (e) {
        console.error(e);
    }
}

debugTransform();
