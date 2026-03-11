export async function fetchSheetData(gid: string) {
  const spreadsheetId = "1rVf7853cSxXa_DcErq062mSJzD0UlCITk4oFM0mQh-s";
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${gid}&t=${Date.now()}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    const text = await response.text();
    
    const jsonData = JSON.parse(text.substring(text.indexOf("(") + 1, text.lastIndexOf(")")));
    
    if (jsonData.status === "error") {
      throw new Error(jsonData.errors[0].detailed_message);
    }

    const table = jsonData.table;
    const rows = table.rows.map((row: any) => {
      const rowData: any = {};
      row.c.forEach((cell: any, index: number) => {
        const colLabel = table.cols[index].label || `col_${index}`;
        rowData[colLabel] = cell ? cell.v : null;
      });
      return rowData;
    });

    return rows;
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return [];
  }
}

export function transformModelData(rows: any[]) {
  const revenueRow = rows.find(r => r["col_0"] === "Revenue");
  const netProfitRow = rows.find(r => r["col_0"] === "Gross profit"); 
  const actualNetProfitRow = rows.find(r => r["col_0"] === "Net Profit") || netProfitRow;
  
  if (!revenueRow) return [];

  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  
  return months.map((m, i) => ({
    Month: m,
    Revenue: revenueRow[`col_${i + 1}`] || 0,
    GrossProfit: netProfitRow[`col_${i + 1}`] || 0,
    "Net Profit": actualNetProfitRow[`col_${i + 1}`] || 0
  }));
}

export function transformProjectData(rows: any[]) {
  const projectRows = rows.filter(r => 
    r["col_0"] && 
    r["col_0"] !== "Project" && 
    r["col_0"] !== "Посада" && 
    r["col_0"] !== "Total" &&
    !r["col_0"].includes("Date")
  );
  
  return projectRows.map(r => {
    const plannedMonthly = new Array(12).fill(0);
    const realMonthly = new Array(12).fill(0);
    
    // Oct
    realMonthly[5] = r["col_1"] || 0;
    plannedMonthly[5] = r["col_1"] || 0; 

    // Nov to Apr (pairs)
    for (let i = 0; i < 6; i++) {
      const monthIdx = 6 + i;
      const colIdx = 2 + (i * 2);
      plannedMonthly[monthIdx] = r[`col_${colIdx}`] || 0;
      realMonthly[monthIdx] = r[`col_${colIdx + 1}`] || 0;
    }
    
    return {
      name: r["col_0"],
      plannedMonthly,
      realMonthly,
      ltv: realMonthly.reduce((sum, val) => sum + (val || 0), 0)
    };
  });
}

export function transformTeamData(rows: any[]) {
  const teamRows = rows.filter(r => 
    r["col_0"] && 
    r["col_0"] !== "Посада" && 
    r["col_0"] !== "Фонд оплати праці" && 
    r["col_0"] !== "Total hours" &&
    r["col_0"] !== "Tracked hours" &&
    !r["col_0"].includes("Date")
  );
  
  return teamRows.map(r => {
    const monthlySalaries = [];
    for (let i = 1; i <= 25; i++) {
      monthlySalaries.push(r[`col_${i}`]);
    }
    
    return {
      name: r["col_0"],
      monthlySalaries
    };
  });
}

export function transformOpexData(rows: any[]) {
  const opexCategories = [
    "Бухгалтер", "Courses", "FlutterFlow", "Jira", "OpenAI", 
    "IntelligeIdea", "Connects", "Domain", "Linkedin", 
    "Upwork subscribtion", "Upwork comission", "GoDaddy", 
    "Coursor", "Technic", "Clutch", "Consultations", 
    "Hosting", "Freelancehunt", "Vchasno"
  ];

  return opexCategories.map(category => {
    const row = rows.find(r => r["col_0"] === category);
    const monthlyValues = new Array(12).fill(0);
    
    if (row) {
      for (let i = 0; i < 12; i++) {
        monthlyValues[i] = row[`col_${i + 1}`] || 0;
      }
    }

    return {
      name: category,
      monthlyValues
    };
  });
}
