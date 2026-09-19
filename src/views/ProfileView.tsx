import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, ShieldCheck, HeartPulse, Phone, MapPin, Award, QrCode, Download, Edit3 } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentRole, addToast } = useApp();
  const [bloodType, setBloodType] = useState('O Positive (O+)');
  const [allergies, setAllergies] = useState('Penicillin, Peanuts');
  const [conditions, setConditions] = useState('Asthma (Requires Inhaler)');
  const [contactName, setContactName] = useState('Elena Thorne (Spouse)');
  const [contactPhone, setContactPhone] = useState('+1 (555) 890-1122');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Emergency Medical ID Updated', 'Synchronized with ResQ AI encrypted local profile', 'success');
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
                  ResQ Emergency ID Card
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED RESPONDER
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono">
                Role: <strong className="capitalize text-zinc-300">{currentRole}</strong> • Sector 2 Central
              </p>
            </div>
          </div>

          <button
            onClick={() => addToast('Medical ID Exported', 'Digital Wallet Pass generated', 'info')}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-zinc-800 text-xs font-bold font-mono flex items-center gap-2 border border-zinc-700"
          >
            <QrCode className="w-4 h-4 text-orange-400" />
            <span>Generate Medical QR Pass</span>
          </button>
        </div>
      </div>

      {/* Medical ID Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Medical ID Column */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-red-500">
            <HeartPulse className="w-5 h-5" />
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Emergency Medical ID Metrics
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
                Pre-Existing Conditions & Medications
              </label>
              <textarea
                rows={2}
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Emergency Contacts Column */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-500">
              <Phone className="w-5 h-5" />
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Primary Next of Kin Contact
              </h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Contact Full Name & Relationship
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
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase font-mono tracking-wider rounded-xl shadow transition-colors"
          >
            Save Emergency Medical Profile
          </button>
        </div>
      </form>
    </div>
  );
};
