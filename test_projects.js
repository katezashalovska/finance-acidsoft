const fetch = require('node-fetch');

function transformTimeTrackingData(rows) {
  const projects = [];
  let currentProject = null;
  let lastPersonName = "";

  const skipHeaders = [
    "Name", "Billability %", "Plan per team (h)", "Actual team (h)", 
    "Overtime/Shortage (h)", "Total hours", "DATA FROM CLIENT",
    "Billability Kitsune (Kate)", "Billability Akatsuki (Oleksandr)"
  ];

  rows.forEach((r, idx) => {
    const colA = (r["col_0"] === null || r["col_0"] === undefined || r["col_0"] === "null") ? "" : r["col_0"].toString().trim();
    const colB = (r["col_1"] === null || r["col_1"] === undefined || r["col_1"] === "null") ? "" : r["col_1"].toString().trim();

    if (colA && !colB && !skipHeaders.some(h => colA.includes(h))) {
      console.log(`Row ${idx}: New Project Found -> ${colA}`);
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
      const total = parseFloat(r["col_6"]) || 0;
      if (total > 0) {
        console.log(`Row ${idx}: Found Hours for ${currentProject.name} -> ${total} (Person: ${lastPersonName})`);
        currentProject.members.push({
          name: lastPersonName || "Unknown",
          total: total,
          weeklyHours: [parseFloat(r["col_2"])||0, parseFloat(r["col_3"])||0, parseFloat(r["col_4"])||0, parseFloat(r["col_5"])||0]
        });
      }
    }
  });

  return projects.map(p => {
    const totalHours = p.members.reduce((sum, m) => sum + m.total, 0);
    return { projectName: p.name, totalHours };
  }).filter(p => p.totalHours > 0);
}

async function testTransformation() {
    const hoursGid = "387891592"; // March
    const hoursSheetId = "1naDmgdozaXJbsqMHSkA-sDtfUaoUFUIARna4hoB7nKA";

    async function fetchData(id, gid) {
        const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&gid=${gid}&t=${Date.now()}`;
        const resp = await fetch(url);
        const text = await resp.text();
        const json = JSON.parse(text.substring(text.indexOf("(") + 1, text.lastIndexOf(")")));
        const table = json.table;
        return table.rows.map((row) => {
            const rowData = {};
            row.c.forEach((cell, index) => {
                const colLabel = table.cols[index].label || `col_${index}`;
                rowData[colLabel] = cell ? cell.v : null;
            });
            return rowData;
        });
    }

    const hourRows = await fetchData(hoursSheetId, hoursGid);
    console.log('Total hour rows fetched:', hourRows.length);
    const projectHours = transformTimeTrackingData(hourRows);
    console.log('Final Transformation Result:', projectHours);
}

testTransformation();
