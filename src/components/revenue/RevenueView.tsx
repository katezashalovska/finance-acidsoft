"use client";

import { TrendingUp, Target, Activity, Briefcase } from "lucide-react";
import { StatsCard } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { DateFilter } from "@/components/ui/DateFilter";
import { useState } from "react";

interface RevenueViewProps {
  projects: any[];
}

export function RevenueView({ projects }: RevenueViewProps) {
  // Use the same getDefaultMonthIndex logic as Dashboard
  const getDefaultMonthIndex = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); 
    const startYear = 2025;
    const startMonth = 4; // May
    let index = (currentYear - startYear) * 12 + (currentMonth - startMonth);
    return Math.max(0, Math.min(index, projects[0]?.plannedMonthly.length - 1 || 11));
  };

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(getDefaultMonthIndex());
  
  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const currentMonthName = months[selectedMonthIndex];

  // Calculate totals from ALL projects for the selected month FIRST
  const totalReal = projects.reduce((sum, p) => sum + (p.realMonthly[selectedMonthIndex] || 0), 0);
  const totalPlanned = projects.reduce((sum, p) => sum + (p.plannedMonthly[selectedMonthIndex] || 0), 0);
  
  // Identify active projects based on PLAN for the counter
  const activeCount = projects.filter(p => p.plannedMonthly[selectedMonthIndex] > 0).length;

  // Map only projects that have EITHER plan or real revenue to show in the list/chart
  const displayData = projects.map(p => ({
    name: p.name,
    Planned: p.plannedMonthly[selectedMonthIndex] || 0,
    Real: p.realMonthly[selectedMonthIndex] || 0,
  })).filter(p => p.Planned > 0 || p.Real > 0);

  const revenueStats = [
    { title: "Total Real Revenue", value: `$${Math.round(totalReal).toLocaleString()}`, icon: TrendingUp },
    { title: "Total Planned", value: `$${Math.round(totalPlanned).toLocaleString()}`, icon: Target },
    { title: "Variance", value: `$${Math.round(totalReal - totalPlanned).toLocaleString()}`, icon: Activity },
    { title: "Active Projects", value: activeCount.toString(), icon: Briefcase },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Analysis</h1>
          <p className="text-muted-foreground mt-1">Project performance for {currentMonthName} 2025-26</p>
        </div>
        <DateFilter 
          selectedMonth={selectedMonthIndex} 
          onMonthChange={setSelectedMonthIndex} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueStats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="card-premium p-6">
        <h3 className="text-lg font-bold mb-6">Planned vs Real by Project ({currentMonthName})</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFEF" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="Planned" fill="#EFEFEF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Real" fill="#4D7CFE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-premium overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Project</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Planned</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Real</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Achievement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayData.map((p, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-sm">{p.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">${Math.round(p.Planned).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm font-bold">${Math.round(p.Real).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <Badge variant={p.Real >= p.Planned ? "success" : "danger"}>
                    {p.Planned > 0 ? ((p.Real / p.Planned) * 100).toFixed(1) : "0"}%
                  </Badge>
                </td>
              </tr>
            ))}
            {displayData.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No revenue data found for this month</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
