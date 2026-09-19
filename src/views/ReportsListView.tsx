import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IncidentReport, IncidentSeverity, IncidentCategory } from '../types';
import {
  FileText,
  Search,
  Filter,
  MapPin,
  ThumbsUp,
  Clock,
  Sparkles,
  Radio,
  X,
  Building,
  ShieldAlert,
  Grid,
  List,
  Phone,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  PhoneCall,
  AlertTriangle,
  History,
  CloudRain,
  RefreshCw,
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { AiAnalysisPanel } from '../components/common/AiAnalysisPanel';

export const ReportsListView: React.FC = () => {
  const {
    incidents,
    historicalIncidents,
    activeIncidents,
    currentRole,
    updateIncidentStatus,
    verifyIncident,
    upvoteIncident,
    dispatchRescueSquad,
    addToast,
    navigate,
    refreshImdData,
    imdLoading,
  } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [incidentTimelineFilter, setIncidentTimelineFilter] = useState<'all' | 'live' | 'historical'>('all');
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleUpvote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    upvoteIncident(id);
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident((prev) =>
        prev
          ? {
              ...prev,
              upvotes: (prev.upvotes || 0) + 1,
              urgencyScore: Math.min(100, (prev.urgencyScore || 50) + 1),
            }
          : null
      );
    }
  };

  const handleDispatch = (incidentId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const result = dispatchRescueSquad(incidentId);
    if (result) {
      if (selectedIncident && selectedIncident.id === incidentId) {
        setSelectedIncident((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'dispatching',
            dispatchTeam: `${result.volunteer.name} (${result.volunteer.roleTitle}) - ${result.volunteer.verificationLevel}`,
            assignedVolunteer: {
              id: result.volunteer.id,
              name: result.volunteer.name,
              phone: result.volunteer.phone,
              roleTitle: result.volunteer.roleTitle,
              skills: result.volunteer.skills,
              avatar: result.volunteer.avatar,
              verificationLevel: result.volunteer.verificationLevel,
              sector: result.volunteer.location?.sector || prev.location.sector,
              dispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
              matchReason: result.matchReason,
            },
            notes: [
              ...(prev.notes || []),
              `[DISPATCHED RESCUE LEAD] ${result.volunteer.name} (${result.volunteer.roleTitle}, Tel: ${result.volunteer.phone}) assigned. ${result.matchReason}`,
            ],
          };
        });
      }
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    // If citizen: only show verified incidents OR user's own reports
    if (currentRole === 'citizen') {
      const isOwnReport =
        inc.reporter.name.toLowerCase() === 'you' ||
        inc.reporter.name.toLowerCase().includes('rahul') ||
        inc.reporter.name.toLowerCase().includes('arjun') ||
        inc.isSosBroadcast;
      if (inc.status === 'unverified' && !isOwnReport) {
        return false;
      }
    }

    if (incidentTimelineFilter === 'live' && inc.isHistoricalArchive) {
      return false;
    }
    if (incidentTimelineFilter === 'historical' && !inc.isHistoricalArchive) {
      return false;
    }

    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || inc.severity === selectedSeverity;
    const matchesCategory = selectedCategory === 'all' || inc.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'unverified' && inc.status === 'unverified') ||
      (statusFilter === 'verified' && inc.status !== 'unverified');

    return matchesSearch && matchesSeverity && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse text-cyan-500" />
                <span>IMD REAL-TIME TELEMETRY & DISASTER REGISTRY</span>
              </span>
              <button
                onClick={() => refreshImdData()}
                disabled={imdLoading}
                className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-600 dark:text-zinc-300 text-[10px] font-mono flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${imdLoading ? 'animate-spin' : ''}`} />
                <span>Sync IMD</span>
              </button>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
              Disaster Incidents Feed & Historical Archive
            </h1>
            <p className="text-xs text-zinc-500">
              Real-time emergency reports and IMD verified incidents, with past Kerala disasters safely cataloged in the historical archive.
            </p>
          </div>

          <button
            onClick={() => navigate('/report')}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold font-mono tracking-wider shadow shrink-0"
          >
            + Report New Incident
          </button>
        </div>

        {/* Timeline Tabs: All vs Live Active vs Historical Archive */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 w-fit flex-wrap">
          <button
            onClick={() => setIncidentTimelineFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              incidentTimelineFilter === 'all'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            All Incidents ({incidents.length})
          </button>
          <button
            onClick={() => setIncidentTimelineFilter('live')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              incidentTimelineFilter === 'live'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>Live Active Incidents ({activeIncidents.length})</span>
          </button>
          <button
            onClick={() => setIncidentTimelineFilter('historical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              incidentTimelineFilter === 'historical'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <History className="w-3 h-3" />
            <span>Previous Incidents Archive ({historicalIncidents.length})</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search incidents, streets, or flood locations..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-800 dark:text-zinc-200"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-800 dark:text-zinc-200"
            >
              <option value="all">All Categories</option>
              <option value="flood">Flood</option>
              <option value="fire">Fire</option>
              <option value="earthquake">Earthquake</option>
              <option value="medical">Medical</option>
              <option value="landslide">Landslide</option>
              <option value="sos">Distress SOS</option>
            </select>

            {currentRole === 'authority' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 font-bold text-amber-500"
              >
                <option value="all">All Verification States</option>
                <option value="unverified">Pending Verification Only</option>
                <option value="verified">Verified Public Only</option>
              </select>
            )}

            <div className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-900 text-orange-500 shadow-sm' : 'text-zinc-400'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-zinc-900 text-orange-500 shadow-sm' : 'text-zinc-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Incidents List Container */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => setSelectedIncident(inc)}
              className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-orange-500/50 cursor-pointer transition-all space-y-3 shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase bg-orange-500/10 text-orange-500 border border-orange-500/30">
                      {inc.category}
                    </span>
                    {inc.isHistoricalArchive && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <History className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        Archive ({inc.archiveDate || 'Past Record'})
                      </span>
                    )}
                    {inc.isImdVerified && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                        <CloudRain className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                        IMD Verified
                      </span>
                    )}
                    {inc.status === 'unverified' ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-amber-500/20 text-amber-500 border border-amber-500/40">
                        Pending Verification
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-emerald-500/20 text-emerald-500 border border-emerald-500/40">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      inc.severity === 'critical'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {inc.severity}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2">
                  {inc.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {inc.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    {inc.location.sector}
                  </span>
                  <span className="font-mono text-[11px] text-orange-400 font-bold">
                    Score: {inc.urgencyScore}
                  </span>
                </div>

                {/* Assigned Personnel or Dispatch Tag */}
                {inc.assignedVolunteer ? (
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs">
                    <UserCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate text-[11px] text-blue-600 dark:text-blue-300 font-medium">
                      Assigned: <strong>{inc.assignedVolunteer.name}</strong> ({inc.assignedVolunteer.roleTitle})
                    </span>
                  </div>
                ) : (
                  inc.dispatchTeam && (
                    <div className="flex items-center gap-2 p-1 rounded bg-zinc-100 dark:bg-zinc-800/80 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
                      <span>Dispatch: {inc.dispatchTeam}</span>
                    </div>
                  )
                )}

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 gap-2">
                  <span>{formatDate(inc.timestamp)}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleUpvote(inc.id, e)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 font-bold text-[11px] transition-colors"
                      title="Upvote priority"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{inc.upvotes}</span>
                    </button>

                    {currentRole === 'authority' && inc.status === 'unverified' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          verifyIncident(inc.id);
                        }}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-[11px] font-bold rounded shadow"
                      >
                        Verify
                      </button>
                    )}

                    {currentRole === 'authority' && !inc.assignedVolunteer && inc.status !== 'resolved' && (
                      <button
                        onClick={(e) => handleDispatch(inc.id, e)}
                        className="px-2 py-0.5 bg-orange-600 hover:bg-orange-500 text-white font-sans text-[11px] font-bold rounded shadow"
                        title="Auto-match and dispatch best rescue specialist"
                      >
                        Dispatch Squad
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => setSelectedIncident(inc)}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-orange-500/50 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {inc.title}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-500">
                    {inc.category}
                  </span>
                  {inc.isHistoricalArchive && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <History className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      Archive ({inc.archiveDate || 'Past'})
                    </span>
                  )}
                  {inc.isImdVerified && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <CloudRain className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                      IMD Verified
                    </span>
                  )}
                  {inc.assignedVolunteer && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      {inc.assignedVolunteer.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 truncate max-w-xl">{inc.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                <button
                  onClick={(e) => handleUpvote(inc.id, e)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 font-bold transition-colors"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{inc.upvotes}</span>
                </button>
                <span className="text-red-400 font-bold uppercase">{inc.severity}</span>
                <span className="text-zinc-400">{inc.location.sector}</span>
                <button className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-sans text-xs">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Incident Triage Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-xl w-full text-zinc-100 space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedIncident(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-mono font-bold uppercase border border-orange-500/30">
                {selectedIncident.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-mono font-bold uppercase border border-red-500/30">
                {selectedIncident.severity}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono uppercase">
                Status: {selectedIncident.status}
              </span>
            </div>

            <h2 className="text-xl font-bold font-sans">{selectedIncident.title}</h2>
            <p className="text-xs text-zinc-300 leading-relaxed">{selectedIncident.description}</p>

            {selectedIncident.isHistoricalArchive && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                <History className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-mono font-bold uppercase tracking-wider text-[10px] text-amber-300">
                    Previous Incidents Archive Record ({selectedIncident.archiveDate || 'Past Record'})
                  </p>
                  {selectedIncident.archiveSignificance && (
                    <p className="text-xs text-amber-100/90 leading-relaxed">
                      {selectedIncident.archiveSignificance}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Media Attachment Preview */}
            {selectedIncident.mediaUrls && selectedIncident.mediaUrls.length > 0 && (
              <div className="rounded-2xl overflow-hidden border border-zinc-800 h-52">
                <img
                  src={selectedIncident.mediaUrls[0]}
                  alt="Incident visual"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* AI Analysis Component */}
            <AiAnalysisPanel incident={selectedIncident} />

            {/* ASSIGNED RESCUE TEAM & VOLUNTEER SPECIALIST EXPLANATION */}
            {selectedIncident.assignedVolunteer ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-zinc-900 to-indigo-950/30 border-2 border-blue-500/40 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-blue-400" />
                      ASSIGNED LEAD RESPONDER & RESCUE SQUAD
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Dispatched: {selectedIncident.assignedVolunteer.dispatchedAt}
                  </span>
                </div>

                <div className="flex items-start gap-3.5 pt-1">
                  {selectedIncident.assignedVolunteer.avatar ? (
                    <img
                      src={selectedIncident.assignedVolunteer.avatar}
                      alt={selectedIncident.assignedVolunteer.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500/40 shrink-0 shadow"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0">
                      <UserCheck className="w-7 h-7 text-blue-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                          <span>{selectedIncident.assignedVolunteer.name}</span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-mono border border-blue-500/30">
                            {selectedIncident.assignedVolunteer.verificationLevel}
                          </span>
                        </h4>
                        <p className="text-xs text-blue-300 font-medium">
                          {selectedIncident.assignedVolunteer.roleTitle}
                        </p>
                      </div>

                      <a
                        href={`tel:${selectedIncident.assignedVolunteer.phone}`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{selectedIncident.assignedVolunteer.phone}</span>
                      </a>
                    </div>

                    <p className="text-[11px] text-zinc-400 font-mono">
                      Operational Sector Base: <strong>{selectedIncident.assignedVolunteer.sector}</strong>
                    </p>

                    {selectedIncident.assignedVolunteer.matchReason && (
                      <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-700/40 text-[11px] text-blue-200">
                        <span className="font-bold text-blue-300">Intelligent Match Rationale: </span>
                        {selectedIncident.assignedVolunteer.matchReason}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedIncident.assignedVolunteer.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-dashed border-zinc-800 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-zinc-400 font-mono block uppercase font-bold text-[11px]">
                    RESCUE SQUAD DEPLOYMENT STATUS:
                  </span>
                  <span className="text-zinc-300 font-semibold">
                    {selectedIncident.dispatchTeam || 'Pending Authority Squad Assignment'}
                  </span>
                </div>
                {currentRole === 'authority' && (
                  <button
                    onClick={() => handleDispatch(selectedIncident.id)}
                    className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold font-sans text-xs shrink-0 shadow flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Assign Best Suitable Rescuer</span>
                  </button>
                )}
              </div>
            )}

            {/* Reporter Meta & Timeline */}
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs font-mono space-y-3">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Reporter Info:</span>
                <span className="font-bold text-zinc-200">
                  {selectedIncident.reporter.name} ({selectedIncident.reporter.phone || '+91 KSDMA Log'}) •{' '}
                  <span className="text-emerald-400 font-bold">✓ Verified Citizen</span>
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-400 block font-bold">INCIDENT VERIFICATION TIMELINE & LOGS:</span>
                <div className="space-y-1.5 pt-1 text-[11px] font-sans">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span><strong>12:05 PM:</strong> Citizen SOS report transmitted with image payload</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                    <span><strong>12:06 PM:</strong> Gemini AI Vision confidence score verified ({selectedIncident.aiConfidence}%)</span>
                  </div>
                  {selectedIncident.assignedVolunteer ? (
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                      <span>
                        <strong>{selectedIncident.assignedVolunteer.dispatchedAt}:</strong> Dispatched{' '}
                        {selectedIncident.assignedVolunteer.name} ({selectedIncident.assignedVolunteer.roleTitle})
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                      <span><strong>12:10 PM:</strong> KSDMA DEOC Command Center acknowledged dispatch vector</span>
                    </div>
                  )}
                  {selectedIncident.notes?.map((note, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-zinc-400 text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0"></span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 gap-2 flex-wrap">
              <button
                onClick={() => handleUpvote(selectedIncident.id)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-zinc-700 text-zinc-100 transition-colors"
              >
                <ThumbsUp className="w-4 h-4 text-orange-400" />
                <span>Upvote Priority ({selectedIncident.upvotes})</span>
              </button>

              <div className="flex items-center gap-2">
                {currentRole === 'authority' && selectedIncident.status === 'unverified' && (
                  <button
                    onClick={() => {
                      verifyIncident(selectedIncident.id);
                      setSelectedIncident((prev) =>
                        prev
                          ? {
                              ...prev,
                              status: 'verified',
                              aiConfidence: Math.min(99, prev.aiConfidence + 10),
                            }
                          : null
                      );
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow"
                  >
                    Verify Incident
                  </button>
                )}

                {currentRole === 'authority' && (
                  <button
                    onClick={() => handleDispatch(selectedIncident.id)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>
                      {selectedIncident.assignedVolunteer ? 'Reassign Best Specialist' : 'Dispatch Rescue Squad'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
