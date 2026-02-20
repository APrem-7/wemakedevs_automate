'use client';

import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { useStore, Toast as ToastType } from '@/lib/orca-store';

function ToastItem({ toast }: { toast: ToastType }) {
    const icons = {
        success: <CheckCircle2 className="w-4 h-4 text-[#30D158] flex-shrink-0" />,
        error: <XCircle className="w-4 h-4 text-[#FF453A] flex-shrink-0" />,
        info: <Info className="w-4 h-4 text-[#2997FF] flex-shrink-0" />,
    };
    const accents = {
        success: 'border-l-[#30D158]',
        error: 'border-l-[#FF453A]',
        info: 'border-l-[#2997FF]',
    };

    return (
        <div
            className={`orca-toast bg-[#1C1C1E] border border-white/10 border-l-2 ${accents[toast.type]} rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl shadow-black/60 min-w-[220px] max-w-[340px]`}
        >
            {icons[toast.type]}
            <span className="text-sm text-[#F5F5F7]">{toast.message}</span>
        </div>
    );
}

export function ToastContainer() {
    const toasts = useStore((s) => s.toasts);

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
}
