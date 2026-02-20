"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

interface WorkflowPreviewHeaderProps {
    title: string;
    subtitle?: string;
    confidence: number;
}

export function WorkflowPreviewHeader({
    title,
    subtitle,
    confidence,
}: WorkflowPreviewHeaderProps) {
    const [displayConfidence, setDisplayConfidence] = useState(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const start = performance.now();
        const duration = 1200; // ms

        function animate(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayConfidence(Math.round(eased * confidence));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        }

        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [confidence]);

    return (
        <div className="flex flex-col items-center text-center space-y-6">
            {/* Glowing icon */}
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-xl" />
                <div className="relative w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
            </div>

            {/* Title */}
            <div>
                <h1 className="text-4xl md:text-5xl font-serif text-white/90 tracking-tight leading-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-4xl md:text-5xl font-serif italic text-white/60 tracking-tight leading-tight mt-1">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Status line */}
            <p className="text-[11px] tracking-[0.2em] uppercase text-zinc-500 font-medium">
                Ready to Process{" "}
                <span className="text-zinc-600 mx-1">•</span>{" "}
                <span className="tabular-nums">{displayConfidence}%</span> Confidence
            </p>
        </div>
    );
}
