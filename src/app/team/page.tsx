import { fetchSheetData, transformTeamData, transformProjectData, transformTimeTrackingData, transformBilledRevenueData, transformLtvData } from "@/lib/google-sheets";
import { TeamView } from "@/components/team/TeamView";

export const revalidate = 60;

export default async function TeamPage() {
  const teamRows = await fetchSheetData("901676994");
  const team = transformTeamData(teamRows);
  
  const paymentRows = await fetchSheetData("204297728");
  const projectsData = transformProjectData(paymentRows);

  // Fetch billed revenue data (rate × billed hours) from GID 1105487373
  const billedRows = await fetchSheetData("1105487373");
  const billedRevenueData = transformBilledRevenueData(billedRows);

  const ltvRows = await fetchSheetData("1381511218");
  const ltvData = transformLtvData(ltvRows);
  
  const gids: Record<number, string> = {
    4: "1130786620", // Sep
    5: "1957107724", // Oct
    6: "1216072429", // Nov
    7: "1998379465", // Dec
    8: "1648771209", // Jan 2026
    9: "1643503324", // Feb 2026
    10: "387891592",  // Mar 2026
  };
  
  const allMonthsHoursRaw = await Promise.all(
    Object.entries(gids).map(([monthIdx, gid]) => 
      fetchSheetData(gid, "1naDmgdozaXJbsqMHSkA-sDtfUaoUFUIARna4hoB7nKA").then(rows => ({
        monthIdx: parseInt(monthIdx),
        projectHours: transformTimeTrackingData(rows)
      }))
    )
  );
  
  const monthlyProjectHours: Record<number, any[]> = {};
  allMonthsHoursRaw.forEach(m => {
    monthlyProjectHours[m.monthIdx] = m.projectHours;
  });

  return <TeamView team={team} projectsData={projectsData} monthlyProjectHours={monthlyProjectHours} billedRevenueData={billedRevenueData} ltvData={ltvData} />;
}
