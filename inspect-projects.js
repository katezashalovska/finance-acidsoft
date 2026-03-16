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
  console.log("--- Projects Sheet (GID: 1206121853) ---");
  const projectsTable = await fetchSheetData("1206121853");
  if (projectsTable) {
    console.log("Columns:", projectsTable.cols.map((c, i) => `${i}: ${c.label || 'null'}`).join(" | "));
    // Only print first few project rows
    projectsTable.rows.slice(1, 5).forEach(r => {
        console.log("Row:", r.c.map(cell => cell ? cell.v : 'null').join(" | "));
    });
  }
}

test();
