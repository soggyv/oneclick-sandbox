import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-48px)] max-w-[380px] bg-white dark:bg-zinc-800 rounded-2xl shadow-xl px-4 py-3.5 border border-gray-100 dark:border-transparent flex items-center gap-3 animate-bounce">
      {toast.type === 'success' ? (
        <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center text-green-500 dark:text-green-400">
          <CheckCircle2 size={18} />
        </div>
      ) : toast.type === 'error' ? (
        <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500 dark:text-red-400">
          <AlertCircle size={18} />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
          <Info size={18} />
        </div>
      )}
      <p className="text-xs font-bold text-gray-800 dark:text-zinc-200 flex-1 leading-snug">{toast.message}</p>
    </div>
  );
}
