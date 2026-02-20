"use client";

// components/workflow/WorkflowProgressBar.tsx
// Thin animated horizontal progress bar with electric blue fill.

interface WorkflowProgressBarProps {
    progress: number; // 0-100
}

export function WorkflowProgressBar({ progress }: WorkflowProgressBarProps) {
    return (
        <div className="w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden mt-4">
            <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                }}
            />
        </div>
    );
}
