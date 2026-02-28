import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 px-8 animate-[fadeInUp_0.5s_ease]">
            <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-400 mb-5">
                <Icon size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1.5">{title}</h3>
            {description && (
                <p className="text-sm text-slate-400 max-w-xs leading-relaxed">{description}</p>
            )}
            {action && (
                <div className="mt-5">
                    {action}
                </div>
            )}
        </div>
    );
}
