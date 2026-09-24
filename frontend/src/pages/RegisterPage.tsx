import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { User, Mail, Lock, MapPin, AlertCircle, ArrowRight, Store } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
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

  // Strict Validation Rules
  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isAddressValid = address.trim().length > 0 && address.length <= 400;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const pwdLengthValid = password.length >= 8 && password.length <= 16;
  const pwdUpperValid = /[A-Z]/.test(password);
  const pwdSpecialValid = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  const isPasswordValid = pwdLengthValid && pwdUpperValid && pwdSpecialValid;

  const isFormValid = isNameValid && isAddressValid && isEmailValid && isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isNameValid) {
      setError("Full Name must be between 20 and 60 characters.");
      return;
    }
    if (!isAddressValid) {
      setError("Address must be between 1 and 400 characters.");
      return;
    }
    if (!isPasswordValid) {
      setError("Password must be 8-16 characters and include at least 1 uppercase letter and 1 special character.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        password,
      });

      if (res.data.success) {
        const { token, user } = res.data.data;
        login(token, user);
        navigate("/user");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-2xl shadow-emerald-950/5">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/25 mb-4 ring-4 ring-emerald-50">
              <Store className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create User Account</h1>
            <p className="text-xs text-slate-500 mt-1">
              Join RateSphere to discover and rate registered stores
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 mb-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Full Name (20 - 60 chars)
                </label>
                <span
                  className={`text-[11px] font-medium ${
                    isNameValid ? "text-emerald-600 font-semibold" : name.length > 0 ? "text-amber-600" : "text-slate-400"
                  }`}
                >
                  {name.length}/60 chars {isNameValid ? "✓" : "(Min 20 required)"}
                </span>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Jonathan Christopher Miller"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                    name.length > 0
                      ? isNameValid
                        ? "border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-600"
                        : "border-amber-300 focus:ring-amber-500/20 focus:border-amber-500"
                      : "border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600"
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Requirement: Minimum 20 characters, maximum 60 characters.
              </p>
            </div>

            {/* Email */}
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

            {/* Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Address (Max 400 chars)
                </label>
                <span className={`text-[11px] font-medium ${address.length > 400 ? "text-red-500" : "text-slate-400"}`}>
                  {address.length}/400 chars
                </span>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={2}
                  placeholder="Street address, City, State, Postal Code"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition resize-none"
                />
              </div>
            </div>

            {/* Password */}
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
                  placeholder="8-16 chars, 1 uppercase, 1 special"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              {/* Password Requirements Checklist */}
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                      pwdLengthValid ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    ✓
                  </span>
                  <span className={pwdLengthValid ? "text-emerald-700 font-medium" : "text-slate-500"}>
                    8 to 16 characters ({password.length}/16)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                      pwdUpperValid ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    ✓
                  </span>
                  <span className={pwdUpperValid ? "text-emerald-700 font-medium" : "text-slate-500"}>
                    At least one uppercase letter (A-Z)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                      pwdSpecialValid ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    ✓
                  </span>
                  <span className={pwdSpecialValid ? "text-emerald-700 font-medium" : "text-slate-500"}>
                    At least one special character (!@#$%^&*...)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Register Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
