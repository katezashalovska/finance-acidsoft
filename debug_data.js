import { fetchSheetData, transformTeamData, transformTimeTrackingData, transformBilledRevenueData } from "./src/lib/google-sheets.js";

async function debug() {
  console.log("Fetching team data...");
  const teamRows = await fetchSheetData("901676994");
  const team = transformTeamData(teamRows);
  console.log("Team members:", team.map(m => m.name).slice(0, 5));

  console.log("Fetching billed revenue data...");
  const billedRows = await fetchSheetData("1105487373");
  const billedRevenueData = transformBilledRevenueData(billedRows);
  console.log("Billed projects sample:", billedRevenueData.map(p => p.name).slice(0, 5));

  const marchGid = "387891592";
  console.log("Fetching March time tracking data...");
  const marchRows = await fetchSheetData(marchGid, "1naDmgdozaXJbsqMHSkA-sDtfUaoUFUIARna4hoB7nKA");
  const marchHours = transformTimeTrackingData(marchRows);
  
  if (marchHours.length > 0) {
    console.log("Project 1 members:", marchHours[0].projectName, marchHours[0].members.map(m => m.name));
  } else {
    console.log("No March hours found!");
  }
}

debug();
