import { fetchSheetData, transformTeamData } from "@/lib/google-sheets";
import { PayrollView } from "@/components/payroll/PayrollView";

export const revalidate = 0;

export default async function PayrollPage() {
  const teamRows = await fetchSheetData("901676994");
  const team = transformTeamData(teamRows);

  return <PayrollView team={team} />;
}
