import React, { useState } from "react";
import { Lock, X, Check, AlertCircle } from "lucide-react";
import api from "../api/client";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Real-time password validation checks
  const hasLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid = hasLength && hasUppercase && hasSpecialChar && passwordsMatch && currentPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasLength || !hasUppercase || !hasSpecialChar) {
      setError("Password must be 8-16 characters, include 1 uppercase letter and 1 special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update password. Please check your current password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">Change Password</h3>
              <p className="text-xs text-slate-500">Update your account login credentials</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <Check className="w-4 h-4" />
              <span>Password updated successfully! Closing...</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Enter current password"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="8-16 characters, 1 uppercase, 1 special char"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          {/* Validation Checklist */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              Password Requirements:
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                hasLength ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
              }`}>
                ✓
              </span>
              <span className={hasLength ? "text-emerald-700 font-medium" : "text-slate-500"}>
                8 to 16 characters ({newPassword.length}/16)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                hasUppercase ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
              }`}>
                ✓
              </span>
              <span className={hasUppercase ? "text-emerald-700 font-medium" : "text-slate-500"}>
                At least one uppercase letter (A-Z)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                hasSpecialChar ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
              }`}>
                ✓
              </span>
              <span className={hasSpecialChar ? "text-emerald-700 font-medium" : "text-slate-500"}>
                At least one special character (!@#$%^&*...)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter new password"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
            {confirmPassword && !passwordsMatch && (
              <span className="text-[11px] text-red-500 mt-1 block">Passwords do not match</span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
