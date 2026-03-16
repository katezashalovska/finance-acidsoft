const https = require('https');

function fetchSheet(gid, sheetId) {
  const spreadsheetId = sheetId || "1rVf7853cSxXa_DcErq062mSJzD0UlCITk4oFM0mQh-s";
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${gid}&t=${Date.now()}`;
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const json = JSON.parse(data.substring(data.indexOf("(") + 1, data.lastIndexOf(")")));
        const table = json.table;
        const rows = table.rows.map(r => {
          const rowData = {};
          r.c.forEach((c, i) => {
            rowData[`col_${i}`] = c ? c.v : null;
          });
          return rowData;
        });
        resolve(rows);
      });
    });
  });
}

function transformProjectData(rows) {
  const projectRows = rows.filter(r =>
    r["col_0"] &&
    r["col_0"] !== "Project" &&
    r["col_0"] !== "Посада" &&
    r["col_0"] !== "Total" &&
    !String(r["col_0"]).includes("Date")
  );

  return projectRows.map(r => {
    const plannedMonthly = new Array(12).fill(0);
    const realMonthly = new Array(12).fill(0);
    const realCurrentMonthly = new Array(12).fill(0);

    plannedMonthly[5] = r["col_1"] || 0;

    for (let i = 0; i < 6; i++) {
      const monthIdx = 6 + i;
      const colIdx = 2 + (i * 2);
      plannedMonthly[monthIdx] = r[`col_${colIdx}`] || 0;

      const nextColIdx = 2 + ((i + 1) * 2);
      realMonthly[monthIdx] = r[`col_${nextColIdx + 1}`] || 0;

      realCurrentMonthly[monthIdx] = r[`col_${colIdx + 1}`] || 0;
    }

    realMonthly[5] = r["col_3"] || 0;
    realCurrentMonthly[5] = r["col_2"] || 0;

    return {
      name: r["col_0"],
      plannedMonthly,
      realMonthly,
      realCurrentMonthly,
    };
  });
}

async function main() {
  const paymentRows = await fetchSheet("204297728");
  const projects = transformProjectData(paymentRows);

  // Find BiteBudget
  const bb = projects.find(p => p.name.toLowerCase().includes("bite"));
  if (bb) {
    console.log("=== BiteBudget Data ===");
    console.log("Name:", bb.name);
    console.log("plannedMonthly:", bb.plannedMonthly);
    console.log("realMonthly:", bb.realMonthly);
    console.log("realCurrentMonthly:", bb.realCurrentMonthly);
    
    // The table uses tablePerfMonth = tableMonthIndex + 1
    // For Feb (index 9): tablePerfMonth = 10
    // For Mar (index 10): tablePerfMonth = 11
    console.log("\nFor tableMonth=Feb(9), tablePerfMonth=10, realMonthly[10]:", bb.realMonthly[10]);
    console.log("For tableMonth=Mar(10), tablePerfMonth=11, realMonthly[11]:", bb.realMonthly[11]);
    console.log("For tableMonth=Feb(9), realCurrentMonthly[10]:", bb.realCurrentMonthly[10]);
    
    // Also show raw cols for BiteBudget
    const rawRow = paymentRows.find(r => r.col_0 && r.col_0.toLowerCase().includes("bite"));
    console.log("\n=== RAW COLUMNS ===");
    for (let i = 0; i <= 22; i++) {
      console.log(`col_${i}: ${rawRow[`col_${i}`]}`);
    }
  } else {
    console.log("BiteBudget NOT FOUND in projects");
  }
  
  // Show Routez too
  const rt = projects.find(p => p.name.toLowerCase().includes("routez"));
  if (rt) {
    console.log("\n=== Routez Data ===");
    console.log("Name:", rt.name);
    console.log("plannedMonthly:", rt.plannedMonthly);
    console.log("realMonthly:", rt.realMonthly);
  }
}

main();
