import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { ShieldAlert, User, Mail, Lock, Phone, MapPin, Check, ArrowRight, Award, ShieldCheck } from 'lucide-react';

export const SignupView: React.FC = () => {
  const { navigate, addToast, setRole } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('volunteer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [sector, setSector] = useState('Sector 2 Central');
  const [skills, setSkills] = useState<string[]>(['First Aid', 'Radio Ops']);

  const availableSkills = [
    'Trauma Medical',
    'Swift Water Rescue',
    'Heavy Machinery',
    'Drone Pilot',
    'Ham Radio',
    'Boat Navigation',
    'Crowd Mgmt',
    'Supply Logistics',
  ];

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
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
    if (!fullName || !email || !password) {
      addToast('Validation Required', 'Please complete all required fields', 'error');
      return;
    }

    setRole(selectedRole);
    addToast('Account Created Successfully', 'Redirecting to email verification...', 'success');
    navigate('/email-verification');
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
            Create Emergency Account
          </h1>
          <p className="text-xs text-zinc-500">
            Join the national disaster response & intelligence network.
          </p>
        </div>

        {/* Role Type */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Account Operating Role
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelectedRole('citizen')}
              className={`p-3 rounded-2xl border text-left space-y-1 transition-all ${
                selectedRole === 'citizen'
                  ? 'border-orange-500 bg-orange-500/10 text-zinc-900 dark:text-zinc-100 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <User className="w-4 h-4 text-orange-500" />
              <div className="font-semibold">Citizen</div>
              <p className="text-[10px] text-zinc-500 font-normal">SOS & Local Alerts</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('volunteer')}
              className={`p-3 rounded-2xl border text-left space-y-1 transition-all ${
                selectedRole === 'volunteer'
                  ? 'border-orange-500 bg-orange-500/10 text-zinc-900 dark:text-zinc-100 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Award className="w-4 h-4 text-blue-500" />
              <div className="font-semibold">Volunteer</div>
              <p className="text-[10px] text-zinc-500 font-normal">Rescue & Logistics</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('authority')}
              className={`p-3 rounded-2xl border text-left space-y-1 transition-all ${
                selectedRole === 'authority'
                  ? 'border-orange-500 bg-orange-500/10 text-zinc-900 dark:text-zinc-100 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <div className="font-semibold">Authority</div>
              <p className="text-[10px] text-zinc-500 font-normal">High-Command Dispatch</p>
            </button>
          </div>
        </div>

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
                placeholder="Dr. Aris Thorne"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Emergency Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2831"
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="verified.responder@resq-ai.org"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Sector Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Primary Response Sector / Region
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-zinc-100"
            >
              <option value="Sector 1 West">Sector 1 West (Residential & Coast)</option>
              <option value="Sector 2 Central">Sector 2 Central (Commercial & Command)</option>
              <option value="Sector 3 South">Sector 3 South (Industrial & River)</option>
              <option value="Sector 4 North">Sector 4 North (Riverside & Flood Basin)</option>
            </select>
          </div>

          {/* Skills Matrix for Volunteers */}
          {selectedRole === 'volunteer' && (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Certified Rescue Skills (Select All That Apply)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableSkills.map((sk) => {
                  const active = skills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleSkill(sk)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/40 font-bold'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {active ? `✓ ${sk}` : sk}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Password & Strength Meter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Set Security Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500"
            />
            {password.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex gap-1 h-1">
                  <div className={`flex-1 rounded ${strength >= 1 ? 'bg-red-500' : 'bg-zinc-700'}`}></div>
                  <div className={`flex-1 rounded ${strength >= 2 ? 'bg-amber-500' : 'bg-zinc-700'}`}></div>
                  <div className={`flex-1 rounded ${strength >= 3 ? 'bg-blue-500' : 'bg-zinc-700'}`}></div>
                  <div className={`flex-1 rounded ${strength >= 4 ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                </div>
                <p className="text-[10px] text-zinc-400 text-right font-mono">
                  Security Rating: {strength === 4 ? 'Very Strong' : strength >= 2 ? 'Moderate' : 'Weak'}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase font-mono tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Email Verification</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500">
          Already registered?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-orange-600 dark:text-orange-400 font-semibold hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
