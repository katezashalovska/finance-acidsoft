"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';
import { Badge } from "@/components/ui/Badge";
import { StatsCard } from "@/components/ui/StatsCard";
import { DateFilter } from "@/components/ui/DateFilter";
import { useRouter } from "next/navigation";
import { TrendingUp, Users, Target, CheckCircle, Mail, MousePointerClick, MessageSquare, DollarSign, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SalesData {
  week: string;
  proposals: number;
  viewed: number;
  interview: number;
  hiredUs: number;
  hiredCompetitor: number;
  declined: number;
  connectsSpent: number;
  backConnects: number;
  boostedProposalSpend?: number;
  boostedConnectsRefunded?: number;
  boostedProfileSpend?: number;
  percentOfView: number;
  percentOfInterview: number;
}

interface SalesViewProps {
  salesDataList: {
    name: string;
    data: SalesData[];
  }[];
  initialMonthIndex: number | 'lifetime';
}

export function SalesView({ salesDataList, initialMonthIndex }: SalesViewProps) {
  const [selectedTabPos, setSelectedTabPos] = useState(0);
  const [fullscreenChart, setFullscreenChart] = useState<'funnel' | 'conversions' | null>(null);
  const router = useRouter();

  const handleMonthChange = (idx: number | 'lifetime') => {
    router.push(`/sales?month=${idx}`);
  };

  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const currentMonthName = initialMonthIndex === 'lifetime' ? 'All Time (Lifetime)' : months[initialMonthIndex as number];

  if (!salesDataList || salesDataList.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No sales data available.</div>;
  }

  const currentDataset = salesDataList[selectedTabPos];
  const chartData = currentDataset.data.filter(d => d.proposals > 0 || d.viewed > 0 || d.connectsSpent > 0);

  const totals = chartData.reduce((acc, curr) => {
    acc.proposals += curr.proposals;
    acc.viewed += curr.viewed;
    acc.interview += curr.interview;
    acc.hiredUs += curr.hiredUs;
    acc.connectsSpent += curr.connectsSpent;
    acc.backConnects += curr.backConnects;
    acc.boostedProposalSpend += curr.boostedProposalSpend || 0;
    acc.boostedConnectsRefunded += curr.boostedConnectsRefunded || 0;
    acc.boostedProfileSpend += curr.boostedProfileSpend || 0;
    return acc;
  }, { proposals: 0, viewed: 0, interview: 0, hiredUs: 0, connectsSpent: 0, backConnects: 0, boostedProposalSpend: 0, boostedConnectsRefunded: 0, boostedProfileSpend: 0 });

  // CAC Calculation
  // Fixed monthly costs:
  const CONNECTS_BUDGET_PER_MONTH = 500; // $500/month fixed connects budget
  const SALARY_PER_MONTH = 700;          // $700/month salesperson salary

  const estimatedMonths = initialMonthIndex === 'lifetime'
    ? 4  // Jan, Feb, Mar, Apr
    : 1;

  const connectsCost = CONNECTS_BUDGET_PER_MONTH * estimatedMonths;
  const salaryCost = SALARY_PER_MONTH * estimatedMonths;
  const totalSalesCost = salaryCost + connectsCost;
  const cac = totals.hiredUs > 0 ? totalSalesCost / totals.hiredUs : null;

  const stats = [
    { title: "Total Proposals", value: totals.proposals, icon: Mail },
    { title: "Total Viewed", value: totals.viewed, icon: MousePointerClick },
    { title: "Total Interviews", value: totals.interview, icon: MessageSquare },
    { title: "Total Hires", value: totals.hiredUs, icon: CheckCircle },
  ];

  const netBoostedConnects = totals.boostedProposalSpend + totals.boostedProfileSpend - totals.boostedConnectsRefunded;
  const cacBreakdown = [
    { label: "Salary (salesperson)", value: salaryCost, detail: `$${SALARY_PER_MONTH}/mo × ${estimatedMonths} mo`, color: "#6366f1" },
    { label: "Upwork Connects budget", value: connectsCost, detail: `$${CONNECTS_BUDGET_PER_MONTH}/mo × ${estimatedMonths} mo (fixed)`, color: "#10B981" },
  ];

  const renderFunnelChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          cursor={{ stroke: '#E5E7EB', strokeWidth: 2 }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Line yAxisId="left" type="monotone" dataKey="proposals" name="Proposals" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line yAxisId="left" type="monotone" dataKey="viewed" name="Viewed" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line yAxisId="left" type="monotone" dataKey="interview" name="Interviews" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line yAxisId="left" type="monotone" dataKey="hiredUs" name="Hired" stroke="#0EA5E9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line yAxisId="right" type="monotone" dataKey="connectsSpent" name="Connects" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderConversionsChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `${val}%`} />
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          cursor={{ fill: 'rgba(229, 231, 235, 0.4)' }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar yAxisId="left" dataKey="connectsSpent" name="Connects Spent" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Line yAxisId="right" type="monotone" dataKey="percentOfView" name="% Viewed" stroke="#EC4899" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {fullscreenChart && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 md:p-12 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full h-full max-w-7xl flex flex-col p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {fullscreenChart === 'funnel' ? 'Funnel Performance Over Time' : 'Conversion Rates & Connects'}
                </h2>
              </div>
              <button 
                onClick={() => setFullscreenChart(null)}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 w-full min-h-0">
              {fullscreenChart === 'funnel' ? renderFunnelChart() : renderConversionsChart()}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Reporting</h1>
          <p className="text-muted-foreground mt-1">Lead generation & conversion metrics for {currentMonthName}</p>
        </div>
        <div className="flex items-center gap-4">
          <DateFilter selectedMonth={initialMonthIndex} onMonthChange={handleMonthChange} showLifetime />
          {salesDataList.length > 1 && (
            <select 
              value={selectedTabPos} 
              onChange={(e) => setSelectedTabPos(Number(e.target.value))}
              className="px-4 py-2 bg-white card-premium shadow-sm border border-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {salesDataList.map((list, i) => (
                <option key={i} value={i}>{list.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-premium overflow-hidden p-6 relative">
          <div className="mb-6 pr-10">
            <h2 className="text-xl font-bold">Funnel Performance Over Time</h2>
            <p className="text-sm text-muted-foreground">Proposals vs Views vs Interviews</p>
          </div>
          <button 
            onClick={() => setFullscreenChart('funnel')}
            className="absolute top-6 right-6 p-2 text-muted-foreground hover:bg-gray-100 hover:text-foreground rounded-lg transition-colors border border-border"
          >
            <Maximize2 size={16} />
          </button>
          <div className="h-80 w-full">
            {renderFunnelChart()}
          </div>
        </div>

        <div className="card-premium overflow-hidden p-6 relative">
          <div className="mb-6 pr-10">
            <h2 className="text-xl font-bold">Conversion Rates & Connects</h2>
            <p className="text-sm text-muted-foreground">% Viewed and Connects Spent</p>
          </div>
          <button 
            onClick={() => setFullscreenChart('conversions')}
            className="absolute top-6 right-6 p-2 text-muted-foreground hover:bg-gray-100 hover:text-foreground rounded-lg transition-colors border border-border"
          >
            <Maximize2 size={16} />
          </button>
          <div className="h-80 w-full">
            {renderConversionsChart()}
          </div>
        </div>
      </div>

      <div className="card-premium overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold">Weekly Outline</h2>
          <Badge variant="info">{currentDataset.name}</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Week</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Proposals</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Viewed</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Interviews</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Hired Us</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Connects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {chartData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{row.week}</td>
                  <td className="px-6 py-4 text-center">{row.proposals || 0}</td>
                  <td className="px-6 py-4 text-center text-primary font-medium">{row.viewed || 0} <span className="text-[10px] text-muted-foreground ml-1">({Math.round(row.percentOfView)}%)</span></td>
                  <td className="px-6 py-4 text-center text-amber-600 font-medium">{row.interview || 0} <span className="text-[10px] text-muted-foreground ml-1">({Math.round(row.percentOfInterview)}%)</span></td>
                  <td className="px-6 py-4 text-center text-success font-bold">{row.hiredUs || 0}</td>
                  <td className="px-6 py-4 text-center text-muted-foreground">{row.connectsSpent || 0}</td>
                </tr>
              ))}
              {chartData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No data entries matched.
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
