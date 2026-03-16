import { fetchSheetData, transformProjectRates, transformTimeTrackingData, transformProjectData } from "@/lib/google-sheets";
import { ProjectsView } from "@/components/projects/ProjectsView";

export const revalidate = 0;

export default async function ProjectsPage({ searchParams }: { searchParams: { month?: string } }) {
  // 1. Fetch Rates (GID 307856390 in first sheet)
  const ratesRows = await fetchSheetData("307856390");
  const rates = transformProjectRates(ratesRows);

  // 2. Fetch Payments (GID 204297728 in first sheet)
  const paymentRows = await fetchSheetData("204297728");
  const payments = transformProjectData(paymentRows);

  // 3. Fetch Hours (Second sheet: 1naDmgdozaXJbsqMHSkA-sDtfUaoUFUIARna4hoB7nKA)
  // Monthly GIDs mapping
  const gids: Record<number, string> = {
    4: "1130786620", // Sep
    5: "1957107724", // Oct
    6: "1216072429", // Nov
    7: "1998379465", // Dec
    8: "1648771209", // Jan 2026
    9: "1643503324", // Feb 2026
    10: "387891592",  // Mar 2026
  };

  // Determine which month to fetch
  const selectedMonthStr = searchParams.month;
  const isLifetime = selectedMonthStr === 'lifetime';
  const selectedMonth = isLifetime ? 'lifetime' : (selectedMonthStr ? parseInt(selectedMonthStr) : 10); 

  // We need all months data every time to build the line chart
  const allGids = Object.entries(gids);
  const allMonthsHoursRaw = await Promise.all(
    allGids.map(([monthIdx, gid]) => 
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

  let projectHours: any[] = [];

  if (isLifetime) {
    const mergedProjects = new Map<string, any>();
    
    for (const monthData of allMonthsHoursRaw) {
        for (const proj of monthData.projectHours) {
            if (!mergedProjects.has(proj.projectName)) {
                mergedProjects.set(proj.projectName, {
                    projectName: proj.projectName,
                    totalHours: 0,
                    teamSpanHours: 0,
                    members: []
                });
            }
            const p = mergedProjects.get(proj.projectName);
            p.totalHours += proj.totalHours;
            p.teamSpanHours += proj.teamSpanHours || 0;
            
            // merge members
            for (const m of proj.members || []) {
                const existingMember = p.members.find((x: any) => x.name === m.name);
                if (existingMember) {
                    existingMember.total += m.total;
                } else {
                    p.members.push({ ...m });
                }
            }
        }
    }
    projectHours = Array.from(mergedProjects.values());
  } else {
    projectHours = monthlyProjectHours[selectedMonth as number] || [];
  }

  return (
    <ProjectsView 
      rates={rates} 
      projectHours={projectHours} 
      payments={payments}
      initialMonthIndex={selectedMonth}
      monthlyProjectHours={monthlyProjectHours}
    />
  );
}
