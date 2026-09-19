import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldAlert,
  Send,
  Navigation,
  Activity,
  UserCheck,
} from 'lucide-react';
import { formatDate } from '../lib/utils';

export const VolunteerDashboardView: React.FC = () => {
  const { incidents, volunteers, addToast, navigate } = useApp();
  const [dutyStatus, setDutyStatus] = useState<'available' | 'deployed' | 'resting' | 'off_duty'>('deployed');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Capt. Athira Nair (Boat Rescue)', time: '12:08', text: 'ODR Boat Fleet 3 stationed at Kuttanad Champakulam polder. Need 2 medical responders for elderly triage.' },
    { sender: 'Arjun Nair (Medical Lead)', time: '12:10', text: 'Copy Athira. Wayanad medical base camp dispatching paramedic team with anti-snake venom and oxygen kits.' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const currentVolunteer = volunteers[0] || {
    name: 'Arjun Nair',
    roleTitle: 'Emergency Physician / Triage Lead',
    totalMissionsCompleted: 42,
    verificationLevel: 'Medical Specialist',
    badgeCount: 18,
  };
  const assignedIncident = incidents[0]; // Chooralmala Landslide
  const unassignedIncidents = incidents.filter((i) => i.status === 'unverified' || i.status === 'verified');

  const handleStatusChange = (newStatus: typeof dutyStatus) => {
    setDutyStatus(newStatus);
    addToast('Duty Status Updated', `You are now marked as ${newStatus.toUpperCase()}`, 'info');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: currentVolunteer.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: inputMsg,
      },
    ]);
    setInputMsg('');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>KSDMA VOLUNTEER RESPONDER NETWORK • CERTIFIED SPECIALIST</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Welcome back, {currentVolunteer.name}
          </h1>
          <p className="text-xs text-stone-400 font-sans">
            Role: {currentVolunteer.roleTitle} • Wayanad & North Kerala Sector Base
          </p>
        </div>

        {/* Duty Status Selector Pills */}
        <div className="p-1.5 rounded-xl bg-stone-800 border border-stone-700 flex items-center gap-1">
          <button
            onClick={() => handleStatusChange('available')}
            className={`px-3 py-2 rounded-lg text-xs font-serif font-bold transition-all ${
              dutyStatus === 'available'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            AVAILABLE
          </button>
          <button
            onClick={() => handleStatusChange('deployed')}
            className={`px-3 py-2 rounded-lg text-xs font-serif font-bold transition-all ${
              dutyStatus === 'deployed'
                ? 'bg-red-600 text-white shadow'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            DEPLOYED
          </button>
          <button
            onClick={() => handleStatusChange('resting')}
            className={`px-3 py-2 rounded-lg text-xs font-serif font-bold transition-all ${
              dutyStatus === 'resting'
                ? 'bg-amber-600 text-white shadow'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            RESTING
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 shadow-sm">
          <div className="text-xs font-mono text-stone-500 uppercase font-bold">Missions Completed</div>
          <p className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
            {currentVolunteer.totalMissionsCompleted}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 shadow-sm">
          <div className="text-xs font-mono text-stone-500 uppercase font-bold">Verification Level</div>
          <p className="text-sm font-serif font-bold text-red-600 dark:text-red-400 mt-2">
            {currentVolunteer.verificationLevel}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 shadow-sm">
          <div className="text-xs font-mono text-stone-500 uppercase font-bold">ResQ Badges</div>
          <p className="text-2xl font-serif font-bold text-amber-600 dark:text-amber-400 mt-1">
            🏅 {currentVolunteer.badgeCount} Badges
          </p>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 shadow-sm">
          <div className="text-xs font-mono text-stone-500 uppercase font-bold">Active Dispatch</div>
          <p className="text-xs font-serif font-bold text-red-600 dark:text-red-400 mt-2 truncate">
            {assignedIncident ? assignedIncident.title : 'None Assigned'}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Current Assigned Mission & Claimable Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Mission Card */}
          {assignedIncident && (
            <div className="p-6 rounded-2xl bg-stone-50 dark:bg-[#121215] border-2 border-red-600/50 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-mono font-bold uppercase border border-red-500/30">
                  ACTIVE KERALA RESCUE MISSION
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  {formatDate(assignedIncident.timestamp)}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  {assignedIncident.title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                  {assignedIncident.description}
                </p>
              </div>

              <div className="p-3 bg-stone-100 dark:bg-zinc-800/80 rounded-xl border border-stone-300 dark:border-zinc-700/60 flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span className="font-semibold">{assignedIncident.location.address}</span>
                </div>
                <button
                  onClick={() => navigate('/map')}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-serif font-bold flex items-center gap-1 shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>GPS Directions</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => addToast('Mission Status Updated to On-Site', 'KSDMA DEOC notified', 'success')}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-serif font-bold rounded-xl shadow"
                >
                  Confirm Arrival On-Site
                </button>
                <button
                  onClick={() => addToast('Requested Medical Reinforcements', 'KSDMA Command alerted', 'warning')}
                  className="px-4 py-2 bg-stone-800 text-stone-100 text-xs font-serif font-bold rounded-xl hover:bg-stone-700"
                >
                  Request Medical Backup
                </button>
              </div>
            </div>
          )}

          {/* Unassigned Incidents Needing Help */}
          <div className="p-6 rounded-2xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-500" />
              <span>Unassigned Kerala Incidents Seeking Rescuers</span>
            </h3>

            <div className="space-y-3">
              {unassignedIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 rounded-xl bg-white dark:bg-zinc-900/60 border border-stone-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                        {inc.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-bold border border-red-500/30 uppercase">
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 font-sans">{inc.location.address}</p>
                  </div>

                  <button
                    onClick={() =>
                      addToast('Volunteer Mission Claimed', `Assigned to ${inc.title}`, 'success')
                    }
                    className="px-3.5 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-serif font-bold text-xs shrink-0 hover:bg-stone-800"
                  >
                    Claim Mission
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Squad Radio Chat */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-4 shadow-sm flex flex-col h-[480px]">
            <div className="flex items-center justify-between border-b border-stone-300 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-red-600 dark:text-red-400" />
                <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                  KSDMA Rescuer Radio Relay
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                SECURE FREQUENCY
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 p-2">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white dark:bg-zinc-900/80 border border-stone-200 dark:border-zinc-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-stone-500">
                    <span className="font-bold text-red-600 dark:text-red-400">{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="text-stone-800 dark:text-stone-200 leading-relaxed font-sans">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-stone-300 dark:border-zinc-800">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Broadcast radio message..."
                className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-red-500 font-sans"
              />
              <button
                type="submit"
                className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-500 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
