import React, { useState, useEffect } from "react";
import api from "../api/client";
import type { Store } from "../types";
import { StarRating } from "../components/StarRating";
import { SortableHeader } from "../components/SortableHeader";
import {
  Search,
  Store as StoreIcon,
  Star,
  MapPin,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  Edit3,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";

export const UserDashboard: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [sort, setSort] = useState<{ field: string; order: "asc" | "desc" }>({
    field: "name",
    order: "asc",
  });

  // Rating Modal state
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params: any = {
        sortBy: sort.field,
        sortOrder: sort.order,
      };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.get("/stores", { params });
      if (res.data.success) {
        setStores(res.data.data.stores);
      }
    } catch (err) {
      console.error("Failed to load stores", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, sort]);

  const handleSort = (field: string) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const openRatingModal = (store: Store) => {
    setSelectedStore(store);
    setSelectedRating(store.myRating || 5);
    setRatingMessage(null);
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;

    setIsSubmittingRating(true);
    setRatingMessage(null);

    try {
      const res = await api.post(`/stores/${selectedStore.id}/rate`, {
        rating: selectedRating,
      });

      if (res.data.success) {
        setRatingMessage({
          type: "success",
          text: selectedStore.myRating ? "Your rating was updated!" : "Your rating was submitted!",
        });

        // Update local store state
        setStores((prev) =>
          prev.map((s) =>
            s.id === selectedStore.id
              ? {
                  ...s,
                  myRating: selectedRating,
                  overallRating: res.data.data.overallRating,
                  ratingCount: res.data.data.ratingCount,
                }
              : s
          )
        );

        setTimeout(() => {
          setSelectedStore(null);
          setRatingMessage(null);
        }, 1200);
      }
    } catch (err: any) {
      setRatingMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to submit rating",
      });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 1:
        return "1 - Poor";
      case 2:
        return "2 - Fair";
      case 3:
        return "3 - Good";
      case 4:
        return "4 - Very Good";
      case 5:
        return "5 - Outstanding";
      default:
        return `${score} Stars`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Explore Stores & Ratings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse registered businesses, view community reviews, and submit or modify your ratings
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === "table" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <TableIcon className="w-4 h-4" />
            Table View
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === "cards" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Grid View
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores by Name or Physical Address..."
            className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <SortableHeader
                    label="Store Name"
                    field="name"
                    currentSortBy={sort.field}
                    currentSortOrder={sort.order}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Address"
                    field="address"
                    currentSortBy={sort.field}
                    currentSortOrder={sort.order}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Overall Rating"
                    field="overallRating"
                    currentSortBy={sort.field}
                    currentSortOrder={sort.order}
                    onSort={handleSort}
                    align="center"
                  />
                  <SortableHeader
                    label="My Rating"
                    field="myRating"
                    currentSortBy={sort.field}
                    currentSortOrder={sort.order}
                    onSort={handleSort}
                    align="center"
                  />
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-50/70 border-b border-slate-200 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                        Loading stores...
                      </div>
                    </td>
                  </tr>
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                      No stores found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  stores.map((store) => (
                    <tr key={store.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <StoreIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div>{store.name}</div>
                            <span className="text-[11px] text-slate-400 font-normal">{store.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600 max-w-sm truncate" title={store.address}>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{store.address}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {store.overallRating !== null && store.overallRating !== undefined ? (
                          <div className="inline-flex flex-col items-center">
                            <StarRating rating={store.overallRating} size="sm" />
                            <span className="text-xs font-semibold text-slate-800 mt-1">
                              {Number(store.overallRating).toFixed(1)} ({store.ratingCount} reviews)
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No ratings yet</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {store.myRating ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                            <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                            <span>Rated {store.myRating}★</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not rated</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => openRatingModal(store)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                            store.myRating
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                              : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20"
                          }`}
                        >
                          {store.myRating ? (
                            <>
                              <Edit3 className="w-3.5 h-3.5" />
                              Modify Rating
                            </>
                          ) : (
                            <>
                              <Star className="w-3.5 h-3.5" />
                              Submit Rating
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid / Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <StoreIcon className="w-5 h-5" />
                  </div>
                  {store.myRating && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                      Your Rating: {store.myRating}★
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base mt-4">{store.name}</h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{store.address}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{store.email}</span>
                </div>

                {/* Rating Bar */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Overall Rating:</span>
                  {store.overallRating !== null && store.overallRating !== undefined ? (
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={store.overallRating} size="sm" />
                      <span className="text-xs font-semibold text-slate-800">
                        {Number(store.overallRating).toFixed(1)} ({store.ratingCount})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No ratings</span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-2">
                <button
                  onClick={() => openRatingModal(store)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 ${
                    store.myRating
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20"
                  }`}
                >
                  {store.myRating ? (
                    <>
                      <Edit3 className="w-4 h-4" />
                      Modify Rating ({store.myRating}★)
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4" />
                      Submit Rating
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Submission / Modification Modal */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Star className="w-5 h-5 fill-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {selectedStore.myRating ? "Modify Store Rating" : "Submit Store Rating"}
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-[240px]">
                    {selectedStore.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRatingSubmit} className="p-6 space-y-6">
              {ratingMessage && (
                <div
                  className={`flex items-start gap-2.5 p-3 rounded-xl text-xs ${
                    ratingMessage.type === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {ratingMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{ratingMessage.text}</span>
                </div>
              )}

              <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                  Select your rating (1 to 5 Stars)
                </span>

                <div className="flex justify-center mb-3">
                  <StarRating
                    rating={selectedRating}
                    interactive={true}
                    size="lg"
                    onChange={(newVal) => setSelectedRating(newVal)}
                  />
                </div>

                <p className="text-sm font-bold text-emerald-700">
                  {getRatingLabel(selectedRating)}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedStore(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingRating ? "Saving..." : selectedStore.myRating ? "Update Rating" : "Submit Rating"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
