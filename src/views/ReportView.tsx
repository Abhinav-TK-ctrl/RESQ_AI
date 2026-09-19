import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IncidentCategory, IncidentSeverity } from '../types';
import { ImageUploader } from '../components/common/ImageUploader';
import {
  Radio,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CloudRain,
  Activity,
  WifiOff,
  Navigation,
  Trees,
  Zap,
  Home,
  Wind,
  CheckCircle2,
  RefreshCw,
  Cpu,
} from 'lucide-react';

export const ReportView: React.FC = () => {
  const { addIncident, navigate, currentRole, addToast } = useApp();
  const [step, setStep] = useState(1);

  const [category, setCategory] = useState<IncidentCategory>('landslide');
  const [severity, setSeverity] = useState<IncidentSeverity>('critical');
  const [title, setTitle] = useState('Landslide Debris Flow & Road Washout at Meppadi');
  const [description, setDescription] = useState(
    'Heavy hillside earth slip washed away section of Chooralmala-Mundakkai road. Water level rising fast in nearby stream.'
  );
  const [address, setAddress] = useState('Chooralmala Road, Meppadi, Wayanad District');
  const [sector, setSector] = useState('Wayanad District (DEOC)');
  const [affectedCount, setAffectedCount] = useState(120);
  const [reporterName, setReporterName] = useState('Arjun Nair');
  const [reporterPhone, setReporterPhone] = useState('+91 94470 12345');
  const [imagePreview, setImagePreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80'
  );

  // Hero AI Simulation Workflow State
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [aiStep, setAiStep] = useState(1);

  const keralaCategories: { id: IncidentCategory; label: string; icon: any }[] = [
    { id: 'landslide', label: 'Landslide / Slope Fail', icon: Activity },
    { id: 'flood', label: 'Flood / Water Surge', icon: CloudRain },
    { id: 'river_overflow', label: 'River Overflow & Breach', icon: ShieldAlert },
    { id: 'heavy_rain', label: 'Heavy Monsoon Downpour', icon: CloudRain },
    { id: 'road_blockage', label: 'Road Blockage / Slip', icon: Navigation },
    { id: 'tree_collapse', label: 'Tree Collapse on Road', icon: Trees },
    { id: 'power_line', label: 'Power Line & Transformer Damage', icon: Zap },
    { id: 'house_collapse', label: 'House / Wall Collapse', icon: Home },
    { id: 'strong_wind', label: 'Strong Wind / Gale Damage', icon: Wind },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingAi(true);
    setAiStep(1);

    // Step-by-step AI simulation pipeline
    setTimeout(() => setAiStep(2), 600); // Analyze image
    setTimeout(() => setAiStep(3), 1300); // Detect disaster
    setTimeout(() => setAiStep(4), 2000); // Priority score
    setTimeout(() => setAiStep(5), 2600); // Final dispatch

    setTimeout(() => {
      addIncident({
        title: title || `${category.toUpperCase().replace('_', ' ')} IN ${sector.toUpperCase()}`,
        description: description || 'Reported via KSDMA ResQ AI Emergency Wizard.',
        category,
        severity,
        status: 'unverified',
        location: {
          address,
          lat: 11.55,
          lng: 76.12,
          sector,
        },
        reporter: {
          name: reporterName,
          phone: reporterPhone,
          role: currentRole,
          verified: true,
        },
        mediaUrls: imagePreview ? [imagePreview] : [],
        affectedCount,
        aiConfidence: 98,
        aiCategorySuggestion: `Gemini AI Vision Analysis: ${category.toUpperCase().replace('_', ' ')} Detected`,
        urgencyScore: severity === 'critical' ? 98 : severity === 'high' ? 88 : 65,
      });

      addToast(
        '🚨 DISASTER INCIDENT TRANSMITTED',
        'AI verified report dispatched to KSDMA SEOC Command Center',
        'success'
      );
      navigate('/reports');
    }, 3200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 font-sans">
      {/* Wizard Header */}
      <div className="p-6 rounded-2xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-600 dark:text-red-500">
            <Radio className="w-4 h-4" />
            <span>KSDMA DISASTER REPORT WIZARD • STEP {step} OF 3</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 font-bold">
            <WifiOff className="w-3 h-3" /> Offline PWA Buffer Active
          </span>
        </div>

        <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
          Report Kerala Emergency Incident
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          Disaster logs are AI-verified via Gemini Vision, scored for urgency, and dispatched to KSDMA DEOC control rooms.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-stone-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-red-600 dark:bg-red-500 h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-stone-50 dark:bg-[#121215] border border-stone-300 dark:border-zinc-800 space-y-6 shadow-sm">
        {/* STEP 1: Category & Severity */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold font-serif text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                1. Select Kerala Disaster Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {keralaCategories.map((cat) => {
                  const Icon = cat.icon;
                  const active = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        active
                          ? 'border-red-600 dark:border-red-500 bg-red-500/10 text-stone-900 dark:text-stone-100 font-bold shadow-sm'
                          : 'border-stone-300 dark:border-zinc-800 text-stone-600 dark:text-stone-400 hover:border-stone-400'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${active ? 'bg-red-600 text-white' : 'bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-stone-300'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-serif font-semibold">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold font-serif text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                2. Threat & Urgency Severity Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSeverity('critical')}
                  className={`p-3 rounded-xl border text-center text-xs font-serif font-bold transition-all ${
                    severity === 'critical'
                      ? 'border-red-600 bg-red-600/20 text-red-600 dark:text-red-400'
                      : 'border-stone-300 dark:border-zinc-800 text-stone-500'
                  }`}
                >
                  CRITICAL (Immediate Life Threat)
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('high')}
                  className={`p-3 rounded-xl border text-center text-xs font-serif font-bold transition-all ${
                    severity === 'high'
                      ? 'border-amber-600 bg-amber-600/20 text-amber-700 dark:text-amber-400'
                      : 'border-stone-300 dark:border-zinc-800 text-stone-500'
                  }`}
                >
                  HIGH (Evacuation / Rescue Needed)
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('medium')}
                  className={`p-3 rounded-xl border text-center text-xs font-serif font-bold transition-all ${
                    severity === 'medium'
                      ? 'border-blue-600 bg-blue-600/20 text-blue-700 dark:text-blue-400'
                      : 'border-stone-300 dark:border-zinc-800 text-stone-500'
                  }`}
                >
                  MEDIUM (Property / Road Damage)
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-serif font-bold text-xs uppercase tracking-wider shadow flex items-center justify-center gap-2"
            >
              <span>Next: Incident Details & Evidence Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Location, Description & Image Upload */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-serif font-bold text-stone-800 dark:text-stone-200">
                Incident Summary Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Landslide Blocking Meppadi Main Road"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-red-500 font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-serif font-bold text-stone-800 dark:text-stone-200">
                Detailed Disaster Description
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe water surge height, trapped families, electric wire hazards..."
                className="w-full p-3 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-red-500 font-sans"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-stone-800 dark:text-stone-200">
                  Location / Landmark Address in Kerala
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 rounded-xl text-xs font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-stone-800 dark:text-stone-200">
                  Estimated Affected Citizens
                </label>
                <input
                  type="number"
                  value={affectedCount}
                  onChange={(e) => setAffectedCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            {/* Functional Image Uploader */}
            <ImageUploader
              value={imagePreview}
              onChange={setImagePreview}
              label="Disaster Photo / Evidence Upload"
              hint="Upload JPG/PNG photo for Gemini AI multimodal triage analysis."
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl bg-stone-200 dark:bg-zinc-800 text-xs font-serif font-bold text-stone-800 dark:text-stone-200"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-serif font-bold text-xs uppercase tracking-wider shadow"
              >
                Next: Review & Dispatch
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-serif font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>KSDMA AI Triage Preview</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>Category: <strong className="uppercase">{category}</strong></div>
                <div>Severity: <strong className="uppercase text-red-600 dark:text-red-400">{severity}</strong></div>
                <div>Location: <strong>{sector}</strong></div>
                <div>Urgency Score: <strong>{severity === 'critical' ? '98/100' : '82/100'}</strong></div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-serif font-bold text-xs uppercase text-stone-500">Reporter Information</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Your Name"
                  className="px-3 py-2.5 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 rounded-xl"
                />
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="px-3 py-2.5 bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3.5 rounded-xl bg-stone-200 dark:bg-zinc-800 text-xs font-serif font-bold text-stone-800 dark:text-stone-200"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-serif font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 border border-red-400"
              >
                <Radio className="w-4 h-4" />
                <span>Transmit Incident Report</span>
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Hero Feature Modal: Animated Simulated AI Processing Pipeline Overlay */}
      {isProcessingAi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 max-w-lg w-full text-stone-100 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Cpu className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-100">
                    ResQ AI Triage Engine Active
                  </h3>
                  <p className="text-xs text-purple-400 font-mono">
                    Gemini Vision Multimodal Pipeline
                  </p>
                </div>
              </div>
              <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
            </div>

            {/* Pipeline Step List */}
            <div className="space-y-3 font-mono text-xs">
              <div
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  aiStep >= 1
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 font-bold'
                    : 'bg-stone-800/40 border-stone-800 text-stone-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  {aiStep >= 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 rounded-full border border-stone-600"></span>}
                  <span>1. Uploading Disaster Evidence Image...</span>
                </div>
                {aiStep >= 1 && <span className="text-[10px] text-emerald-400">DONE</span>}
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  aiStep >= 2
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 font-bold'
                    : 'bg-stone-800/40 border-stone-800 text-stone-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  {aiStep >= 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 rounded-full border border-stone-600"></span>}
                  <span>2. Gemini AI Image Feature Detection...</span>
                </div>
                {aiStep >= 2 && <span className="text-[10px] text-emerald-400">98% Match</span>}
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  aiStep >= 3
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 font-bold'
                    : 'bg-stone-800/40 border-stone-800 text-stone-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  {aiStep >= 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 rounded-full border border-stone-600"></span>}
                  <span>3. Classifying Disaster: {category.toUpperCase()}</span>
                </div>
                {aiStep >= 3 && <span className="text-[10px] text-red-400">CRITICAL</span>}
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  aiStep >= 4
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 font-bold'
                    : 'bg-stone-800/40 border-stone-800 text-stone-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  {aiStep >= 4 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 rounded-full border border-stone-600"></span>}
                  <span>4. Urgency Priority Scoring: 98 / 100</span>
                </div>
                {aiStep >= 4 && <span className="text-[10px] text-red-400">PRIORITY HIGH</span>}
              </div>

              <div
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  aiStep >= 5
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                    : 'bg-stone-800/40 border-stone-800 text-stone-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  {aiStep >= 5 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 rounded-full border border-stone-600"></span>}
                  <span>5. Dispatching to KSDMA SEOC Command...</span>
                </div>
                {aiStep >= 5 && <span className="text-[10px] text-emerald-400">TRANSMITTED</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
