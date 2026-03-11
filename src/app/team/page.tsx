import { fetchSheetData, transformTeamData } from "@/lib/google-sheets";
import { TeamView } from "@/components/team/TeamView";

export const revalidate = 60;

export default async function TeamPage() {
  const teamRows = await fetchSheetData("901676994");
  const team = transformTeamData(teamRows);

  return <TeamView team={team} />;
}
