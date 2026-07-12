import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-48px)] max-w-[380px] bg-white rounded-2xl shadow-xl px-4 py-3.5 border border-gray-100 flex items-center gap-3 animate-bounce">
      {toast.type === 'success' ? (
        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
          <CheckCircle2 size={18} />
        </div>
      ) : toast.type === 'error' ? (
        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
          <AlertCircle size={18} />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
          <Info size={18} />
        </div>
      )}
      <p className="text-xs font-bold text-gray-800 flex-1 leading-snug">{toast.message}</p>
    </div>
  );
}
