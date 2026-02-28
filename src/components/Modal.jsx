import { useEffect } from 'react';
import { X } from 'lucide-react';

const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        function handleEscape(e) {
            if (e.key === 'Escape') onClose();
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-2xl w-full ${sizes[size]} max-h-[85vh] overflow-y-auto shadow-2xl animate-[modalSlideIn_0.3s_ease]`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
