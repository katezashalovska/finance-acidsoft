"use client";

import { BarChart3, TrendingUp, Percent, Activity, Calendar } from "lucide-react";
import { StatsCard } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';
import { DateFilter } from "@/components/ui/DateFilter";
import { useState } from "react";

interface ProfitabilityViewProps {
  data: any[];
}

export function ProfitabilityView({ data }: ProfitabilityViewProps) {
  const getDefaultMonthIndex = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); 
    const startYear = 2025;
    const startMonth = 4; // May
    let index = (currentYear - startYear) * 12 + (currentMonth - startMonth);
    return Math.max(0, Math.min(index, data.length - 1));
  };

  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | 'lifetime'>(getDefaultMonthIndex());
  
  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const originalMonthName = selectedMonthIndex === 'lifetime' ? 'Lifetime' : months[selectedMonthIndex as number];
  const displayMonthIndex = selectedMonthIndex === 'lifetime' ? 'lifetime' : (selectedMonthIndex as number) + 1;
  const currentMonthName = selectedMonthIndex === 'lifetime' ? 'Lifetime' : (months[displayMonthIndex as number] || "Next Month");

  // Prepare data for charts (always show full year trend)
  const chartData = data.map(item => {
    const rev = item.Revenue || 0;
    const gross = item.GrossProfit || 0;
    const net = item["Net Profit"] || 0;
    
    return {
      month: item.Month,
      grossMargin: rev > 0 ? (gross / rev) * 100 : 0,
      netMargin: rev > 0 ? (net / rev) * 100 : 0,
      profit: net
    };
  });

  // Calculate stats based on selection
  let currentMetrics;
  if (selectedMonthIndex === 'lifetime') {
    const totalRev = data.reduce((sum, item) => sum + (item.Revenue || 0), 0);
    const totalGross = data.reduce((sum, item) => sum + (item.GrossProfit || 0), 0);
    const totalNet = data.reduce((sum, item) => sum + (item["Net Profit"] || 0), 0);
    
    currentMetrics = {
      revenue: totalRev,
      grossProfit: totalGross,
      netProfit: totalNet,
      grossMargin: totalRev > 0 ? (totalGross / totalRev) * 100 : 0,
      netMargin: totalRev > 0 ? (totalNet / totalRev) * 100 : 0
    };
  } else {
    const m = data[displayMonthIndex as number] || {};
    const rev = m.Revenue || 0;
    const gross = m.GrossProfit || 0;
    const net = m["Net Profit"] || 0;
    
    currentMetrics = {
      revenue: rev,
      grossProfit: gross,
      netProfit: net,
      grossMargin: rev > 0 ? (gross / rev) * 100 : 0,
      netMargin: rev > 0 ? (net / rev) * 100 : 0
    };
  }

  const stats = [
    { title: "Net Profit", value: `$${Math.round(currentMetrics.netProfit).toLocaleString()}`, icon: BarChart3 },
    { title: "Net Margin", value: `${currentMetrics.netMargin.toFixed(1)}%`, icon: Percent },
    { title: "Gross Profit", value: `$${Math.round(currentMetrics.grossProfit).toLocaleString()}`, icon: TrendingUp },
    { title: "Gross Margin", value: `${currentMetrics.grossMargin.toFixed(1)}%`, icon: Activity },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profitability Analysis</h1>
          <p className="text-muted-foreground mt-1">Margins and efficiency metrics for {originalMonthName} (showing projections for {currentMonthName})</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Margins Trend Chart */}
      <div className="card-premium p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Margin Trends</h3>
            <p className="text-sm text-muted-foreground">Comparison between Gross and Net profit margins (%)</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-tight">
              <div className="w-3 h-3 bg-primary rounded-full" />
              Net Margin
            </div>
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-tight">
              <div className="w-3 h-3 bg-success rounded-full" />
              Gross Margin
            </div>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFEF" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6F767E' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6F767E' }} />
              <Tooltip formatter={(value: any) => [`${parseFloat(value).toFixed(1)}%`, '']} />
              <Line 
                type="monotone" 
                dataKey="grossMargin" 
                stroke="#27AE60" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#27AE60', strokeWidth: 2, stroke: '#fff' }} 
                name="Gross Margin"
              />
              <Line 
                type="monotone" 
                dataKey="netMargin" 
                stroke="#4D7CFE" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#4D7CFE', strokeWidth: 2, stroke: '#fff' }} 
                name="Net Margin"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Profit Growth Chart */}
      <div className="card-premium p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold">Monthly Profit Growth</h3>
          <p className="text-sm text-muted-foreground">Net profit trend over the financial year ($)</p>
        </div>
        <div className="h-[300px] w-full">
          {(() => {
            const maxProfit = Math.max(...chartData.map(d => d.profit), 0);
            const minProfit = Math.min(...chartData.map(d => d.profit), 0);
            const profitOffset = maxProfit / (maxProfit - minProfit || 1);
            
            return (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset={profitOffset} stopColor="#4D7CFE" stopOpacity={0.3}/>
                      <stop offset={profitOffset} stopColor="#EB5757" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="strokeProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset={profitOffset} stopColor="#4D7CFE" stopOpacity={1}/>
                      <stop offset={profitOffset} stopColor="#EB5757" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFEF" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => [`$${Math.round(value).toLocaleString()}`, 'Net Profit']} />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="url(#strokeProfit)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorProfit)" 
                    baseValue={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
