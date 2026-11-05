import { CheckCircle2, Info, AlertTriangle, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  visible: boolean;
}

export function Toast({ message, type = 'success', visible }: ToastProps) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-900/95 text-zinc-100 shadow-2xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-3">
      {type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
      {type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
      {type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
      {type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
      <span className="text-xs font-medium tracking-wide">{message}</span>
    </div>
  );
}
