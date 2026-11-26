import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { ToastMessage } from '../types/veripath';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0 print:hidden"
    >
      {toasts.map((toast) => {
        const styles = {
          success: 'bg-white border-emerald-200 text-slate-900',
          info: 'bg-white border-slate-200 text-slate-900',
          warning: 'bg-white border-amber-200 text-slate-900',
          error: 'bg-white border-red-200 text-slate-900',
        }[toast.variant];

        const Icon = {
          success: CheckCircle2,
          info: Info,
          warning: AlertTriangle,
          error: XCircle,
        }[toast.variant];

        const iconColor = {
          success: 'text-[#16A34A]',
          info: 'text-[#2A7B88]',
          warning: 'text-[#D97706]',
          error: 'text-red-600',
        }[toast.variant];

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg transition-all duration-150 ${styles}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 leading-snug">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-[#2A7B88]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
