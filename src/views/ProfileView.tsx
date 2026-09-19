import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  HeartPulse,
  Phone,
  MapPin,
  QrCode,
  User,
  Mail,
  Home,
  Save,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentRole, currentUser, updateUserProfile, addToast } = useApp();

  const [fullName, setFullName] = useState(currentUser?.fullName || 'Sarah Jenkins');
  const [email] = useState(currentUser?.email || 'citizen.sarah@resq-ai.org');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 94471 23456');
  const [address, setAddress] = useState(
    currentUser?.address || 'House 14/B, River View Road, Meppadi, Wayanad, Kerala - 673577'
  );

  const [bloodType, setBloodType] = useState('O Positive (O+)');
  const [allergies, setAllergies] = useState('Penicillin, Peanuts');
  const [conditions, setConditions] = useState('Asthma (Requires Inhaler)');
  const [contactName, setContactName] = useState('Elena Thorne (Spouse)');
  const [contactPhone, setContactPhone] = useState('+91 94470 54321');

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName);
      setPhone(currentUser.phone);
      setAddress(currentUser.address);
    }
  }, [currentUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      fullName,
      phone,
      address,
    });
    addToast('Profile & Address Updated', 'Your responder identity and address have been saved', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Card Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
              {currentRole.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {fullName}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED RESPONDER
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono">
                Role: <strong className="capitalize text-zinc-700 dark:text-zinc-300">{currentRole}</strong> • {email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => addToast('Medical ID Exported', 'Digital Emergency Pass generated', 'info')}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-zinc-800 text-xs font-bold font-mono flex items-center gap-2 border border-zinc-700 transition-colors"
          >
            <QrCode className="w-4 h-4 text-orange-400" />
            <span>Emergency QR Pass</span>
          </button>
        </div>
      </div>

      {/* Profile & Medical ID Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Physical Address Column */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-orange-500">
            <Home className="w-5 h-5" />
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Personal Identity & Physical Address
            </h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>Full Legal Name</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>Registered Email (Verified ID)</span>
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-500 font-mono cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>Primary Emergency Contact Number</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Address Column */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>Registered Address (Shelter & Geofence Perimeter)</span>
              </label>
              <textarea
                rows={3}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete residential address: House / Flat No, Street, Locality, Ward, District, PIN Code"
                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs leading-relaxed text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500 placeholder:text-zinc-400"
              />
            </div>
          </div>
        </div>

        {/* Medical ID & Emergency Contact Column */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-500">
              <HeartPulse className="w-5 h-5" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Medical Vitals & Emergency Next of Kin
              </h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Blood Group / Type
                </label>
                <input
                  type="text"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Known Severe Allergies
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Next of Kin Name & Relationship
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Emergency Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase font-mono tracking-wider rounded-xl shadow transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Address Details</span>
          </button>
        </div>
      </form>
    </div>
  );
};
