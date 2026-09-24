import React, { useState, useEffect } from "react";
import api from "../api/client";
import type { OwnerDashboardData } from "../types";
import { StarRating } from "../components/StarRating";
import { SortableHeader } from "../components/SortableHeader";
import {
  Store as StoreIcon,
  Star,
  Users,
  Search,
  MapPin,
  Mail,
  RefreshCw,
  Calendar,
  AlertCircle,
} from "lucide-react";

export const StoreOwnerDashboard: React.FC = () => {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<{ field: string; order: "asc" | "desc" }>({
    field: "createdAt",
    order: "desc",
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params: any = {
        sortBy: sort.field,
        sortOrder: sort.order,
      };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.get("/stores/owner/dashboard", { params });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load store owner dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, sort]);

  const handleSort = (field: string) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Store Header Banner */}
      {data?.store ? (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-emerald-950/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-md border border-white/10">
                <StoreIcon className="w-3.5 h-3.5" />
                Store Owner Portal
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {data.store.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-200/80 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-300" />
                  <span>{data.store.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-teal-300" />
                  <span>{data.store.email}</span>
                </div>
              </div>
            </div>

            {/* Average Rating Big Badge */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center min-w-[200px] shrink-0">
              <span className="text-xs uppercase font-semibold text-emerald-200 tracking-wider block mb-1">
                Store Average Rating
              </span>
              <div className="text-4xl font-extrabold text-amber-300 flex items-center justify-center gap-2">
                <span>{data.averageRating ? data.averageRating.toFixed(2) : "N/A"}</span>
                <Star className="w-8 h-8 fill-amber-300 text-amber-300" />
              </div>
              <div className="mt-2 flex justify-center">
                <StarRating rating={data.averageRating} size="md" />
              </div>
              <p className="text-[11px] text-emerald-200/90 mt-2 font-medium">
                Based on {data.totalRatings} submitted {data.totalRatings === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 rounded-3xl p-8 border border-amber-200 text-amber-800 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-bold text-amber-900">No Store Assigned Yet</h2>
            <p className="text-sm text-amber-700 mt-1">
              Your account has the Store Owner role, but an administrator has not yet assigned a store to your profile. Please contact your system administrator to register your store.
            </p>
          </div>
        </div>
      )}

      {/* Raters Table Section */}
      {data?.store && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Customer Ratings & Feedback ({data.raters.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                List of registered users who rated your store
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user name or email..."
                  className="pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition w-56"
                />
              </div>

              <button
                onClick={fetchDashboardData}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition"
                title="Refresh Table"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <SortableHeader
                    label="Customer Name"
                    field="name"
                    currentSortBy={sort.field}
                    currentSortOrder={sort.order}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Customer Email"
                    field="email"
                    currentSortBy={sort.field}
                    currentSortOrder={sort.order}
                    onSort={handleSort}
                  />
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-50/70 border-b border-slate-200">
                    Customer Address
                  </th>
                  <SortableHeader
                    label="Rating Given"
                    field="rating"
                    currentSortBy={sort.field}
                    currentSortOrder={sort.order}
                    onSort={handleSort}
                    align="center"
                  />
                  <SortableHeader
                    label="Date Rated"
                    field="createdAt"
                    currentSortBy={sort.field}
                    currentSortOrder={sort.order}
                    onSort={handleSort}
                    align="right"
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                        Loading customer ratings...
                      </div>
                    </td>
                  </tr>
                ) : data.raters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                      {searchQuery
                        ? `No raters match "${searchQuery}".`
                        : "No users have submitted ratings for this store yet."}
                    </td>
                  </tr>
                ) : (
                  data.raters.map((rater) => (
                    <tr key={rater.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                        {rater.user.name}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">{rater.user.email}</td>
                      <td className="px-4 py-4 text-xs text-slate-600 max-w-xs truncate" title={rater.user.address}>
                        {rater.user.address}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <StarRating rating={rater.rating} size="sm" />
                          <span className="text-xs font-bold text-slate-800 px-2 py-0.5 rounded-full bg-slate-100">
                            {rater.rating}/5
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-xs text-slate-500">
                        <div className="flex items-center justify-end gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(rater.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
