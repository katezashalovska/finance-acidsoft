"use client";

import { Settings, User, Bell, Shield, CreditCard, Layout } from "lucide-react";

const sections = [
  { name: "General", icon: Settings, description: "Dashboard preferences and configuration" },
  { name: "Account", icon: User, description: "Manage your profile and authentication" },
  { name: "Notifications", icon: Bell, description: "Configure how you receive alerts" },
  { name: "Security", icon: Shield, description: "Manage password and security settings" },
  { name: "Billing", icon: CreditCard, description: "Manage subscription and payment methods" },
  { name: "Interface", icon: Layout, description: "Customize themes and display options" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your dashboard preferences and account settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div key={section.name} className="card-premium p-6 flex flex-col items-start gap-4 cursor-pointer hover:border-primary/50 group">
            <div className="p-3 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <section.icon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">{section.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-premium p-8 max-w-2xl">
        <h3 className="text-xl font-bold mb-6">Dashboard Preferences</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
            </div>
            <button className="w-12 h-6 bg-gray-200 rounded-full relative transition-colors">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Auto-Refresh</p>
              <p className="text-sm text-muted-foreground">Automatically update data every 5 minutes</p>
            </div>
            <button className="w-12 h-6 bg-primary rounded-full relative transition-colors">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </button>
          </div>
          <div className="pt-6 border-t border-border flex justify-end gap-3">
            <button className="px-4 py-2 text-sm font-semibold text-muted hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button className="px-6 py-2 text-sm font-semibold bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
