import { fetchSheetData, transformModelData } from "@/lib/google-sheets";
import { ProfitabilityView } from "@/components/profitability/ProfitabilityView";

export const revalidate = 0;

export default async function ProfitabilityPage() {
  const modelRows = await fetchSheetData("417217095");
  const data = transformModelData(modelRows);

  return <ProfitabilityView data={data} />;
}
