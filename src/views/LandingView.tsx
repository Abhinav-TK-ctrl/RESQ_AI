import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Sparkles,
  MapPin,
  Radio,
  Users,
  Building,
  Box,
  Cpu,
  Zap,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Activity,
  ShieldCheck,
  Award,
  Globe2,
  Clock,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { navigate, setRole, incidents, shelters, volunteers } = useApp();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does ResQ AI prioritize emergency incident reports?',
      a: 'ResQ AI utilizes multimodal vision and audio language models to analyze citizen submissions in real-time. It evaluates situational keywords, image damage severity, water level depth, and proximity to high-density populations to assign an automated Urgency Score (1-100) and alert regional authorities.',
    },
    {
      q: 'Can ResQ AI operate during total cellular network outages?',
      a: 'Yes. ResQ AI incorporates a Progressive Web App (PWA) offline mesh sync architecture. Reports submitted offline are stored securely in local browser storage and automatically broadcasted to neighboring peer devices or uploaded as soon as satellite/cellular signal is restored.',
    },
    {
      q: 'How do first responders and volunteers coordinate duties?',
      a: 'Volunteers register their specialized skills (e.g., Swift Water Rescue, Medical Trauma, Heavy Machinery). ResQ AI’s skill-matching matrix automatically pairs active incident reports with certified nearby volunteers, reducing response times by over 45%.',
    },
    {
      q: 'Is ResQ AI compatible with municipal government systems?',
      a: 'ResQ AI features open GIS integration standards (GeoJSON, CAP v1.2 emergency broadcast protocols) allowing seamless interoperability with 911 dispatch, FEMA, Red Cross, and local emergency management agencies.',
    },
  ];

  return (
    <div className="space-y-20 pb-16 text-stone-900 dark:text-stone-100 selection:bg-red-900 selection:text-red-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-stone-300 dark:border-zinc-800/80 bg-gradient-to-b from-stone-200/30 dark:from-red-950/20 via-transparent to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* State Emergency Operations Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-mono font-medium tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KERALA STATE DISASTER MANAGEMENT • EMERGENCY PORTAL ACTIVE</span>
          </div>

          {/* Headline */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight leading-[1.1] text-stone-900 dark:text-stone-100">
              AI-Powered <span className="italic font-serif text-red-600 dark:text-red-500">Disaster Intelligence</span> & Emergency Response
            </h1>
            <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-400 font-sans font-normal leading-relaxed max-w-2xl mx-auto">
              Connecting affected citizens, certified rescue volunteers, and national disaster command in real-time through automated AI triage and geospatial intelligence.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                setRole('authority');
                navigate('/dashboard/authority');
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white font-serif font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 border border-stone-700 dark:border-stone-300"
            >
              <ShieldAlert className="w-4 h-4 text-red-500 dark:text-red-600" />
              <span>Enter Command Console</span>
            </button>
            <button
              onClick={() => {
                setRole('citizen');
                navigate('/dashboard/citizen');
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-stone-200/80 dark:bg-[#141418] text-stone-900 dark:text-stone-100 hover:bg-stone-300 dark:hover:bg-zinc-800 font-serif font-bold text-sm border border-stone-300 dark:border-zinc-700 transition-all flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>Citizen Safety Portal</span>
            </button>
          </div>

          {/* Live Metrics Row */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div className="p-5 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold">AVG DISPATCH</span>
                <Clock className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
                3.2 <span className="text-xs font-sans text-stone-500 dark:text-stone-400 font-normal">mins</span>
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono">↓ 68% FASTER THAN LEGACY 911</p>
            </div>

            <div className="p-5 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold">VISION TRIAGE</span>
                <Cpu className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
                98.4%
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 font-mono uppercase">ACCURACY RATING</p>
            </div>

            <div className="p-5 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold">ACTIVE SHELTERS</span>
                <Building className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {shelters.length} <span className="text-xs font-sans text-stone-500 dark:text-stone-400 font-normal">HUBS</span>
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono uppercase">LIVE CAPACITY TRACKING</p>
            </div>

            <div className="p-5 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold">VERIFIED RESCUERS</span>
                <Users className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {volunteers.length * 12}
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 font-mono uppercase">8 SECTORS MOBILIZED</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Response Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-widest text-red-600 dark:text-red-400 font-bold">
            AUTOMATED LIFECYCLE
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
            How ResQ AI Works During a Crisis
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            A seamless four-step pipeline from citizen distress signal to ground team resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="p-6 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-4 relative group hover:border-stone-400 dark:hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-mono font-bold text-lg border border-red-500/20">
              01
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">SOS Signal / Photo Report</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              Citizens submit geo-tagged voice notes, photos, or 1-tap SOS beacons even with weak cellular coverage.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-4 relative group hover:border-stone-400 dark:hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono font-bold text-lg border border-blue-500/20">
              02
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">AI Multimodal Triage</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              Gemini AI models automatically score damage severity, extract location metrics, and detect life safety threats.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-4 relative group hover:border-stone-400 dark:hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-lg border border-emerald-500/20">
              03
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">Smart Resource Matching</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              Dispatches certified nearby volunteers, ambulances, and heavy machinery based on proximity and skill matrix.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-4 relative group hover:border-stone-400 dark:hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-mono font-bold text-lg border border-purple-500/20">
              04
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">Live GIS Tracking</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              Authorities monitor real-time evacuation shelter capacities, water levels, and response team positions on a unified map.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Architecture Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-widest text-red-600 dark:text-red-400 font-bold">
            PLATFORM CAPABILITIES
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Designed for Disaster Preparedness & Action
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">AI Emergency Triage</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              Automated image classification evaluates flood depths, structural damage, and medical distress levels to eliminate dispatch bottlenecks.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">Geospatial GIS Engine</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              Layered heatmaps visualize flood zones, earthquake epicenters, active shelters, and mobile rescue units in real-time.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">Volunteer Skill Matrix</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              Roster management matches certified trauma doctors, boat operators, and logistics specialists to critical sector missions.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">Evacuation Shelter Tracker</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              Live capacity management monitors food, medical supplies, power generators, and pet accessibility across all local shelters.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Box className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">Supply Chain Logistics</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              Inventory dispatch tracking prevents shortages of clean water, oxygen concentrators, burn kits, and MRE rations.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">Multi-Agency Broadcasts</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
              Geo-targeted emergency SMS and mobile alerts notify specific high-risk sectors within seconds of disaster detection.
            </p>
          </div>
        </div>
      </section>

      {/* Partners & Agencies Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-stone-200/60 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 text-center space-y-6">
          <p className="text-xs font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 font-bold">
            INTEROPERABILITY STANDARD • MULTI-AGENCY RELAY
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-stone-600 dark:text-stone-400 font-serif font-bold text-sm">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-500" /> National Emergency Operations
            </span>
            <span className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-blue-500" /> International Relief Corps
            </span>
            <span className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" /> Red Cross First Response
            </span>
            <span className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" /> Disaster Health Command
            </span>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-stone-500 font-mono uppercase tracking-wider">SYSTEM ARCHITECTURE SPECIFICATIONS</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${
                    activeFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs font-sans text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-200 dark:border-zinc-800/80 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-stone-900 dark:bg-[#131317] text-stone-100 border border-stone-800 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold">
              Ready to Test ResQ AI in Sandbox Mode?
            </h3>
            <p className="text-xs font-sans text-stone-400 leading-relaxed">
              Explore citizen emergency reporting, volunteer deployment rosters, and live authority command heatmaps with pre-loaded mock scenarios.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => {
                setRole('authority');
                navigate('/dashboard/authority');
              }}
              className="px-6 py-3.5 rounded-xl bg-stone-100 dark:bg-stone-100 text-stone-900 hover:bg-white font-serif font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>Launch Authority Console</span>
              <ArrowRight className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
