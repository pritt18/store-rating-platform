import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { Store, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, UserCheck, Store as StoreIcon } from "lucide-react";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (user.role === "STORE_OWNER") {
        navigate("/owner", { replace: true });
      } else {
        navigate("/user", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        const { token, user } = res.data.data;
        login(token, user);

        // Redirect based on role
        if (user.role === "ADMIN") {
          navigate("/admin");
        } else if (user.role === "STORE_OWNER") {
          navigate("/owner");
        } else {
          navigate("/user");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const quickFill = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-2xl shadow-emerald-950/5">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/25 mb-4 ring-4 ring-emerald-50">
              <Store className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-xs text-slate-500 mt-1">Single sign-on portal for all system roles</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 mb-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider mb-2.5 text-center">
              Quick One-Click Demo Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickFill("admin@storerating.com", "Admin@1234")}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-700 text-[11px] font-medium flex flex-col items-center gap-1 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => quickFill("owner1@storerating.com", "Owner@1234")}
                className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100 text-teal-700 text-[11px] font-medium flex flex-col items-center gap-1 transition"
              >
                <StoreIcon className="w-4 h-4" />
                Store Owner
              </button>
              <button
                type="button"
                onClick={() => quickFill("user1@storerating.com", "User@12345")}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 text-[11px] font-medium flex flex-col items-center gap-1 transition"
              >
                <UserCheck className="w-4 h-4" />
                Normal User
              </button>
            </div>
          </div>

          {/* Registration Link */}
          <div className="mt-6 text-center text-xs text-slate-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
              Create Normal User Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
