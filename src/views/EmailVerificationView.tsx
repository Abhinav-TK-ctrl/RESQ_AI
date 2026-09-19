import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MailCheck, ArrowRight, RotateCw, CheckCircle2 } from 'lucide-react';

export const EmailVerificationView: React.FC = () => {
  const { navigate, addToast, currentRole, pendingVerificationEmail, currentUser, verifyUserEmail } =
    useApp();
  const [code, setCode] = useState(['8', '0', '9', '2', '', '']);
  const [verifying, setVerifying] = useState(false);

  const displayEmail =
    pendingVerificationEmail || currentUser?.email || 'registered.user@resq-ai.org';

  const handleChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...code];
    updated[index] = val;
    setCode(updated);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);

    const enteredCode = code.join('');
    if (enteredCode.length < 4) {
      addToast('Incomplete Code', 'Please enter the verification code', 'warning');
      setVerifying(false);
      return;
    }

    verifyUserEmail(displayEmail);
    setVerifying(false);
    addToast(
      'Account Verified & Activated',
      `Welcome to ResQ AI. Your address & responder profile are active.`,
      'success'
    );
    navigate(`/dashboard/${currentRole}`);
  };

  const handleResend = () => {
    addToast(
      'Verification Code Resent',
      `New 6-digit verification code dispatched to ${displayEmail}`,
      'info'
    );
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
          <MailCheck className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
            Verify Email Address
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            A 6-digit emergency verification code has been dispatched to:
          </p>
          <p className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 py-1 px-3 rounded-lg inline-block">
            {displayEmail}
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-2">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                className="w-11 h-12 text-center text-lg font-mono font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:border-orange-500 focus:outline-none text-zinc-900 dark:text-zinc-100"
              />
            ))}
          </div>

          <div className="text-[11px] text-zinc-500">
            Verification code preview: <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">809244</span>
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase font-mono tracking-wider shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{verifying ? 'Activating Profile...' : 'Complete Verification & Enter Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 flex items-center justify-between text-xs text-zinc-500">
          <span>Didn't receive code?</span>
          <button
            type="button"
            onClick={handleResend}
            className="text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1"
          >
            <RotateCw className="w-3 h-3" />
            <span>Resend Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};
