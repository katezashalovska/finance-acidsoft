"use client";

import { PieChart, DollarSign, ArrowUpRight, ArrowDownRight, Tag, Calendar } from "lucide-react";
import { StatsCard } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { 
  Cell, 
  Pie, 
  PieChart as RechartsPieChart, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";
import { DateFilter } from "@/components/ui/DateFilter";
import { useState } from "react";

interface OpexViewProps {
  opexData: any[];
}

export function OpexView({ opexData }: OpexViewProps) {
  const getDefaultMonthIndex = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); 
    const startYear = 2025;
    const startMonth = 4; // May
    let index = (currentYear - startYear) * 12 + (currentMonth - startMonth);
    return Math.max(0, Math.min(index, 11));
  };

  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | 'lifetime'>(getDefaultMonthIndex());
  
  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const currentMonthName = selectedMonthIndex === 'lifetime' ? 'Lifetime' : months[selectedMonthIndex];

  // Calculate values for display
  const displayItems = opexData.map(item => {
    const value = selectedMonthIndex === 'lifetime' 
      ? item.monthlyValues.reduce((sum: number, v: number) => sum + v, 0)
      : item.monthlyValues[selectedMonthIndex] || 0;
    
    return {
      name: item.name,
      value: value,
      type: item.name.includes('Upwork') ? 'Comission' : (item.name.includes('OpenAI') || item.name.includes('FlutterFlow') ? 'SaaS' : 'Other')
    };
  }).filter(item => item.value > 0).sort((a, b) => b.value - a.value);

  const totalOpex = displayItems.reduce((sum, item) => sum + item.value, 0);

  // Calculate monthly totals for the trend chart
  const monthlyTrends = months.map((month, idx) => {
    const totalForMonth = opexData.reduce((sum, item) => sum + (item.monthlyValues[idx] || 0), 0);
    return {
      month: month,
      amount: Math.round(totalForMonth)
    };
  });

  const stats = [
    { title: "Total Opex", value: `$${Math.round(totalOpex).toLocaleString()}`, icon: DollarSign },
    { title: "Top Expense", value: displayItems[0]?.name || "N/A", icon: Tag },
    { title: "Reporting Period", value: currentMonthName, icon: Calendar },
  ];

  const COLORS = ["#4D7CFE", "#27AE60", "#F2994A", "#EB5757", "#9B51E0", "#2F80ED", "#56CCF2", "#6FCF97"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operational Expenses</h1>
          <p className="text-muted-foreground mt-1">Detailed breakdown for {currentMonthName}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedMonthIndex('lifetime')}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
              selectedMonthIndex === 'lifetime' 
                ? "bg-primary text-white border-primary shadow-lg" 
                : "bg-white text-muted-foreground border-border hover:bg-gray-50"
            )}
          >
            Lifetime
          </button>
          <DateFilter 
            selectedMonth={selectedMonthIndex === 'lifetime' ? 10 : selectedMonthIndex} 
            onMonthChange={setSelectedMonthIndex} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Monthly Trend Chart */}
      <div className="card-premium p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold">Opex Trend</h3>
          <p className="text-sm text-muted-foreground">Monthly operational expenses over time ($)</p>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrends}>
              <defs>
                <linearGradient id="colorOpex" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EB5757" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#EB5757" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFEF" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6F767E' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6F767E' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                formatter={(value: any) => [`$${Math.round(value).toLocaleString()}`, 'Expenses']}
              />
              <Area type="monotone" dataKey="amount" stroke="#EB5757" strokeWidth={3} fillOpacity={1} fill="url(#colorOpex)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-premium p-6">
          <h3 className="text-lg font-bold mb-6">Expense Distribution</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={displayItems}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {displayItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {displayItems.slice(0, 6).map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs font-medium truncate">{item.name}</span>
                <span className="text-xs text-muted-foreground">${Math.round(item.value).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-premium p-6">
          <h3 className="text-lg font-bold mb-6">Expense Breakdown</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayItems.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#EFEFEF" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#4D7CFE" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card-premium overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-sm">{item.name}</td>
                  <td className="px-6 py-4">
                    <Badge variant="info">{item.type}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">${Math.round(item.value).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant="success">Paid</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
