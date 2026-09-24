import React, { useState, useEffect } from "react";
import api from "../api/client";
import type { DashboardStats, User, Store } from "../types";
import { StatCard } from "../components/StatCard";
import { SortableHeader } from "../components/SortableHeader";
import { StarRating } from "../components/StarRating";
import {
  Users,
  Store as StoreIcon,
  Star,
  Filter,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Building,
  UserPlus,
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "stores">("users");

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFilters, setUserFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });
  const [userSort, setUserSort] = useState<{ field: string; order: "asc" | "desc" }>({
    field: "createdAt",
    order: "desc",
  });

  // Stores state
  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storeFilters, setStoreFilters] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [storeSort, setStoreSort] = useState<{ field: string; order: "asc" | "desc" }>({
    field: "createdAt",
    order: "desc",
  });

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [storeOwnersList, setStoreOwnersList] = useState<Array<{ id: number; name: string; email: string }>>([]);

  // Form states for Add User
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserAddress, setNewUserAddress] = useState("");
  const [newUserRole, setNewUserRole] = useState<"ADMIN" | "USER" | "STORE_OWNER">("USER");
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addUserSuccess, setAddUserSuccess] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Form states for Add Store
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreEmail, setNewStoreEmail] = useState("");
  const [newStoreAddress, setNewStoreAddress] = useState("");
  const [newStoreOwnerId, setNewStoreOwnerId] = useState<string>("");
  const [addStoreError, setAddStoreError] = useState<string | null>(null);
  const [addStoreSuccess, setAddStoreSuccess] = useState(false);
  const [isAddingStore, setIsAddingStore] = useState(false);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/dashboard-stats");
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params: any = {
        sortBy: userSort.field,
        sortOrder: userSort.order,
      };
      if (userFilters.name) params.name = userFilters.name;
      if (userFilters.email) params.email = userFilters.email;
      if (userFilters.address) params.address = userFilters.address;
      if (userFilters.role) params.role = userFilters.role;

      const res = await api.get("/admin/users", { params });
      if (res.data.success) {
        setUsers(res.data.data.users);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch Stores
  const fetchStores = async () => {
    setStoresLoading(true);
    try {
      const params: any = {
        sortBy: storeSort.field,
        sortOrder: storeSort.order,
      };
      if (storeFilters.name) params.name = storeFilters.name;
      if (storeFilters.email) params.email = storeFilters.email;
      if (storeFilters.address) params.address = storeFilters.address;

      const res = await api.get("/admin/stores", { params });
      if (res.data.success) {
        setStores(res.data.data.stores);
      }
    } catch (err) {
      console.error("Failed to fetch stores", err);
    } finally {
      setStoresLoading(false);
    }
  };

  // Fetch Store Owners for dropdown
  const fetchStoreOwners = async () => {
    try {
      const res = await api.get("/admin/store-owners");
      if (res.data.success) {
        setStoreOwnersList(res.data.data.storeOwners);
      }
    } catch (err) {
      console.error("Failed to fetch store owners list", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else {
      fetchStores();
    }
  }, [activeTab, userSort, storeSort, userFilters, storeFilters]);

  // Handle Sorting
  const handleUserSort = (field: string) => {
    setUserSort((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const handleStoreSort = (field: string) => {
    setStoreSort((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  // Add User Validation
  const isAddUserNameValid = newUserName.trim().length >= 20 && newUserName.trim().length <= 60;
  const isAddUserAddressValid = newUserAddress.trim().length > 0 && newUserAddress.trim().length <= 400;
  const isAddUserPasswordValid =
    newUserPassword.length >= 8 &&
    newUserPassword.length <= 16 &&
    /[A-Z]/.test(newUserPassword) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newUserPassword);
  const isAddUserEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserEmail);
  const isAddUserFormValid = isAddUserNameValid && isAddUserAddressValid && isAddUserPasswordValid && isAddUserEmailValid;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError(null);

    if (!isAddUserFormValid) {
      setAddUserError("Please satisfy all field validation requirements.");
      return;
    }

    setIsAddingUser(true);
    try {
      const res = await api.post("/admin/users", {
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        password: newUserPassword,
        address: newUserAddress.trim(),
        role: newUserRole,
      });

      if (res.data.success) {
        setAddUserSuccess(true);
        setTimeout(() => {
          setAddUserSuccess(false);
          setIsAddUserOpen(false);
          setNewUserName("");
          setNewUserEmail("");
          setNewUserPassword("");
          setNewUserAddress("");
          setNewUserRole("USER");
          fetchStats();
          fetchUsers();
          fetchStoreOwners();
        }, 1200);
      }
    } catch (err: any) {
      setAddUserError(err.response?.data?.message || "Failed to create user");
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStoreError(null);

    if (newStoreName.trim().length < 3 || newStoreName.trim().length > 60) {
      setAddStoreError("Store name must be between 3 and 60 characters.");
      return;
    }
    if (newStoreAddress.trim().length === 0 || newStoreAddress.length > 400) {
      setAddStoreError("Address must not exceed 400 characters.");
      return;
    }

    setIsAddingStore(true);
    try {
      const res = await api.post("/admin/stores", {
        name: newStoreName.trim(),
        email: newStoreEmail.trim().toLowerCase(),
        address: newStoreAddress.trim(),
        ownerId: newStoreOwnerId ? parseInt(newStoreOwnerId, 10) : null,
      });

      if (res.data.success) {
        setAddStoreSuccess(true);
        setTimeout(() => {
          setAddStoreSuccess(false);
          setIsAddStoreOpen(false);
          setNewStoreName("");
          setNewStoreEmail("");
          setNewStoreAddress("");
          setNewStoreOwnerId("");
          fetchStats();
          fetchStores();
        }, 1200);
      }
    } catch (err: any) {
      setAddStoreError(err.response?.data?.message || "Failed to create store");
    } finally {
      setIsAddingStore(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System overview, user administration, and store management
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setAddUserError(null);
              setIsAddUserOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition shadow-md shadow-emerald-600/20"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </button>

          <button
            onClick={() => {
              fetchStoreOwners();
              setAddStoreError(null);
              setIsAddStoreOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-sm"
          >
            <Building className="w-4 h-4 text-emerald-600" />
            Add New Store
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats ? stats.totalUsers : "..."}
          icon={Users}
          color="emerald"
          subtitle={
            stats
              ? `${stats.breakdown.users} Users • ${stats.breakdown.storeOwners} Owners • ${stats.breakdown.admins} Admins`
              : "Loading count..."
          }
        />
        <StatCard
          title="Total Stores"
          value={stats ? stats.totalStores : "..."}
          icon={StoreIcon}
          color="teal"
          subtitle="Registered businesses on platform"
        />
        <StatCard
          title="Submitted Ratings"
          value={stats ? stats.totalRatings : "..."}
          icon={Star}
          color="amber"
          subtitle="1 to 5 star user reviews"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 pt-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("users")}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "users"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users className="w-4 h-4" />
              Users Directory ({users.length})
            </button>

            <button
              onClick={() => setActiveTab("stores")}
              className={`pb-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "stores"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <StoreIcon className="w-4 h-4" />
              Stores Directory ({stores.length})
            </button>
          </div>

          <button
            onClick={() => (activeTab === "users" ? fetchUsers() : fetchStores())}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition"
            title="Refresh Table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="p-6 bg-slate-50/50 border-b border-slate-200/60">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Filter Records
            </span>
          </div>

          {activeTab === "users" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <input
                type="text"
                value={userFilters.name}
                onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
                placeholder="Filter by Name..."
                className="px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
              <input
                type="text"
                value={userFilters.email}
                onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
                placeholder="Filter by Email..."
                className="px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
              <input
                type="text"
                value={userFilters.address}
                onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })}
                placeholder="Filter by Address..."
                className="px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
              <select
                value={userFilters.role}
                onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                className="px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              >
                <option value="">All User Roles</option>
                <option value="ADMIN">System Administrator</option>
                <option value="USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={storeFilters.name}
                onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
                placeholder="Filter by Store Name..."
                className="px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
              <input
                type="text"
                value={storeFilters.email}
                onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
                placeholder="Filter by Store Email..."
                className="px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
              <input
                type="text"
                value={storeFilters.address}
                onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
                placeholder="Filter by Store Address..."
                className="px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
            </div>
          )}
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          {activeTab === "users" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <SortableHeader
                    label="Name"
                    field="name"
                    currentSortBy={userSort.field}
                    currentSortOrder={userSort.order}
                    onSort={handleUserSort}
                  />
                  <SortableHeader
                    label="Email"
                    field="email"
                    currentSortBy={userSort.field}
                    currentSortOrder={userSort.order}
                    onSort={handleUserSort}
                  />
                  <SortableHeader
                    label="Address"
                    field="address"
                    currentSortBy={userSort.field}
                    currentSortOrder={userSort.order}
                    onSort={handleUserSort}
                  />
                  <SortableHeader
                    label="Role"
                    field="role"
                    currentSortBy={userSort.field}
                    currentSortOrder={userSort.order}
                    onSort={handleUserSort}
                  />
                  <SortableHeader
                    label="Store Rating (Store Owner)"
                    field="storeRating"
                    currentSortBy={userSort.field}
                    currentSortOrder={userSort.order}
                    onSort={handleUserSort}
                    align="center"
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                      No users match the selected filters.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-900">
                        {u.name}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{u.email}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs truncate" title={u.address}>
                        {u.address}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        {u.role === "ADMIN" && (
                          <span className="px-2.5 py-1 rounded-full font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            Administrator
                          </span>
                        )}
                        {u.role === "STORE_OWNER" && (
                          <span className="px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Store Owner
                          </span>
                        )}
                        {u.role === "USER" && (
                          <span className="px-2.5 py-1 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Normal User
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs">
                        {u.role === "STORE_OWNER" ? (
                          u.storeRating !== null && u.storeRating !== undefined ? (
                            <div className="inline-flex items-center gap-2">
                              <StarRating rating={u.storeRating} size="sm" />
                              <span className="font-semibold text-slate-800">
                                {u.storeRating.toFixed(2)} ({u.totalRatingsCount})
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No ratings yet</span>
                          )
                        ) : (
                          <span className="text-slate-300 font-light">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <SortableHeader
                    label="Store Name"
                    field="name"
                    currentSortBy={storeSort.field}
                    currentSortOrder={storeSort.order}
                    onSort={handleStoreSort}
                  />
                  <SortableHeader
                    label="Email"
                    field="email"
                    currentSortBy={storeSort.field}
                    currentSortOrder={storeSort.order}
                    onSort={handleStoreSort}
                  />
                  <SortableHeader
                    label="Address"
                    field="address"
                    currentSortBy={storeSort.field}
                    currentSortOrder={storeSort.order}
                    onSort={handleStoreSort}
                  />
                  <SortableHeader
                    label="Store Owner"
                    field="owner"
                    currentSortBy={storeSort.field}
                    currentSortOrder={storeSort.order}
                    onSort={handleStoreSort}
                  />
                  <SortableHeader
                    label="Overall Rating"
                    field="rating"
                    currentSortBy={storeSort.field}
                    currentSortOrder={storeSort.order}
                    onSort={handleStoreSort}
                    align="center"
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {storesLoading ? (
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
                      No stores match the selected filters.
                    </td>
                  </tr>
                ) : (
                  stores.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
                        {s.name}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">{s.email}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs truncate" title={s.address}>
                        {s.address}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-700">
                        {s.owner ? (
                          <div>
                            <span className="font-medium text-slate-900">{s.owner.name}</span>
                            <span className="block text-[11px] text-slate-400">{s.owner.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs">
                        {s.overallRating !== null && s.overallRating !== undefined ? (
                          <div className="inline-flex items-center gap-2">
                            <StarRating rating={s.overallRating} size="sm" />
                            <span className="font-semibold text-slate-800">
                              {Number(s.overallRating).toFixed(1)} ({s.ratingCount})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No ratings</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Add New User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Add New User</h3>
                  <p className="text-xs text-slate-500">Create an Admin, Normal User, or Store Owner</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {addUserError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{addUserError}</span>
                </div>
              )}

              {addUserSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>User created successfully!</span>
                </div>
              )}

              {/* Role Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Account Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                >
                  <option value="USER">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              {/* Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Full Name (20 - 60 chars)
                  </label>
                  <span
                    className={`text-[11px] font-medium ${
                      isAddUserNameValid ? "text-emerald-600" : newUserName.length > 0 ? "text-amber-600" : "text-slate-400"
                    }`}
                  >
                    {newUserName.length}/60 chars {isAddUserNameValid ? "✓" : "(Min 20 required)"}
                  </span>
                </div>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  placeholder="e.g. Jonathan Christopher Miller"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  placeholder="user@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password (8-16 chars, 1 uppercase, 1 special)
                </label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                  placeholder="e.g. UserPass@123"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Must be 8-16 chars with at least 1 uppercase and 1 special symbol.
                </span>
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Address (Max 400 chars)
                  </label>
                  <span className="text-[11px] text-slate-400">{newUserAddress.length}/400</span>
                </div>
                <textarea
                  value={newUserAddress}
                  onChange={(e) => setNewUserAddress(e.target.value)}
                  required
                  rows={2}
                  placeholder="Full physical street address..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isAddUserFormValid || isAddingUser}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAddingUser ? "Creating..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Store */}
      {isAddStoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Add New Store</h3>
                  <p className="text-xs text-slate-500">Register a new store and assign a store owner</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStoreOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="p-6 space-y-4">
              {addStoreError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{addStoreError}</span>
                </div>
              )}

              {addStoreSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Store created successfully!</span>
                </div>
              )}

              {/* Store Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Store Name (Max 60 chars)
                </label>
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  required
                  placeholder="e.g. Apex Tech & Electronics Hub"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Store Official Email
                </label>
                <input
                  type="email"
                  value={newStoreEmail}
                  onChange={(e) => setNewStoreEmail(e.target.value)}
                  required
                  placeholder="store@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Store Address (Max 400 chars)
                  </label>
                  <span className="text-[11px] text-slate-400">{newStoreAddress.length}/400</span>
                </div>
                <textarea
                  value={newStoreAddress}
                  onChange={(e) => setNewStoreAddress(e.target.value)}
                  required
                  rows={2}
                  placeholder="Full physical street address of the store..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition resize-none"
                />
              </div>

              {/* Store Owner Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Assign Store Owner (Optional)
                </label>
                <select
                  value={newStoreOwnerId}
                  onChange={(e) => setNewStoreOwnerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                >
                  <option value="">No owner assigned (Unassigned)</option>
                  {storeOwnersList.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Only accounts with the Store Owner role can be assigned.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStoreOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingStore}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAddingStore ? "Creating..." : "Save Store"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
