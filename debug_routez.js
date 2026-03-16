import { fetchSheetData, transformBilledRevenueData } from "./src/lib/google-sheets.js";

async function debug() {
  const billedRows = await fetchSheetData("1105487373");
  const billedRevenueData = transformBilledRevenueData(billedRows);
  const routez = billedRevenueData.find(p => p.name.includes("Routez"));
  
  if (routez) {
    console.log("Routez Raw Data (Feb - index 9):", {
      name: routez.name,
      rate: routez.monthlyRate[9],
      hours: routez.monthlyBilledHours[9],
      revenue: routez.monthlyBilledRevenue[9]
    });
    
    // Also check col mapping for the raw row
    const rawRoutez = billedRows.find(r => r["col_0"] && r["col_0"].includes("Routez"));
    console.log("Routez Raw Row Columns:", {
      col_0: rawRoutez["col_0"],
      col_1: rawRoutez["col_1"],
      col_2: rawRoutez["col_2"],
      col_3: rawRoutez["col_3"],
      col_4: rawRoutez["col_4"]
    });
  } else {
    console.log("Routez not found in billedRevenueData");
    console.log("All projects:", billedRevenueData.map(p => p.name));
  }
}

debug();
