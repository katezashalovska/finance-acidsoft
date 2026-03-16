const fetch = require("node-fetch");

async function fetchSheetData(gid) {
  const spreadsheetId = "1rVf7853cSxXa_DcErq062mSJzD0UlCITk4oFM0mQh-s";
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${gid}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    const jsonData = JSON.parse(text.substring(text.indexOf("(") + 1, text.lastIndexOf(")")));
    
    return jsonData.table;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

async function test() {
  console.log("--- Projects/Payments Sheet (GID: 204297728) ---");
  const table = await fetchSheetData("204297728");
  if (table) {
    console.log("Columns:", table.cols.map((c, i) => `${i}: ${c.label || 'null'}`).join(" | "));
    table.rows.forEach((r, rowIdx) => {
        const rowData = r.c.map(cell => cell ? cell.v : 'null');
        if (rowData[0] && rowData[0] !== 'null') {
            console.log(`Row ${rowIdx}:`, rowData.slice(0, 15).join(" | "));
        }
    });
  }
}

test();
