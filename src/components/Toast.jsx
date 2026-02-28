import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const styles = {
    success: { icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-200', iconColor: 'text-emerald-500' },
    error: { icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', iconColor: 'text-red-500' },
    warning: { icon: AlertCircle, bg: 'bg-amber-50', border: 'border-amber-200', iconColor: 'text-amber-500' },
};

let toastId = 0;
let addToastFn = null;

export function showToast(message, type = 'success') {
    if (addToastFn) {
        addToastFn({ id: ++toastId, message, type });
    }
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((toast) => {
        setToasts((prev) => [...prev, toast]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        }, 4000);
    }, []);

    useEffect(() => {
        addToastFn = addToast;
        return () => { addToastFn = null; };
    }, [addToast]);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <div className="fixed top-6 right-6 z-[2000] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => {
                const config = styles[toast.type] || styles.success;
                const Icon = config.icon;
                return (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 px-4 py-3 ${config.bg} border ${config.border} rounded-xl shadow-lg pointer-events-auto min-w-[300px] max-w-[420px] animate-[toastSlideIn_0.3s_ease]`}
                    >
                        <Icon size={18} className={config.iconColor} />
                        <span className="flex-1 text-sm font-medium text-slate-700">{toast.message}</span>
                        <button
                            className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                            onClick={() => removeToast(toast.id)}
                        >
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
