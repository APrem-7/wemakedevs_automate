"use client";

interface MetaColumnProps {
    label: string;
    value: string;
    sublabel: string;
}

function MetaColumn({ label, value, sublabel }: MetaColumnProps) {
    return (
        <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-[0.15em] uppercase text-zinc-600 font-semibold mb-2">
                {label}
            </p>
            <p className="text-sm font-semibold text-white/90 truncate">{value}</p>
            <p className="text-xs text-zinc-500 mt-0.5 truncate">{sublabel}</p>
        </div>
    );
}

interface WorkflowMetaGridProps {
    sourceMaterial: {
        name: string;
        type: "notion" | "local";
    };
    architecture: {
        stageCount: number;
        label: string;
    };
    estimatedDuration: string;
}

export function WorkflowMetaGrid({
    sourceMaterial,
    architecture,
    estimatedDuration,
}: WorkflowMetaGridProps) {
    const sourceSubLabel =
        sourceMaterial.type === "notion" ? "Notion Integration" : "Local Files";

    return (
        <div className="flex items-start gap-8 px-2">
            <MetaColumn
                label="Source Material"
                value={sourceMaterial.name}
                sublabel={sourceSubLabel}
            />
            <MetaColumn
                label="Architecture"
                value={`${architecture.stageCount} Stages`}
                sublabel={architecture.label}
            />
            <MetaColumn
                label="Est. Duration"
                value={estimatedDuration}
                sublabel="Deep Extraction"
            />
        </div>
    );
}
