export async function fetchSheetData(gid: string, spreadsheetIdOverride?: string) {
  const defaultSpreadsheetId = "1rVf7853cSxXa_DcErq062mSJzD0UlCITk4oFM0mQh-s";
  const spreadsheetId = spreadsheetIdOverride || defaultSpreadsheetId;
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
        // Always add a indexed column key for reliable access across sheets
        rowData[`col_${index}`] = cell ? cell.v : null;
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
    // Planned values (from current month column)
    // Revenue row: May starts at col_1, Jun at col_2...
    Revenue: revenueRow[`col_${i + 1}`] || 0,
    GrossProfit: netProfitRow[`col_${i + 1}`] || 0,
    "Net Profit": actualNetProfitRow[`col_${i + 1}`] || 0,
    
    // Real values (Cash flow): take from NEXT month column
    "Real Revenue": revenueRow[`col_${i + 2}`] || 0,
    "Real Net Profit": actualNetProfitRow[`col_${i + 2}`] || 0
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
    const realCurrentMonthly = new Array(12).fill(0);
    // Oct starts at index 5
    // Planned Oct: col 1
    // Real Oct: Dec Real (col 2 pairs later) - No, based on observation:
    // Oct is index 5. 
    // Data col mapping:
    // col 1: Oct Planned? 
    // col 2: Nov Planned
    // col 3: Dec Planned? or Real? 
    // Looking at "colIdx = 2 + (i * 2)" for Nov (i=0) -> col 2.
    // Nov Planned = col 2
    // Dec Planned = col 4
    // Jan Planned = col 6
    // Feb Planned = col 8
    // Mar Planned = col 10
    // Apr Planned = col 12
    
    // Oct Planned is indeed col 1.
    plannedMonthly[5] = r["col_1"] || 0; 
    // Oct Real is Nov's payment? Let's use simpler logic: 
    // realMonthly[i] = plannedMonthly[i+1] if real columns are missing for some.
    // BUT the user said "sum from column for month + 1".
    
    // Nov to Apr (pairs)
    for (let i = 0; i < 6; i++) {
      const monthIdx = 6 + i; // Nov (6), Dec (7)...
      const colIdx = 2 + (i * 2); 
      plannedMonthly[monthIdx] = r[`col_${colIdx}`] || 0;
      
      // REAL for this month is taken from the NEXT month's REAL column.
      const nextColIdx = 2 + ((i + 1) * 2);
      realMonthly[monthIdx] = r[`col_${nextColIdx + 1}`] || 0;
      
      // REAL for the CURRENT month (no offset)
      realCurrentMonthly[monthIdx] = r[`col_${colIdx + 1}`] || 0;
    }
    
    // Handle Oct Real (month index 5) -> takes from Nov Real (month index 6 column)
    realMonthly[5] = r["col_3"] || 0;
    realCurrentMonthly[5] = r["col_2"] || 0;
    
    // Special check for realMonthly[10] (March) -> should take from col 12 (April Planned)
    // The loop above for i=4 (Mar) sets realMonthly[10] = r[`col_12`] (i+1=5) which is correct.
    
    return {
      name: r["col_0"],
      plannedMonthly,
      realMonthly,
      realCurrentMonthly,
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
        // Opex also follows the month + 1 rule for real values
        monthlyValues[i] = row[`col_${i + 2}`] || 0;
      }
    }

    return {
      name: category,
      monthlyValues
    };
  });
}

export function transformProjectRates(rows: any[]) {
  return rows.map(r => ({
    name: r["col_0"],
    rate: typeof r["col_6"] === 'number' ? r["col_6"] : (parseFloat(r["col_6"]) || 0),
    status: r["col_7"] || "Unknown"
  })).filter(p => p.name && p.name !== "Name" && p.name !== "Project");
}

