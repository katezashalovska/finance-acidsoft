"use client";

import { Users, DollarSign, Clock, Trophy } from "lucide-react";
import { StatsCard } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

import { DateFilter } from "@/components/ui/DateFilter";
import { useState } from "react";

interface TeamViewProps {
  team: any[];
}

export function TeamView({ team }: TeamViewProps) {
  const getDefaultMonthIndex = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); 
    const startYear = 2025;
    const startMonth = 4; // May
    let index = (currentYear - startYear) * 12 + (currentMonth - startMonth);
    return Math.max(0, Math.min(index, 11));
  };

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(getDefaultMonthIndex());
  
  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const currentMonthName = months[selectedMonthIndex];

  // Filter members: include if salary is a number (including 0), exclude if null
  const activeMembers = team.filter(member => {
    const salary = member.monthlySalaries[selectedMonthIndex];
    return typeof salary === 'number';
  });
  
  const totalSalaries = activeMembers.reduce((sum, member) => sum + (member.monthlySalaries[selectedMonthIndex] || 0), 0);
  
  const teamStats = [
    { title: "Active Members", value: activeMembers.length.toString(), icon: Users },
    { title: "Total Payroll", value: `$${Math.round(totalSalaries).toLocaleString()}`, icon: DollarSign },
    { title: "Avg Salary", value: activeMembers.length > 0 ? `$${Math.round(totalSalaries / activeMembers.length).toLocaleString()}` : "$0", icon: Clock },
    { title: "Reporting Month", value: currentMonthName, icon: Trophy },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Analysis</h1>
          <p className="text-muted-foreground mt-1">Personnel data for {currentMonthName} 2025-26</p>
        </div>
        <DateFilter 
          selectedMonth={selectedMonthIndex} 
          onMonthChange={setSelectedMonthIndex} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teamStats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Active Employees</h2>
          <Badge variant="info">{activeMembers.length} Members</Badge>
        </div>
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Name / Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Salary ({currentMonthName})</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeMembers.map((member, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-sm">{member.name || "Unnamed"}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">${Math.round(member.monthlySalaries[selectedMonthIndex] || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {member.monthlySalaries[selectedMonthIndex] > 0 ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="warning">On Bench</Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {activeMembers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No active team members for this month</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
