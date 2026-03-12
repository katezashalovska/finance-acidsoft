"use client";

import { Users, DollarSign, Clock, Trophy } from "lucide-react";
import { StatsCard } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

import { DateFilter } from "@/components/ui/DateFilter";
import { useState } from "react";

interface TeamViewProps {
  team: any[];
  projectsData?: any[];
  monthlyProjectHours?: Record<number, any[]>;
  billedRevenueData?: any[];
}

export function TeamView({ team, projectsData = [], monthlyProjectHours = {}, billedRevenueData = [] }: TeamViewProps) {
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
  const [tableMonthIndex, setTableMonthIndex] = useState(getDefaultMonthIndex());
  const [tableProject, setTableProject] = useState('All');
  
  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const currentMonthName = months[selectedMonthIndex];
  const performanceMonthIndex = selectedMonthIndex + 1;
  const performanceMonthName = months[performanceMonthIndex] || "Next Month";

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

  const getCategory = (salary: number) => {
    if (salary >= 700) return "A";
    if (salary >= 500) return "B";
    if (salary >= 300) return "C";
    return "Intern";
  };

  // Fuzzy match: billed revenue names like "SOLOAPP (Max)" should match hours name "SOLOAPP"
  const findBilledData = (hoursProjectName: string) => {
    const normalizedName = hoursProjectName.toLowerCase().trim();
    return billedRevenueData.find(p => {
      const billedName = p.name.toLowerCase().trim();
      // Extract base name before parentheses
      const billedBase = billedName.split('(')[0].trim();
      return billedBase === normalizedName || 
             billedName === normalizedName ||
             billedName.startsWith(normalizedName) ||
             normalizedName.startsWith(billedBase);
    });
  };

  // Unique projects for filter (from hours data, which is what the table shows)
  const allHoursProjects = new Set<string>();
  Object.values(monthlyProjectHours).forEach((hoursArr: any[]) => {
    hoursArr.forEach(p => allHoursProjects.add(p.projectName));
  });
  const uniqueProjects = Array.from(allHoursProjects).sort();

  // Calculate project effective rates:
  // Total Revenue = Project Rate × Billed Hours (from financial model)
  // Then distribute among developers proportionally by their logged hours
  // Effective Rate = Total Revenue / Total Logged Hours (real cost per dev hour)
  const projectRatesMap: any[] = [];
  const tableMonthName = months[tableMonthIndex as number] || "N/A";

  // Build from billedRevenueData (which has rate and billed hours per project per month)
  const monthIdx = tableMonthIndex as number;

  billedRevenueData.forEach(billedProj => {
    const projectRate = billedProj.monthlyRate[monthIdx] || 0;
    const billedHours = billedProj.monthlyBilledHours[monthIdx] || 0;
    const totalRevenue = projectRate * billedHours;

    if (totalRevenue === 0 && billedHours === 0) return;

    // Apply project filter (match by base name)
    const billedBase = billedProj.name.split('(')[0].trim();
    if (tableProject !== 'All' && tableProject !== billedBase && tableProject !== billedProj.name) {
      return;
    }

    // Find matching time tracking data for this month
    const hoursData = monthlyProjectHours[monthIdx] || [];
    const matchedHoursProj = hoursData.find((p: any) => {
      const hoursName = p.projectName.toLowerCase().trim();
      const billedName = billedProj.name.toLowerCase().trim();
      const billedBaseLower = billedBase.toLowerCase();
      return hoursName === billedBaseLower ||
             hoursName === billedName ||
             billedName.startsWith(hoursName) ||
             hoursName.startsWith(billedBaseLower);
    });

    // Total logged hours across all devs on this project
    const totalLoggedHours = matchedHoursProj
      ? matchedHoursProj.members.reduce((sum: number, m: any) => sum + m.total, 0)
      : 0;

    // 1. Total Project Revenue
    // (calculated above as totalRevenue = projectRate * billedHours)

    // 2. Base Team Rate (Average cost of 1 project hour across all devs)
    const baseTeamRate = totalLoggedHours > 0 ? totalRevenue / totalLoggedHours : 0;

    if (matchedHoursProj && matchedHoursProj.members.length > 0) {
      matchedHoursProj.members.forEach((member: any) => {
        if (member.total > 0) {
          // 3. Developer Share %
          const memberShare = member.total / totalLoggedHours;
          
          // 4. Effective Rate = Base Team Rate * Developer Share %
          const effectiveRate = baseTeamRate * memberShare;

          projectRatesMap.push({
            projectName: billedProj.name,
            devName: member.name,
            loggedHours: member.total,
            billedHours: billedHours,
            projectRate: projectRate,
            effectiveRate: effectiveRate,
            generatedRevenue: memberShare * totalRevenue,
            totalRevenue: totalRevenue,
          });
        }
      });
    } else {
      // No time tracking data — show project with no devs
      projectRatesMap.push({
        projectName: billedProj.name,
        devName: '—',
        loggedHours: 0,
        billedHours: billedHours,
        projectRate: projectRate,
        effectiveRate: 0,
        generatedRevenue: 0,
        totalRevenue: totalRevenue,
      });
    }
  });

  // Sort by generated revenue descending
  projectRatesMap.sort((a, b) => {
    if (a.projectName !== b.projectName) {
      return a.projectName.localeCompare(b.projectName);
    }
    return b.generatedRevenue - a.generatedRevenue;
  });

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
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Real Rate</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeMembers.map((member, idx) => {
                  const salary = member.monthlySalaries[selectedMonthIndex] || 0;
                  const realRate = salary > 0 ? salary / 160 : 0;
                  const category = getCategory(salary);
                  
                  return (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-sm">{member.name || "Unnamed"}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">${Math.round(salary).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-semibold">${realRate.toFixed(2)}/hr</td>
                    <td className="px-6 py-4">
                      <Badge variant="default" className="font-bold">{category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {salary > 0 ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="warning">On Bench</Badge>
                      )}
                    </td>
                  </tr>
                  );
                })}
                {activeMembers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No active team members for this month</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Project Effective Rates</h2>
            <p className="text-sm text-muted-foreground mt-1">Revenue = Project Rate × Billed Hours for {tableMonthName}</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <select
              value={tableProject}
              onChange={(e) => setTableProject(e.target.value)}
              className="h-10 px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            >
              <option value="All">All Projects</option>
              {uniqueProjects.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <DateFilter 
              selectedMonth={tableMonthIndex} 
              onMonthChange={setTableMonthIndex} 
            />
          </div>
        </div>
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Project</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Developer</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Billed Hrs</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Logged Hrs</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Rate</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Effective Rate</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Generated Rev.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projectRatesMap.length > 0 ? (
                  projectRatesMap.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 font-semibold text-sm">{row.projectName}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{row.devName}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{row.billedHours}h</td>
                      <td className="px-4 py-4 text-sm font-semibold">{Math.round(row.loggedHours * 10) / 10}h</td>
                      <td className="px-4 py-4 text-sm font-medium">${row.projectRate}/hr</td>
                      <td className="px-4 py-4 text-sm text-primary font-bold">
                        ${row.effectiveRate.toFixed(2)}/hr
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-success">
                        ${Math.round(row.generatedRevenue).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No data for the selected filters (rate data available for Feb–Apr only)</td>
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