export function transformTimeTrackingData(rows: any[]) {
  const projects: any[] = [];
  let currentProject: any = null;
  let lastPersonName: string = "";

  const skipHeaders = [
    "Name", "Billability %", "Plan per team (h)", "Actual team (h)", 
    "Overtime/Shortage (h)", "Total hours", "DATA FROM CLIENT",
    "Billability Kitsune (Kate)", "Billability Akatsuki (Oleksandr)",
    "Kitsune (Kate)", "Other activity", "Akatsuki (Oleksandr)"
  ];

  rows.forEach(r => {
    const colA = (r["col_0"] === null || r["col_0"] === undefined || r["col_0"] === "null") ? "" : r["col_0"].toString().trim();
    const colB = (r["col_1"] === null || r["col_1"] === undefined || r["col_1"] === "null") ? "" : r["col_1"].toString().trim();

    // Identify project headers
    if (colA && !colB) {
      if (skipHeaders.some(h => colA.includes(h))) {
        currentProject = null;
      } else {
        currentProject = {
          name: colA,
          members: []
        };
        projects.push(currentProject);
      }
    } 
    
    // Track person name
    if (colA && colB && colB.includes("(h)")) {
        lastPersonName = colA;
    }

    // Process Actual (h) row
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

  return projects.map(p => {
    const totalHours = p.members.reduce((sum: number, m: any) => sum + m.total, 0);
    const weeklyMax = [0, 0, 0, 0];
    p.members.forEach((m: any) => {
      for (let i = 0; i < 4; i++) {
        weeklyMax[i] = Math.max(weeklyMax[i], m.weeklyHours[i]);
      }
    });
    const teamSpanHours = weeklyMax.reduce((sum, h) => sum + h, 0);

    return {
      projectName: p.name,
      totalHours,
      teamSpanHours,
      members: p.members
    };
  }).filter(p => p.totalHours > 0);
}

/**
 * Transform billed revenue data from "Фінансова модель" sheet (GID 1105487373).
 * 
 * Sheet structure (pairs of columns per month):
 *   col_0: Project name
 *   col_1: Rate for Feb 2026, col_2: Billed hours for Feb 2026
 *   col_3: Rate for Mar 2026, col_4: Billed hours for Mar 2026
 *   col_5: Rate for Apr 2026, col_6: Billed hours for Apr 2026
 *   col_7: Rate for May 2026, col_8: Billed hours for May 2026
 *   col_9: Rate for Jun 2026, col_10: Billed hours for Jun 2026
 * 
 * Month index mapping (May=0 ... Apr=11):
 *   Feb=9, Mar=10, Apr=11
 * 
 * Returns: { name, monthlyRate, monthlyBilledHours, monthlyBilledRevenue }[]
 */
export function transformBilledRevenueData(rows: any[]) {
  // Skip header rows: "Посада", "Project", "Total"
  const projectRows = rows.filter(r =>
    r["col_0"] &&
    r["col_0"] !== "Посада" &&
    r["col_0"] !== "Project" &&
    r["col_0"] !== "Total"
  );

  // Month-to-column mapping: [monthIndex, rateCol, hoursCol]
  const monthColMap: Array<{ monthIdx: number; rateCol: string; hoursCol: string }> = [
    { monthIdx: 9,  rateCol: "col_1", hoursCol: "col_2" },  // Feb
    { monthIdx: 10, rateCol: "col_3", hoursCol: "col_4" },  // Mar
    { monthIdx: 11, rateCol: "col_5", hoursCol: "col_6" },  // Apr
  ];

  return projectRows.map(r => {
    const monthlyRate = new Array(12).fill(0);
    const monthlyBilledHours = new Array(12).fill(0);
    const monthlyBilledRevenue = new Array(12).fill(0);

    monthColMap.forEach(({ monthIdx, rateCol, hoursCol }) => {
      const rate = parseFloat(r[rateCol]) || 0;
      const hours = parseFloat(r[hoursCol]) || 0;
      monthlyRate[monthIdx] = rate;
      monthlyBilledHours[monthIdx] = hours;
      monthlyBilledRevenue[monthIdx] = rate * hours;
    });

    return {
      name: r["col_0"],
      monthlyRate,
      monthlyBilledHours,
      monthlyBilledRevenue,
    };
  });
}
