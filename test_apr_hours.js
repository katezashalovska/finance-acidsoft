const fetch = require('node-fetch');

async function test() {
  const response = await fetch('https://docs.google.com/spreadsheets/d/1naDmgdozaXJbsqMHSkA-sDtfUaoUFUIARna4hoB7nKA/gviz/tq?tqx=out:json&gid=716654456');
  const text = await response.text();
  const jsonData = JSON.parse(text.substring(text.indexOf('(') + 1, text.lastIndexOf(')')));
  const rows = jsonData.table.rows.map(row => {
    const r = {};
    row.c.forEach((c, i) => {
      const colLabel = jsonData.table.cols[i].label || `col_${i}`;
      r[colLabel] = c ? c.v : null;
      r['col_'+i] = c ? c.v : null;
    });
    return r;
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

    if (colA && !colB) {
      if (skipHeaders.some(h => colA.includes(h))) {
        currentProject = null;
      } else {
        currentProject = { name: colA, members: [] };
        projects.push(currentProject);
      }
    } 
    
    if (colA && colB && colB.includes("(h)")) {
        lastPersonName = colA;
    }

    if (currentProject && colB === "Actual (h)") {
      let total = 0;
      const totalKey = Object.keys(r).find(k => k.toUpperCase().trim() === "TOTAL");
      if (totalKey && r[totalKey] !== null && r[totalKey] !== undefined) {
        total = parseFloat(r[totalKey]) || 0;
      } else {
        total = parseFloat(r["col_7"]) || parseFloat(r["col_6"]) || 0;
      }

      if (total > 0) {
        currentProject.members.push({ name: lastPersonName || "Unknown", total });
      }
    }
  });

  const result = projects.map(p => {
    const totalHours = p.members.reduce((sum, m) => sum + m.total, 0);
    return { projectName: p.name, totalHours, members: p.members };
  }).filter(p => p.totalHours > 0);

  console.dir(result.slice(0, 2), { depth: null });
}
test();
