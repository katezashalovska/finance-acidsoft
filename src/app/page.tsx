import { fetchSheetData, transformModelData, transformProjectData, transformTeamData } from "@/lib/google-sheets";
import { DashboardView } from "@/components/dashboard/DashboardView";

// Revalidate on every request
export const revalidate = 0;

export default async function DashboardPage() {
  const modelRows = await fetchSheetData("417217095");
  const projectRows = await fetchSheetData("204297728");
  const teamRows = await fetchSheetData("901676994");

  const trendData = transformModelData(modelRows);
  const projects = transformProjectData(projectRows);
  const team = transformTeamData(teamRows);

  return <DashboardView data={trendData} projects={projects} team={team} />;
}
