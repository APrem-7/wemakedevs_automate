'use client';

import { Circle } from 'lucide-react';
import { useStore } from '@/lib/orca-store';

type ConnectionStatus = 'connected' | 'processing' | 'error';

const statusConfig: Record<ConnectionStatus, { label: string; color: string; animate: boolean }> = {
    connected: { label: 'Connected', color: 'text-[#30D158]', animate: false },
    processing: { label: 'Processing', color: 'text-[#2997FF]', animate: true },
    error: { label: 'Error', color: 'text-[#FF453A]', animate: false },
};

export function TopBar() {
    const connectionStatus = useStore((s) => s.connectionStatus);
    const config = statusConfig[connectionStatus];

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-14 backdrop-blur-xl bg-black/60 border-b border-white/5">
            <div className="max-w-[720px] mx-auto px-4 h-full flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#2997FF] to-[#6366F1]" />
                    <span className="text-base font-semibold tracking-tight text-[#F5F5F7]">ORCA</span>
                </div>

                {/* Status pill */}
                <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
                    <Circle
                        className={`w-2 h-2 fill-current ${config.color} ${config.animate ? 'animate-pulse' : ''}`}
                    />
                    <span className="text-[#F5F5F7] text-xs font-medium">{config.label}</span>
                </div>
            </div>
        </div>
    );
}
