"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  LayoutDashboard, 
  Users, 
  Wallet, 
  TrendingUp, 
  Briefcase, 
  PieChart, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Revenue", href: "/revenue", icon: TrendingUp },
  { name: "Payroll", href: "/payroll", icon: Wallet },
  { name: "Operational Expenses", href: "/opex", icon: PieChart },
  { name: "Profitability", href: "/profitability", icon: BarChart3 },
  { name: "Team", href: "/team", icon: Users },
  { name: "Forecast", href: "/forecast", icon: Briefcase },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // User Profile State
  const [avatar, setAvatar] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user-avatar');
    }
    return null;
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatar(base64);
        localStorage.setItem('user-avatar', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white rounded-lg shadow-md border border-border"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border transition-transform duration-300 transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <BarChart3 size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight">FinanceOS</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary shadow-sm" 
                      : "text-muted hover:bg-gray-50 hover:text-foreground"
                  )}
                >
                  <item.icon size={20} className={cn(
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Account Section */}
          <div className="p-4 border-t border-border">
            <div 
              className="group flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer relative"
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              <div className="relative w-10 h-10 shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden border-2 border-white shadow-sm">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    "AS"
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border border-border flex items-center justify-center text-primary shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <BarChart3 size={10} />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">AcidSoft</p>
                <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider font-semibold">Administrator</p>
              </div>

              <input 
                id="avatar-upload"
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleUpload}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
