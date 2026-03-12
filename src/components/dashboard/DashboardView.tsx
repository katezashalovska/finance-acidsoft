"use client";

import { Users, DollarSign, Activity, ShoppingCart, ArrowUpDown } from "lucide-react";
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

  const [sortConfig, setSortConfig] = useState<{ key: 'ltv' | 'name' | 'planned' | 'real', direction: 'asc' | 'desc' } | null>(null);

  const requestSort = (key: 'ltv' | 'name' | 'planned' | 'real') => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProjects = [...projects].sort((a, b) => {
    if (sortConfig) {
      const { key, direction } = sortConfig;
      let aVal, bVal;
      if (key === 'ltv') {
        aVal = a.ltv || 0;
        bVal = b.ltv || 0;
      } else if (key === 'name') {
        aVal = a.name;
        bVal = b.name;
      } else if (key === 'planned') {
        aVal = a.plannedMonthly[selectedMonthIndex] || 0;
        bVal = b.plannedMonthly[selectedMonthIndex] || 0;
      } else if (key === 'real') {
        aVal = a.realMonthly[selectedMonthIndex] || 0;
        bVal = b.realMonthly[selectedMonthIndex] || 0;
      } else {
        aVal = 0; bVal = 0;
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    }

    // Default sorting: active this month first
    const aPlanned = a.plannedMonthly[selectedMonthIndex] || 0;
    const aReal = a.realMonthly[selectedMonthIndex] || 0;
    const bPlanned = b.plannedMonthly[selectedMonthIndex] || 0;
    const bReal = b.realMonthly[selectedMonthIndex] || 0;

    const aActive = aPlanned > 0 || aReal > 0;
    const bActive = bPlanned > 0 || bReal > 0;

    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;

    // Both active or both inactive, sort by LTV desc
    return (b.ltv || 0) - (a.ltv || 0);
  });

  const activeCount = projects.filter(p => (p.plannedMonthly[selectedMonthIndex] || 0) > 0).length;
  
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
          <Badge variant="info">{activeCount} / {projects.length} Projects in {currentMonthData.Month}</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th 
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Project Name
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => requestSort('planned')}
                >
                  <div className="flex items-center gap-2">
                    Planned
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => requestSort('real')}
                >
                  <div className="flex items-center gap-2">
                    Real ({currentMonthData.Month})
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => requestSort('ltv')}
                >
                  <div className="flex items-center gap-2">
                    LTV (Lifetime)
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedProjects.map((project, idx) => {
                const isInactive = (project.plannedMonthly[selectedMonthIndex] || 0) === 0 && (project.realMonthly[selectedMonthIndex] || 0) === 0;
                return (
                  <tr key={idx} className={cn("hover:bg-gray-50 transition-colors", isInactive && "opacity-60 grayscale-[0.5]")}>
                    <td className="px-6 py-4 font-semibold text-sm">
                      {project.name}
                      {isInactive && <span className="ml-2 text-[10px] uppercase font-normal text-muted-foreground tracking-tighter">(Inactive this month)</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">${Math.round(project.plannedMonthly[selectedMonthIndex] || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">${Math.round(project.realMonthly[selectedMonthIndex] || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-success">${Math.round(project.ltv || 0).toLocaleString()}</td>
                  </tr>
                );
              })}
              {sortedProjects.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No projects found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
