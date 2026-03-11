"use client";

import { Users, DollarSign, Activity, ShoppingCart } from "lucide-react";
import { StatsCard } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/Badge";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { DateFilter } from "@/components/ui/DateFilter";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DashboardViewProps {
  data: any[];
  projects: any[];
  team: any[];
}

export function DashboardView({ data, projects, team }: DashboardViewProps) {
  // Calculate default month index based on current date
  const getDefaultMonthIndex = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); 
    const startYear = 2025;
    const startMonth = 4; // May
    let index = (currentYear - startYear) * 12 + (currentMonth - startMonth);
    return Math.max(0, Math.min(index, data.length - 1));
  };

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(getDefaultMonthIndex());
  
  // Stats for the selected month
  const currentMonthData = data[selectedMonthIndex] || {};
  const prevMonthData = data[selectedMonthIndex - 1] || {};

  const calculateTrend = (current: number, prev: number) => {
    if (!prev) return { value: 0, isPositive: true };
    const diff = ((current - prev) / prev) * 100;
    return { value: Math.abs(Math.round(diff * 10) / 10), isPositive: diff >= 0 };
  };

  // Projects for the selected month (using Planned Revenue as trigger)
  const activeProjects = projects.filter(p => p.plannedMonthly[selectedMonthIndex] > 0);
  
  // Team members active in the selected month
  const activeTeamMembers = team.filter(m => {
    const salary = m.monthlySalaries[selectedMonthIndex];
    return typeof salary === 'number' || m.name.toLowerCase().includes("ceo");
  });

  const totalLTV = projects.reduce((sum, p) => sum + (p.ltv || 0), 0);

  const stats = [
    { 
      title: "Revenue", 
      value: currentMonthData.Revenue ? `$${Math.round(currentMonthData.Revenue).toLocaleString()}` : "$0", 
      icon: DollarSign,
      trend: calculateTrend(currentMonthData.Revenue, prevMonthData.Revenue)
    },
    { 
      title: "Net Profit", 
      value: currentMonthData["Net Profit"] ? `$${Math.round(currentMonthData["Net Profit"]).toLocaleString()}` : "$0", 
      icon: Activity,
      trend: calculateTrend(currentMonthData["Net Profit"], prevMonthData["Net Profit"])
    },
    { title: "Portfolio LTV", value: `$${Math.round(totalLTV).toLocaleString()}`, icon: ShoppingCart },
    { title: "Team Members", value: activeTeamMembers.length.toString(), icon: Users },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time data for {currentMonthData.Month || "N/A"}</p>
        </div>
        <DateFilter 
          selectedMonth={selectedMonthIndex} 
          onMonthChange={setSelectedMonthIndex} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-premium p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold">Revenue Trend</h3>
            <p className="text-sm text-muted-foreground">Monthly revenue performance ($)</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4D7CFE" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4D7CFE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFEF" />
                <XAxis dataKey="Month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6F767E' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6F767E' }} />
                <Tooltip />
                <Area type="monotone" dataKey="Revenue" stroke="#4D7CFE" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold">Monthly Profit</h3>
            <p className="text-sm text-muted-foreground">Net profit breakdown by month ($)</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFEF" />
                <XAxis dataKey="Month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6F767E' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6F767E' }} />
                <Tooltip />
                <Bar dataKey="Net Profit" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry["Net Profit"] >= 0 ? '#27AE60' : '#EB5757'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card-premium">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-bold">Project Performance</h3>
          <Badge variant="info">{activeProjects.length} Planned in {currentMonthData.Month}</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Planned</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Real ({currentMonthData.Month})</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">LTV (Lifetime)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeProjects.map((project, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-sm">{project.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">${Math.round(project.plannedMonthly[selectedMonthIndex]).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">${Math.round(project.realMonthly[selectedMonthIndex]).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-bold text-success">${Math.round(project.ltv).toLocaleString()}</td>
                </tr>
              ))}
              {activeProjects.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No active projects planned for this month</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
