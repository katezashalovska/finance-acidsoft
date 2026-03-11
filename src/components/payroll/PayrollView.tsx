"use client";

import { Wallet, Users, Banknote, Calendar } from "lucide-react";
import { StatsCard } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { DateFilter } from "@/components/ui/DateFilter";
import { useState } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface PayrollViewProps {
  team: any[];
}

export function PayrollView({ team }: PayrollViewProps) {
  // Use August as default or current month
  const getDefaultMonthIndex = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); 
    const startYear = 2025;
    const startMonth = 4; // May
    let index = (currentYear - startYear) * 12 + (currentMonth - startMonth);
    return Math.max(0, Math.min(index, 11)); // May to April range
  };

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(getDefaultMonthIndex());
  
  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const currentMonthName = months[selectedMonthIndex];

  // Filter members: include if salary is a number (including 0), exclude if null
  const activeMembers = team.filter(member => {
    const salary = member.monthlySalaries[selectedMonthIndex];
    return typeof salary === 'number';
  });
  
  const totalPayroll = activeMembers.reduce((sum, member) => sum + (member.monthlySalaries[selectedMonthIndex] || 0), 0);
  
  const payrollStats = [
    { title: "Total Payroll", value: `$${Math.round(totalPayroll).toLocaleString()}`, icon: Wallet },
    { title: "Total Employees", value: activeMembers.length.toString(), icon: Users },
    { title: "Average Salary", value: activeMembers.length > 0 ? `$${Math.round(totalPayroll / activeMembers.length).toLocaleString()}` : "$0", icon: Banknote },
    { title: "Reporting Month", value: currentMonthName, icon: Calendar },
  ];

  // Calculate monthly payroll trends
  const payrollTrends = months.map((month, idx) => {
    const totalForMonth = team.reduce((sum, member) => sum + (member.monthlySalaries[idx] || 0), 0);
    return {
      month: month,
      amount: Math.round(totalForMonth)
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
          <p className="text-muted-foreground mt-1">Employee salaries and time tracking for {currentMonthName}</p>
        </div>
        <DateFilter 
          selectedMonth={selectedMonthIndex} 
          onMonthChange={setSelectedMonthIndex} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {payrollStats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Payroll Trend Chart */}
      <div className="card-premium p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold">Payroll Trend</h3>
          <p className="text-sm text-muted-foreground">Monthly total payroll expenses ($)</p>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={payrollTrends}>
              <defs>
                <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4D7CFE" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4D7CFE" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFEF" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6F767E' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6F767E' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Payroll']}
              />
              <Area type="monotone" dataKey="amount" stroke="#4D7CFE" strokeWidth={3} fillOpacity={1} fill="url(#colorPayroll)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Employee Details</h2>
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
                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No payroll data for this month</td>
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
