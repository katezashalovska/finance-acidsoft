"use client";

import { Calendar } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const months = [
  "May 2025", "June 2025", "July 2025", "August 2025", 
  "September 2025", "October 2025", "November 2025", "December 2025",
  "January 2026", "February 2026", "March 2026", "April 2026"
];

interface DateFilterProps {
  selectedMonth: number | 'lifetime';
  onMonthChange: any;
  showLifetime?: boolean;
}

export function DateFilter({ selectedMonth, onMonthChange, showLifetime = false }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
      >
        <Calendar size={18} className="text-muted-foreground" />
        <span>{selectedMonth === 'lifetime' ? "Lifetime" : months[selectedMonth as number]}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-2xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Select Month
            </div>
            <div className="grid grid-cols-1 gap-1 px-2 mt-1 max-h-64 overflow-y-auto">
              {showLifetime && (
                <button
                  onClick={() => {
                    onMonthChange('lifetime');
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    selectedMonth === 'lifetime' 
                      ? "bg-primary text-white font-semibold" 
                      : "hover:bg-gray-100 text-foreground"
                  )}
                >
                  Lifetime
                </button>
              )}
              {months.map((month, idx) => (
                <button
                  key={month}
                  onClick={() => {
                    onMonthChange(idx);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    selectedMonth === idx 
                      ? "bg-primary text-white font-semibold" 
                      : "hover:bg-gray-100 text-foreground"
                  )}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
