import { fetchSheetData, transformProjectData } from "@/lib/google-sheets";
import { RevenueView } from "@/components/revenue/RevenueView";

export const revalidate = 60;

export default async function RevenuePage() {
  const projectRows = await fetchSheetData("204297728");
  const projects = transformProjectData(projectRows);

  return <RevenueView projects={projects} />;
}
