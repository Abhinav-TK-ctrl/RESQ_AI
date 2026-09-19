import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export const ResetPasswordView: React.FC = () => {
  const { navigate, addToast, resetUserPassword, pendingVerificationEmail, currentUser } = useApp();
  const [email, setEmail] = useState(pendingVerificationEmail || currentUser?.email || 'citizen.sarah@resq-ai.org');
  const [token, setToken] = useState('RESQ-9081');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your account email.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      addToast('Password Mismatch', 'New password and confirmation must be identical', 'error');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      addToast('Short Password', 'Password must have 6+ characters', 'warning');
      return;
    }

    const res = resetUserPassword(email, newPassword);
    if (!res.success) {
      setErrorMsg(res.error || 'Password update failed.');
      addToast('Reset Failed', res.error, 'error');
      return;
    }

    addToast('Password Updated Successfully', 'You can now sign in with your new password', 'success');
    navigate('/login');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
            Set New Password
          </h1>
          <p className="text-xs text-zinc-500">
            Create a secure, verified password for your ResQ AI account.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Account Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="registered@email.com"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Recovery Token
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-orange-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type={show ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Toggle password view"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Confirm New Password
            </label>
            <input
              type={show ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase font-mono tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Update Password & Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-zinc-500 hover:text-zinc-200"
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
