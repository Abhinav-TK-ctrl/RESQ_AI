import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-200 ${
              isError
                ? 'bg-red-950/90 border-red-800 text-red-100 shadow-red-950/40'
                : isWarning
                ? 'bg-amber-950/90 border-amber-800 text-amber-100 shadow-amber-950/40'
                : isSuccess
                ? 'bg-emerald-950/90 border-emerald-800 text-emerald-100 shadow-emerald-950/40'
                : 'bg-zinc-900/90 dark:bg-zinc-900/90 border-zinc-800 dark:border-zinc-800 text-zinc-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isError && <XCircle className="w-5 h-5 text-red-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {isSuccess && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {!isError && !isWarning && !isSuccess && <Info className="w-5 h-5 text-blue-400" />}
            </div>
            <div className="flex-1 text-sm">
              <p className="font-semibold leading-tight">{toast.title}</p>
              {toast.description && (
                <p className="mt-1 text-xs opacity-90 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-zinc-400 hover:text-zinc-100 transition-colors p-1"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
