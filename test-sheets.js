const fetch = require("node-fetch");

async function fetchSheetData(gid) {
  const spreadsheetId = "1rVf7853cSxXa_DcErq062mSJzD0UlCITk4oFM0mQh-s";
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${gid}`;

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
      });
      return rowData;
    });

    return rows;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

async function test() {
  console.log("--- Model Sheet ---");
  const modelData = await fetchSheetData("417217095");
  console.log(modelData.slice(0, 8));
  
  console.log("--- Team Sheet ---");
  const teamData = await fetchSheetData("901676994");
  console.log(teamData.slice(0, 5));
}

test();
