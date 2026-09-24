import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  color?: "indigo" | "emerald" | "teal" | "amber" | "purple" | "blue";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  color = "emerald",
}) => {
  const colorMap = {
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
      indicator: "bg-indigo-500",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      indicator: "bg-emerald-500",
    },
    teal: {
      bg: "bg-teal-50",
      text: "text-teal-600",
      border: "border-teal-100",
      indicator: "bg-teal-500",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      indicator: "bg-amber-500",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100",
      indicator: "bg-purple-500",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
      indicator: "bg-blue-500",
    },
  };

  const scheme = colorMap[color];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 ${scheme.indicator}`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-2xl ${scheme.bg} ${scheme.text} ${scheme.border} border`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
