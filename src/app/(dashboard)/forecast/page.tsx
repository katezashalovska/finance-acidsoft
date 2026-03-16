"use client";

import { Briefcase, TrendingUp, Target, Calendar } from "lucide-react";
import { StatsCard } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { 
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const forecastStats = [
  { title: "Projected Revenue", value: "$125,400", icon: TrendingUp, trend: { value: 15.2, isPositive: true } },
  { title: "Projected Profit", value: "$42,600", icon: Briefcase, trend: { value: 8.4, isPositive: true } },
  { title: "Confidence Score", value: "88%", icon: Target },
  { title: "Months Remaining", value: "8", icon: Calendar },
];

const forecastData = [
  { name: 'May 26', revenue: 12000, profit: 4500, type: 'Projected' },
  { name: 'Jun 26', revenue: 13500, profit: 5200, type: 'Projected' },
  { name: 'Jul 26', revenue: 15000, profit: 6100, type: 'Projected' },
  { name: 'Aug 26', revenue: 14200, profit: 5800, type: 'Projected' },
  { name: 'Sep 26', revenue: 16800, profit: 7200, type: 'Projected' },
  { name: 'Oct 26', revenue: 18500, profit: 8400, type: 'Projected' },
];

export default function ForecastPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Forecast</h1>
        <p className="text-muted-foreground mt-1">Projections for upcoming months based on current trends and sales pipeline</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {forecastStats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Forecast Chart */}
      <div className="card-premium p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Revenue & Profit Projection</h3>
            <p className="text-sm text-muted-foreground">Estimated growth for the next 6 months ($)</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-tight text-primary">
              <div className="w-3 h-3 bg-primary rounded-full" />
              Revenue
            </div>
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-tight text-success">
              <div className="w-3 h-3 bg-success rounded-full" />
              Net Profit
            </div>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFEF" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6F767E' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6F767E' }}
              />
              <Tooltip 
                cursor={{ fill: '#F8F9FB' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #EFEFEF',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="revenue" fill="#4D7CFE" radius={[4, 4, 0, 0]} barSize={50} opacity={0.8} />
              <Line type="monotone" dataKey="profit" stroke="#27AE60" strokeWidth={3} dot={{ r: 4, fill: '#27AE60' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Assumptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card-premium p-6 space-y-4">
          <h3 className="font-bold">Growth Assumptions</h3>
          <div className="space-y-3">
            {[
              { label: "Pipeline Conversion", value: "24%", trend: "+2%" },
              { label: "Customer Retension", value: "92%", trend: "Stable" },
              { label: "Burn Rate Change", value: "-5%", trend: "Positive" },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{item.value}</span>
                  <Badge variant={item.trend === 'Positive' ? 'success' : 'default'}>{item.trend}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 card-premium p-6">
          <h3 className="font-bold mb-4">Risk Factors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-danger/5 border border-danger/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-danger">High Risk</span>
                <Badge variant="danger">Low confidence</Badge>
              </div>
              <p className="text-sm font-bold">Currency Fluctuation</p>
              <p className="text-xs text-muted-foreground">Impact on offshore development costs</p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-amber-600">Medium Risk</span>
                <Badge variant="warning">Moderate confidence</Badge>
              </div>
              <p className="text-sm font-bold">Market Competition</p>
              <p className="text-xs text-muted-foreground">Potential impact on new acquisition costs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
