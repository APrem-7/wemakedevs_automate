// lib/mock-execution.ts
// Static mock data for the Workflow Execution UI.
// Replace with real data from the Zustand store / API later.

import type { WorkflowExecution } from "./types";

export const MOCK_EXECUTION: WorkflowExecution = {
    id: "standard-seq-align-v4",
    name: "Genomics Pipeline Alpha",
    progress: 50,
    stages: [
        {
            id: "stage-1",
            title: "Import Dataset",
            description:
                "Load the raw genomics dataset from the configured source bucket into the processing environment.",
            command: 'python3 import_data.py \\\n  --source "s3://genomics/raw" \\\n  --format "fastq" \\\n  --validate',
            status: "completed",
            duration: "2m 14s",
        },
        {
            id: "stage-2",
            title: "Clean Null Values",
            description:
                "Remove or interpolate null entries across all sample columns to prepare data for downstream analysis.",
            command: 'python3 clean_data.py \\\n  --strategy "interpolate" \\\n  --threshold 0.05',
            status: "completed",
            duration: "45s",
        },
        {
            id: "stage-3",
            title: "Normalize Features",
            description:
                "Standardizing numerical columns to ensure uniform distribution for the training model. Prevents feature dominance during convergence.",
            command: 'python3 preprocessing.py \\\n  --normalize "minmax" \\\n  --target "all" \\\n  --verbose',
            status: "current",
        },
        {
            id: "stage-4",
            title: "Train Model",
            description:
                "Train the classification model using normalized features and validated hyperparameters.",
            command: 'python3 train.py \\\n  --model "transformer-v2" \\\n  --epochs 50 \\\n  --lr 0.001',
            status: "pending",
        },
        {
            id: "stage-5",
            title: "Cross-Validation",
            description:
                "Run k-fold cross-validation to evaluate model generalization and detect overfitting.",
            command: 'python3 validate.py \\\n  --folds 5 \\\n  --metric "f1_score"',
            status: "pending",
        },
        {
            id: "stage-6",
            title: "Export Analytics",
            description:
                "Generate final reports and export analytics dashboard data to the visualization layer.",
            command: 'python3 export.py \\\n  --format "parquet" \\\n  --dashboard true',
            status: "pending",
        },
    ],
};
