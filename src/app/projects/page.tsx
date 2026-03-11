import { fetchSheetData, transformProjectRates, transformTimeTrackingData } from "@/lib/google-sheets";
import { ProjectsView } from "@/components/projects/ProjectsView";

export const revalidate = 0;

export default async function ProjectsPage({ searchParams }: { searchParams: { month?: string } }) {
  // 1. Fetch Rates (GID 307856390 in first sheet)
  const ratesRows = await fetchSheetData("307856390");
  const rates = transformProjectRates(ratesRows);

  // 2. Fetch Hours (Second sheet: 1naDmgdozaXJbsqMHSkA-sDtfUaoUFUIARna4hoB7nKA)
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

  // Determine which month to fetch (Default to Mar 2026 index 10)
  const selectedMonth = searchParams.month ? parseInt(searchParams.month) : 10; 
  const gid = gids[selectedMonth] || "387891592"; // Fallback to March 2026

  const hourRows = await fetchSheetData(gid, "1naDmgdozaXJbsqMHSkA-sDtfUaoUFUIARna4hoB7nKA");
  const projectHours = transformTimeTrackingData(hourRows);

  return (
    <ProjectsView 
      rates={rates} 
      projectHours={projectHours} 
      initialMonthIndex={selectedMonth}
    />
  );
}
