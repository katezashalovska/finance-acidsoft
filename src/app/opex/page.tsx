import { fetchSheetData, transformOpexData } from "@/lib/google-sheets";
import { OpexView } from "@/components/opex/OpexView";

export const revalidate = 0;

export default async function OpexPage() {
  const modelRows = await fetchSheetData("417217095");
  const opexData = transformOpexData(modelRows);

  return <OpexView opexData={opexData} />;
}
