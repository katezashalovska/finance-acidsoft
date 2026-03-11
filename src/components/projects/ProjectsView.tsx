"use client";

import { Briefcase, Clock, DollarSign, Users, ExternalLink, Calendar } from "lucide-react";
import { StatsCard } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/Badge";
import { useState } from "react";
import { DateFilter } from "@/components/ui/DateFilter";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProjectsViewProps {
  rates: any[];
  projectHours: any[];
  initialMonthIndex: number;
}

export function ProjectsView({ rates, projectHours, initialMonthIndex }: ProjectsViewProps) {
  const router = useRouter();
  
  // Mapping for DateFilter display
  // Our months array starts at May 2025
  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  
  const handleMonthChange = (idx: number) => {
    router.push(`/projects?month=${idx}`);
  };

  const normalize = (name: string) => name?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';

  // Merge Rates and Hours
  const projectSummary = projectHours.map(hoursData => {
    // Find rate for this project
    const rateItem = rates.find(r => 
      normalize(r.name) === normalize(hoursData.projectName)
    );

    const rate = rateItem ? rateItem.rate : 0;
    const totalCost = hoursData.totalHours * rate;
    const teamSpanCost = hoursData.teamSpanHours * rate;

    return {
      name: hoursData.projectName,
      rate,
      totalHours: hoursData.totalHours,
      teamSpanHours: hoursData.teamSpanHours,
      totalValuation: totalCost,
      teamSpanValuation: teamSpanCost,
      status: rateItem?.status || "Unknown"
    };
  }).sort((a, b) => b.totalValuation - a.totalValuation);

  const totalValuation = projectSummary.reduce((sum, p) => sum + p.totalValuation, 0);
  const totalHours = projectSummary.reduce((sum, p) => sum + p.totalHours, 0);

  const stats = [
    { title: "Total Project Value", value: `$${Math.round(totalValuation).toLocaleString()}`, icon: DollarSign },
    { title: "Billable Hours", value: `${Math.round(totalHours)}h`, icon: Clock },
    { title: "Team Span Cost", value: `$${Math.round(projectSummary.reduce((sum, p) => sum + p.teamSpanValuation, 0)).toLocaleString()}`, icon: Briefcase },
    { title: "Active Projects", value: projectSummary.length.toString(), icon: Users },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Cost & Efficiency</h1>
          <p className="text-muted-foreground mt-1">Analysis for {months[initialMonthIndex]} based on time tracking</p>
        </div>
        <DateFilter selectedMonth={initialMonthIndex} onMonthChange={handleMonthChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="card-premium overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold">Project Billability</h2>
          <Badge variant="info">{months[initialMonthIndex]} 2025-2026</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Rate</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Total Team Hours</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Span Hours (Elapsed)</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Project Value</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Span Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projectSummary.map((project, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-sm">{project.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{project.status}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium">${project.rate}/h</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-bold">{Math.round(project.totalHours)}h</div>
                    <div className="text-[10px] text-muted-foreground">Cumulative</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-bold text-amber-600">{Math.round(project.teamSpanHours)}h</div>
                    <div className="text-[10px] text-muted-foreground">Max Team Overlap</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-primary">${Math.round(project.totalValuation).toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground lowercase">hours * rate</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-success">${Math.round(project.teamSpanValuation).toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground lowercase">span * rate</div>
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
