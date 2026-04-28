import { fetchSheetDataWithCols, transformSalesData } from "@/lib/google-sheets";
import { SalesView } from "@/components/sales/SalesView";

export const revalidate = 0;

export default async function SalesPage({ searchParams }: { searchParams: { month?: string } }) {
  const spreadsheetId = '1ZFhqkyGs0lF_991r_vO3Q08EHkZ-Au1h4gT_K3Gxlbk';
  
  const selectedMonthStr = searchParams.month;
  const isLifetime = selectedMonthStr === 'lifetime';
  // Default to 10 (March) if no parameter is provided
  const selectedMonth = isLifetime ? 'lifetime' : (selectedMonthStr ? parseInt(selectedMonthStr) : 10);

  let tabsDefinition = [];

  if (isLifetime) {
     tabsDefinition = [
       { name: "Upwork (Jan-Mar)", gid: "1809725206" },
       { name: "Upwork (Apr)", gid: "957980656" },
       { name: "LinkedIn (Apr)", gid: "532983770" }
     ];
  } else if (selectedMonth === 11) { // April
     tabsDefinition = [
       { name: "Upwork", gid: "957980656" },
       { name: "LinkedIn", gid: "532983770" }
     ];
  } else if (typeof selectedMonth === 'number' && selectedMonth >= 8 && selectedMonth <= 10) { // Jan, Feb, Mar
     tabsDefinition = [
       { name: "Upwork Q1", gid: "1809725206" }
     ];
  } else {
     // fallback if no explicitly mapped tabs, show Q1
     tabsDefinition = [
       { name: "Upwork Q1", gid: "1809725206" }
     ];
  }

  const parsedDataList = await Promise.all(
    tabsDefinition.map(async (tab) => {
       const { rows, cols } = await fetchSheetDataWithCols(tab.gid, spreadsheetId);
       let data = transformSalesData(rows, cols);

       if (!isLifetime && tab.gid === "1809725206") {
           const monthFilterMapping: Record<number, string> = {
              8: "01",
              9: "02",
              10: "03"
           };
           const filterStr = monthFilterMapping[selectedMonth as number];
           if (filterStr) {
               data = data.filter(d => d.week.includes(`.${filterStr}`) || d.week.includes(`-${filterStr}`));
           }
       }

       return { name: tab.name, data, gid: tab.gid };
    })
  );

  let salesDataList = [];

  if (isLifetime) {
     const upworkQ1 = parsedDataList.find(t => t.gid === "1809725206")?.data || [];
     const upworkApr = parsedDataList.find(t => t.gid === "957980656")?.data || [];
     const linkedInApr = parsedDataList.find(t => t.gid === "532983770")?.data || [];

     salesDataList = [
       { name: "Upwork (Lifetime)", data: [...upworkQ1, ...upworkApr] },
       { name: "LinkedIn (All Time)", data: linkedInApr }
     ];
  } else {
     salesDataList = parsedDataList.map(t => ({ name: t.name, data: t.data }));
  }

  return <SalesView salesDataList={salesDataList} initialMonthIndex={selectedMonth} />;
}
