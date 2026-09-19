import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, AlertOctagon, X, CheckCircle, Navigation, Radio } from 'lucide-react';

export const FloatingSosButton: React.FC = () => {
  const { triggerSos, activeSos, cancelSos } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      triggerSos();
      setCountdown(null);
      setModalOpen(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, triggerSos]);

  const startSosSequence = () => {
    setCountdown(5); // 5 second grace period to cancel accidental clicks
  };

  const handleAbort = () => {
    setCountdown(null);
    setModalOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-6 z-40">
        {!activeSos ? (
          <button
            onClick={() => setModalOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white font-bold text-sm shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-red-400/40"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <ShieldAlert className="w-5 h-5" />
            <span className="tracking-wide uppercase font-mono">BROADCAST SOS</span>
          </button>
        ) : (
          <button
            onClick={cancelSos}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-red-950 text-red-200 border-2 border-red-600 font-bold text-xs shadow-xl animate-pulse"
          >
            <AlertOctagon className="w-5 h-5 text-red-400" />
            <span>SOS ACTIVE — Click to Deactivate</span>
          </button>
        )}
      </div>

      {/* SOS Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-red-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-zinc-100 shadow-2xl relative space-y-6 text-center">
            <button
              onClick={handleAbort}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 text-red-500 flex items-center justify-center border-2 border-red-500/40 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-red-400 font-sans">
                EMERGENCY SEARCH & RESCUE DISPATCH
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
                Pressing activate will immediately relay your precise GPS coordinates, Medical ID profile, and battery level to National Command & nearest First Responders.
              </p>
            </div>

            {/* GPS Simulation Box */}
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs flex items-center justify-between text-zinc-400">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>GPS Triangulation: 37.7749° N, 122.4194° W</span>
              </div>
              <span className="text-emerald-400 text-[10px]">±3m Accuracy</span>
            </div>

            {/* Countdown / Action Controls */}
            {countdown === null ? (
              <div className="space-y-3 pt-2">
                <button
                  onClick={startSosSequence}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-base uppercase font-mono tracking-wider shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2"
                >
                  <Radio className="w-5 h-5" />
                  <span>DISPATCH EMERGENCY SOS NOW</span>
                </button>
                <button
                  onClick={handleAbort}
                  className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition-colors"
                >
                  Cancel / Return to Safety Portal
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="text-4xl font-mono font-extrabold text-red-400 animate-bounce">
                  00:0{countdown}
                </div>
                <p className="text-xs text-orange-400 font-mono font-semibold">
                  TRANSMITTING EMERGENCY BEACON IN {countdown} SECONDS...
                </p>
                <button
                  onClick={handleAbort}
                  className="w-full py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-sm border border-zinc-700 transition-colors"
                >
                  ABORT SOS BEACON
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
