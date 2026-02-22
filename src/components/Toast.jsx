import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import './Toast.css';

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
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
        <div className="toast-container">
            {toasts.map((toast) => {
                const Icon = icons[toast.type] || icons.success;
                return (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        <Icon size={18} />
                        <span className="toast-message">{toast.message}</span>
                        <button className="toast-close" onClick={() => removeToast(toast.id)}>
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
