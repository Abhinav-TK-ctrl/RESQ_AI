import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  ShieldAlert,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginUser, navigate, addToast, registeredUsers } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDemoAutofill = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    if (role === 'citizen') {
      setEmail('citizen.sarah@resq-ai.org');
      setPassword('CitizenPass2026!');
    } else {
      setEmail('commander.marcus@resq-ai.org');
      setPassword('AuthorityPass2026!');
    }
    addToast(`Autofilled ${role.toUpperCase()} Credentials`, 'Click Sign In to authenticate', 'info');
  };

  const handleEvaluatorAutofill = () => {
    setSelectedRole('citizen');
    setErrorMsg(null);
    setEmail('evaluator@kerala-disaster-resq.gov.in');
    setPassword('EvaluatorPass2026!');
    addToast('Evaluator Credentials Autofilled', 'Click Sign In to login as Evaluator (+917907733921)', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMsg('Please enter both your registered email and account password.');
      addToast('Validation Error', 'Please enter email address and password', 'error');
      return;
    }

    setLoading(true);

    // Call real credential verification logic from AppContext
    const result = loginUser(trimmedEmail, password, selectedRole);

    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Authentication failed. Please verify credentials.');
      addToast('Sign-In Failed', result.error || 'Invalid credentials', 'error');
      return;
    }

    const authenticatedUser = result.user!;
    addToast(
      'Signed In Successfully',
      `Welcome back, ${authenticatedUser.fullName} (${authenticatedUser.role.toUpperCase()})`,
      'success'
    );
    navigate(`/dashboard/${authenticatedUser.role}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
            Sign In to ResQ AI
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Verified authentication & disaster response credential validation.
          </p>
        </div>

        {/* Error Alert Box (if email or password is invalid) */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Role Selector Tabs (Citizen and Authority) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => setSelectedRole('citizen')}
            className={`py-2 rounded-lg transition-all ${
              selectedRole === 'citizen'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Citizen Portal
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('authority')}
            className={`py-2 rounded-lg transition-all ${
              selectedRole === 'authority'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Authority Portal
          </button>
        </div>

        {/* Verified Accounts Autofill / Quick Fill */}
        <div className="p-3 bg-orange-500/5 dark:bg-orange-950/30 border border-orange-500/20 rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-between text-orange-600 dark:text-orange-400 font-semibold text-[11px] font-mono">
            <span>⚡ PRE-REGISTERED VERIFIED ACCOUNTS:</span>
            <span className="text-[10px] text-zinc-400">({registeredUsers.length} active)</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoAutofill('citizen')}
              className="py-1.5 px-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-medium hover:border-orange-500 text-zinc-800 dark:text-zinc-200 text-center transition-colors truncate"
            >
              Sarah (Citizen)
            </button>
            <button
              type="button"
              onClick={() => handleDemoAutofill('authority')}
              className="py-1.5 px-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-medium hover:border-orange-500 text-zinc-800 dark:text-zinc-200 text-center transition-colors truncate"
            >
              Marcus (Gov)
            </button>
            <button
              type="button"
              onClick={handleEvaluatorAutofill}
              className="py-1.5 px-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-[11px] font-bold text-orange-600 dark:text-orange-400 text-center transition-colors truncate hover:bg-orange-500/20"
            >
              Evaluator (+91)
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="registered.user@resq-ai.org"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border rounded-xl text-xs focus:outline-none text-zinc-900 dark:text-zinc-100 ${
                  errorMsg && errorMsg.includes('password')
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-zinc-200 dark:border-zinc-700 focus:border-orange-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Toggle password view"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              <span>Remember this verified workstation</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase font-mono tracking-wider shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>Sign In as {selectedRole.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 text-xs text-zinc-500">
          Need an emergency account?{' '}
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="text-orange-600 dark:text-orange-400 font-semibold hover:underline"
          >
            Register Here with Address
          </button>
        </div>
      </div>
    </div>
  );
};
