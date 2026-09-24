import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SortableHeaderProps {
  label: string;
  field: string;
  currentSortBy: string;
  currentSortOrder: "asc" | "desc";
  onSort: (field: string) => void;
  align?: "left" | "center" | "right";
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  field,
  currentSortBy,
  currentSortOrder,
  onSort,
  align = "left",
}) => {
  const isSorted = currentSortBy === field;

  return (
    <th
      onClick={() => onSort(field)}
      className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-50/70 border-b border-slate-200 cursor-pointer select-none hover:bg-slate-100 transition-colors text-${align}`}
    >
      <div className={`inline-flex items-center gap-1.5 ${align === "center" ? "justify-center" : align === "right" ? "justify-end" : ""}`}>
        <span>{label}</span>
        <span className="text-slate-400">
          {isSorted ? (
            currentSortOrder === "asc" ? (
              <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 text-slate-300 hover:text-slate-500" />
          )}
        </span>
      </div>
    </th>
  );
};
