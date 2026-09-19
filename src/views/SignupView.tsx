import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  ShieldAlert,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

export const SignupView: React.FC = () => {
  const { navigate, addToast, registerUser } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Wayanad');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const keralaDistricts = [
    'Wayanad',
    'Idukki',
    'Ernakulam',
    'Thrissur',
    'Alappuzha',
    'Kozhikode',
    'Malappuram',
    'Palakkad',
    'Kottayam',
    'Pathanamthitta',
    'Kannur',
    'Kasaragod',
    'Kollam',
    'Thiruvananthapuram',
  ];

  // Auto-detect district if typed in address
  const handleAddressChange = (val: string) => {
    setAddress(val);
    const lower = val.toLowerCase();
    for (const d of keralaDistricts) {
      if (lower.includes(d.toLowerCase())) {
        setDistrict(d);
        break;
      }
    }
  };

  const autofillEvaluator = () => {
    setFullName('Verified Field Evaluator');
    setEmail('evaluator@kerala-disaster-resq.gov.in');
    setPhone('+917907733921');
    setAddress('Chooralmala Road, Meppadi, Wayanad District, Kerala - 673577');
    setDistrict('Wayanad');
    setPassword('EvaluatorPass2026!');
    setConfirmPassword('EvaluatorPass2026!');
    addToast('Evaluator Profile Loaded', 'Pre-filled with +917907733921 in Wayanad (10km zone)', 'info');
  };

  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim() || !password) {
      setErrorMsg('Please complete all required fields including your full residential address.');
      addToast('Validation Required', 'Please complete all required fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password entry.');
      addToast('Password Mismatch', 'The passwords entered do not match. Please re-type.', 'error');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      addToast('Weak Password', 'Password must be at least 6 characters.', 'warning');
      return;
    }

    setSubmitting(true);
    const result = registerUser({
      fullName,
      email,
      phone,
      address,
      district,
      password,
      role: selectedRole,
    });

    setSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to create account.');
      addToast('Registration Error', result.error || 'Unable to register', 'error');
      return;
    }

    addToast(
      'Account Created Successfully',
      `Verification code sent to ${email}. Redirecting...`,
      'success'
    );
    navigate('/email-verification');
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
            Create Emergency Account
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Register your profile with ResQ AI disaster intelligence & verified dispatch network.
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Role Type Selector (Citizen or Authority) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Account Operating Role
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelectedRole('citizen')}
              className={`p-3.5 rounded-2xl border text-left space-y-1 transition-all ${
                selectedRole === 'citizen'
                  ? 'border-orange-500 bg-orange-500/10 text-zinc-900 dark:text-zinc-100 font-bold shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                <span className="font-semibold">Citizen Portal</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-normal">
                Emergency SOS, Family Check-In, Shelter Booking & Local Alerts
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('authority')}
              className={`p-3.5 rounded-2xl border text-left space-y-1 transition-all ${
                selectedRole === 'authority'
                  ? 'border-orange-500 bg-orange-500/10 text-zinc-900 dark:text-zinc-100 font-bold shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span className="font-semibold">Authority / DEOC</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-normal">
                Disaster Command, High-Level Dispatch, Incident Verification & Broadcasts
              </p>
            </button>
          </div>
        </div>

        {/* Evaluator Quick Testing Pill */}
        <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="text-xs">
            <span className="font-semibold text-orange-600 dark:text-orange-400 block sm:inline">
              Testing Evaluator SMS Dispatch?
            </span>{' '}
            <span className="text-zinc-600 dark:text-zinc-400">
              Auto-fills verified phone (+917907733921) located in Wayanad (10km zone).
            </span>
          </div>
          <button
            type="button"
            onClick={autofillEvaluator}
            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-sm shrink-0"
          >
            Auto-Fill Evaluator Details
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Abhinav K. / Dr. Sarah Jenkins"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Contact Phone Number (For Emergency SMS)
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98470 12345 or +917907733921"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Email Address (Account Login Identifier)
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="youremail@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Kerala District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-zinc-100"
              >
                {keralaDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address Column (Physical Location for Geofence matching) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>Full Residential / Physical Address</span>
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">Mapped to PostGIS coordinates for 10km SMS alert</span>
            </div>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="Enter complete address: House / Flat No., Street, Locality / Village, District, PIN Code (e.g. Chooralmala Road, Meppadi, Wayanad District, Kerala - 673577)"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 leading-relaxed"
            />
          </div>

          {/* Password and Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-9 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border rounded-xl text-xs focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-red-500 focus:border-red-500'
                      : confirmPassword && confirmPassword === password
                      ? 'border-emerald-500 focus:border-emerald-500'
                      : 'border-zinc-200 dark:border-zinc-700 focus:border-orange-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Password Validation & Strength Feedback */}
          {password.length > 0 && (
            <div className="space-y-1 pt-0.5">
              <div className="flex gap-1 h-1">
                <div className={`flex-1 rounded ${strength >= 1 ? 'bg-red-500' : 'bg-zinc-700'}`}></div>
                <div className={`flex-1 rounded ${strength >= 2 ? 'bg-amber-500' : 'bg-zinc-700'}`}></div>
                <div className={`flex-1 rounded ${strength >= 3 ? 'bg-blue-500' : 'bg-zinc-700'}`}></div>
                <div className={`flex-1 rounded ${strength >= 4 ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>
                  {confirmPassword && confirmPassword === password ? (
                    <span className="text-emerald-500 font-bold">✓ Passwords Match</span>
                  ) : confirmPassword && confirmPassword !== password ? (
                    <span className="text-red-500 font-bold">✗ Passwords Do Not Match</span>
                  ) : (
                    'Enter identical confirm password'
                  )}
                </span>
                <span>
                  Security Rating: {strength === 4 ? 'Strong' : strength >= 2 ? 'Moderate' : 'Basic'}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase font-mono tracking-wider shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{submitting ? 'Creating Account...' : 'Register & Proceed to Verification'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500">
          Already registered an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-orange-600 dark:text-orange-400 font-semibold hover:underline"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};
