import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast({ toast }) {
  const [activeToast, setActiveToast] = useState(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast) {
      setActiveToast(toast);
      setIsExiting(false);
    } else if (activeToast && !isExiting) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setActiveToast(null);
        setIsExiting(false);
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!activeToast) return null;

  return (
    <div
      className={`fixed top-6 left-1/2 z-[200] w-[calc(100%-32px)] max-w-[380px] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl shadow-2xl px-4 py-3.5 border border-gray-200/80 dark:border-zinc-700/80 flex items-center gap-3 transition-all ${
        isExiting ? 'animate-toast-out' : 'animate-toast-in'
      }`}
    >
      {activeToast.type === 'success' ? (
        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0 shadow-xs">
          <CheckCircle2 size={18} />
        </div>
      ) : activeToast.type === 'error' ? (
        <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-500 dark:text-red-400 shrink-0 shadow-xs">
          <AlertCircle size={18} />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-500 dark:text-blue-400 shrink-0 shadow-xs">
          <Info size={18} />
        </div>
      )}
      <p className="text-xs font-semibold text-gray-800 dark:text-zinc-100 flex-1 leading-relaxed tracking-tight">
        {activeToast.message}
      </p>
    </div>
  );
}


