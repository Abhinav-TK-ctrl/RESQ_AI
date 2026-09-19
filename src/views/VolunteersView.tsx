import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Award, MapPin, CheckCircle, Phone, Search, ShieldCheck } from 'lucide-react';

export const VolunteersView: React.FC = () => {
  const { volunteers, incidents, dispatchRescueSquad, addToast } = useApp();
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [assignTargetVol, setAssignTargetVol] = useState<typeof volunteers[0] | null>(null);

  const filteredVolunteers = volunteers.filter(
    (v) => skillFilter === 'all' || v.skills.some((sk) => sk.toLowerCase().includes(skillFilter.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
              Volunteer Mobilization Roster
            </h1>
            <p className="text-xs text-zinc-500">
              Certified rescue specialists, trauma doctors, and emergency coordinators ready for dispatch.
            </p>
          </div>
        </div>

        {/* Skill Filter Buttons */}
        <div className="flex flex-wrap gap-2 text-xs font-medium pt-2">
          <button
            onClick={() => setSkillFilter('all')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              skillFilter === 'all'
                ? 'bg-blue-500/10 border-blue-500 text-blue-500 font-bold'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
            }`}
          >
            All Volunteers ({volunteers.length})
          </button>
          <button
            onClick={() => setSkillFilter('water')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              skillFilter === 'water'
                ? 'bg-blue-500/10 border-blue-500 text-blue-500 font-bold'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
            }`}
          >
            Swift Water Rescue
          </button>
          <button
            onClick={() => setSkillFilter('trauma')}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              skillFilter === 'trauma'
                ? 'bg-blue-500/10 border-blue-500 text-blue-500 font-bold'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
            }`}
          >
            Trauma Medical
          </button>
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredVolunteers.map((vol) => (
          <div
            key={vol.id}
            className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <img
                src={vol.avatar}
                alt={vol.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-zinc-200 dark:border-zinc-700 shrink-0"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span>{vol.name}</span>
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      vol.status === 'deployed'
                        ? 'bg-orange-500/10 text-orange-500 border border-orange-500/30'
                        : vol.status === 'available'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                        : 'bg-zinc-500/10 text-zinc-400'
                    }`}
                  >
                    {vol.status}
                  </span>
                </div>
                <p className="text-xs text-blue-500 font-medium">{vol.roleTitle}</p>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {vol.location.sector} • {vol.totalMissionsCompleted} Missions Completed
                </p>
              </div>
            </div>

            {/* Skills Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {vol.skills.map((sk) => (
                <span
                  key={sk}
                  className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700"
                >
                  {sk}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 font-mono">{vol.phone}</span>
              <button
                onClick={() => setAssignTargetVol(vol)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow"
              >
                Assign Task
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Modal */}
      {assignTargetVol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full text-zinc-100 space-y-4">
            <h3 className="font-bold text-base">Assign Incident Mission to {assignTargetVol.name}</h3>
            <p className="text-xs text-zinc-400">Select target incident for direct squad deployment:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {incidents
                .filter((i) => i.status !== 'resolved')
                .map((i) => (
                  <button
                    key={i.id}
                    onClick={() => {
                      dispatchRescueSquad(i.id, assignTargetVol.id);
                      setAssignTargetVol(null);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-700 space-y-1 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold">{i.title}</p>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
                        {i.category}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-[10px]">{i.location.address} ({i.location.sector})</p>
                    {i.assignedVolunteer && (
                      <p className="text-blue-400 text-[10px]">Currently Assigned: {i.assignedVolunteer.name}</p>
                    )}
                  </button>
                ))}
            </div>
            <button
              onClick={() => setAssignTargetVol(null)}
              className="w-full py-2.5 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
