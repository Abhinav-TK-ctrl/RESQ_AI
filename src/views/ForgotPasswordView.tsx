import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordView: React.FC = () => {
  const { navigate, addToast } = useApp();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    addToast('Password Reset Email Sent', `Sent instructions to ${email}`, 'info');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
            Reset Password
          </h1>
          <p className="text-xs text-zinc-500">
            Enter your emergency account email to receive a secure recovery token.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.gov"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase font-mono tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Send Recovery Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-3 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-sm text-emerald-400">Recovery Instructions Dispatched</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We sent a password reset token to <strong className="text-zinc-200">{email}</strong>. Check your inbox or click below to simulate token input.
            </p>
            <button
              onClick={() => navigate('/reset-password')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
            >
              Enter Token & Reset Password →
            </button>
          </div>
        )}

        <div className="text-center pt-2 text-xs">
          <button
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
