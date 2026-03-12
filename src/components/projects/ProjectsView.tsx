"use client";

import { Briefcase, Clock, DollarSign, Users, ExternalLink, Calendar, Activity } from "lucide-react";
import { StatsCard } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/Badge";
import { useState, useEffect } from "react";
import { DateFilter } from "@/components/ui/DateFilter";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";

interface ProjectsViewProps {
  rates: any[];
  projectHours: any[];
  payments: any[];
  initialMonthIndex: number | 'lifetime';
}

export function ProjectsView({ rates, projectHours, payments, initialMonthIndex }: ProjectsViewProps) {
  const router = useRouter();
  
  useEffect(() => {
    // Automatically refresh the page data every 30 seconds
    const interval = setInterval(() => {
      router.refresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [router]);
  
  // Mapping for DateFilter display
  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  
  const handleMonthChange = (idx: number | 'lifetime') => {
    router.push(`/projects?month=${idx}`);
  };

  const normalize = (name: string) => {
    if (!name) return '';
    // Strip everything after first bracket/paren for better matching
    const baseName = name.split('(')[0].split('[')[0].trim();
    return baseName.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
  };

  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getMemberRate = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('qa') || n.includes('vika')) return 10;
    if (n.includes('design') || n.includes('sofia') || n.includes('ksenia')) return 15;
    if (n.includes('kate') || n.includes('ceo')) return 0;
    return 20; // Developers, PMs, default
  };

  const projectSummary = projectHours.map(hoursData => {
    const normName = normalize(hoursData.projectName);

    // Find rate
    const rateItem = rates.find(r => normalize(r.name) === normName);
    const rate = rateItem ? rateItem.rate : 0;

    // Find payment data
    const paymentItem = payments.find(p => normalize(p.name) === normName);
    const realPayment = paymentItem 
      ? (initialMonthIndex === 'lifetime' 
          ? paymentItem.realMonthly.reduce((sum: number, val: number) => sum + (val || 0), 0)
          : paymentItem.realMonthly[initialMonthIndex as number] || 0) 
      : 0;

    // "Estimated cost" = max member hours * project billed rate
    const maxMemberHours = hoursData.members?.length > 0 
      ? Math.max(...hoursData.members.map((m: any) => m.total)) 
      : 0;
    const estimatedCost = maxMemberHours * rate;

    // "Max possible cost" = sum of member.total * individual rate
    const maxPossibleCost = hoursData.members?.reduce((sum: number, m: any) => sum + (m.total * getMemberRate(m.name)), 0) || 0;

    return {
      name: hoursData.projectName,
      rate,
      members: hoursData.members || [],
      totalHours: hoursData.totalHours,
      estimatedCost,
      maxPossibleCost,
      realPayment,
      status: rateItem?.status || "Unknown"
    };
  }).sort((a, b) => {
    if (sortConfig) {
      const { key, direction } = sortConfig;
      let aVal = (a as any)[key];
      let bVal = (b as any)[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    }
    return b.estimatedCost - a.estimatedCost;
  });

  const totalMaxCost = projectSummary.reduce((sum, p) => sum + p.maxPossibleCost, 0);
  const totalEstimatedCost = projectSummary.reduce((sum, p) => sum + p.estimatedCost, 0);
  const totalRealPayment = projectSummary.reduce((sum, p) => sum + p.realPayment, 0);
  const totalHours = projectSummary.reduce((sum, p) => sum + p.totalHours, 0);

  const stats = [
    { title: "Real Revenue", value: `$${Math.round(totalRealPayment).toLocaleString()}`, icon: Activity },
    { title: "Estimated Cost (Billed)", value: `$${Math.round(totalEstimatedCost).toLocaleString()}`, icon: DollarSign },
    { title: "Max Possible Cost", value: `$${Math.round(totalMaxCost).toLocaleString()}`, icon: Briefcase },
    { title: "Total Hours", value: `${Math.round(totalHours)}h`, icon: Clock },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Cost & Efficiency</h1>
          <p className="text-muted-foreground mt-1">Analysis for {initialMonthIndex === 'lifetime' ? 'All Time (Lifetime)' : months[initialMonthIndex as number]} based on time tracking and payments</p>
        </div>
        <DateFilter selectedMonth={initialMonthIndex} onMonthChange={handleMonthChange} showLifetime />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="card-premium overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold">Project Billability</h2>
          <Badge variant="info">{initialMonthIndex === 'lifetime' ? 'Lifetime' : `${months[initialMonthIndex as number]} 2025-2026`}</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground w-1/4">Project Name & Members</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center cursor-pointer hover:text-primary transition-colors" onClick={() => requestSort('totalHours')}>
                  <div className="flex items-center justify-center gap-1">Total Hours <ArrowUpDown className="w-3 h-3"/></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right cursor-pointer hover:text-primary transition-colors" onClick={() => requestSort('maxPossibleCost')}>
                  <div className="flex items-center justify-end gap-1">Max Possible Cost <ArrowUpDown className="w-3 h-3"/></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right cursor-pointer hover:text-primary transition-colors" onClick={() => requestSort('estimatedCost')}>
                  <div className="flex items-center justify-end gap-1">Estimated Cost <ArrowUpDown className="w-3 h-3"/></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right cursor-pointer hover:text-primary transition-colors" onClick={() => requestSort('realPayment')}>
                  <div className="flex items-center justify-end gap-1">Real Receipt <ArrowUpDown className="w-3 h-3"/></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projectSummary.map((project, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 align-top">
                    <div className="font-semibold text-sm mb-2">{project.name}</div>
                    <div className="text-[11px] text-muted-foreground uppercase mb-2">{project.status}</div>
                    <div className="space-y-1">
                      {project.members && project.members.map((m: any, idx2: number) => (
                        <div key={idx2} className="text-xs flex justify-between gap-4">
                          <span className="text-muted-foreground">{m.name}:</span> 
                          <span className="font-medium">{Math.round(m.total)}h</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center align-top">
                    <div className="text-sm font-bold mt-1">{Math.round(project.totalHours)}h</div>
                  </td>
                  <td className="px-6 py-4 text-right align-top">
                    <div className="text-sm font-semibold text-amber-600 mt-1">${Math.round(project.maxPossibleCost).toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">Internal Cost</div>
                  </td>
                  <td className="px-6 py-4 text-right align-top">
                    <div className="text-sm font-bold text-primary mt-1">${Math.round(project.estimatedCost).toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">${project.rate}/h * {Math.round(project.estimatedCost / (project.rate || 1))}h</div>
                  </td>
                  <td className="px-6 py-4 text-right align-top">
                    <div className="text-sm font-extrabold text-success mt-1">${Math.round(project.realPayment).toLocaleString()}</div>
                  </td>
                </tr>
              ))}
              {projectSummary.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No time tracking logs found for this month in the Billability sheet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
