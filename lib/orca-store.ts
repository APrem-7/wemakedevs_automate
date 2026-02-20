import { create } from 'zustand';

export type AppState = 'prompt' | 'preview' | 'executing' | 'completed';
export type StepStatus = 'pending' | 'active' | 'completed';
export type ConnectionStatus = 'connected' | 'processing' | 'error';

export interface WorkflowStep {
    id: string;
    title: string;
    status: StepStatus;
    instruction?: string;
    requiresLink?: boolean;
    linkPlaceholder?: string;
    completedAt?: string;
}

export interface WorkflowIntent {
    title: string;
    icon: string;
    source: string;
    process: string;
    output: string;
    estimatedTime: string;
    steps: WorkflowStep[];
}

export interface Toast {
    id: string;
    message: string;
    type: 'info' | 'success' | 'error';
}

interface StoreState {
    appState: AppState;
    connectionStatus: ConnectionStatus;
    currentPrompt: string;
    workflowIntent: WorkflowIntent | null;
    currentStepIndex: number;
    workflowStartTime: number | null;
    resultLink: string | null;
    toasts: Toast[];

    setPrompt: (prompt: string) => void;
    submitPrompt: () => void;
    startWorkflow: () => void;
    cancelWorkflow: () => void;
    markStepComplete: () => void;
    submitLink: (link: string) => void;
    resetToPrompt: () => void;
    addToast: (message: string, type: Toast['type']) => void;
    removeToast: (id: string) => void;
}

const mockWorkflowIntent: WorkflowIntent = {
    title: 'Generate Flashcards',
    icon: '📋',
    source: 'Notion — "OS Course Notes"',
    process: 'LLM cleanup → structured cards',
    output: 'NotebookLM study materials',
    estimatedTime: '~10 min',
    steps: [
        {
            id: '1',
            title: 'Export Notion pages',
            status: 'pending',
            instruction:
                'Open Notion, navigate to "OS Course Notes" workspace, select all pages, export as Markdown, and save to Downloads folder',
        },
        {
            id: '2',
            title: 'Clean up content with LLM',
            status: 'pending',
            instruction:
                'Process the exported Markdown files through GPT-4 to extract key concepts and format them as question-answer pairs suitable for flashcards',
        },
        {
            id: '3',
            title: 'Upload to NotebookLM',
            status: 'pending',
            instruction:
                'Navigate to NotebookLM, create a new notebook titled "OS Course Flashcards", and upload the processed content',
        },
        {
            id: '4',
            title: 'Get share link',
            status: 'pending',
            requiresLink: true,
            linkPlaceholder: 'https://notebooklm.google.com/...',
        },
    ],
};

export const useStore = create<StoreState>((set, get) => ({
    appState: 'prompt',
    connectionStatus: 'connected',
    currentPrompt: '',
    workflowIntent: null,
    currentStepIndex: 0,
    workflowStartTime: null,
    resultLink: null,
    toasts: [],

    setPrompt: (prompt: string) => set({ currentPrompt: prompt }),

    submitPrompt: () => {
        set({
            appState: 'preview',
            workflowIntent: mockWorkflowIntent,
        });
    },

    startWorkflow: () => {
        const intent = get().workflowIntent;
        if (!intent) return;

        const updatedSteps = intent.steps.map((s, i) => ({
            ...s,
            status: i === 0 ? ('active' as StepStatus) : s.status,
        }));

        set({
            appState: 'executing',
            connectionStatus: 'processing',
            workflowIntent: { ...intent, steps: updatedSteps },
            currentStepIndex: 0,
            workflowStartTime: Date.now(),
        });
    },

    cancelWorkflow: () => {
        set({
            appState: 'prompt',
            connectionStatus: 'connected',
            currentPrompt: '',
            workflowIntent: null,
            currentStepIndex: 0,
            workflowStartTime: null,
        });
        get().addToast('Workflow cancelled', 'info');
    },

    markStepComplete: () => {
        const { workflowIntent, currentStepIndex } = get();
        if (!workflowIntent) return;

        const updatedSteps = workflowIntent.steps.map((s, i) => {
            if (i === currentStepIndex)
                return { ...s, status: 'completed' as StepStatus, completedAt: 'Just now' };
            if (i === currentStepIndex + 1)
                return { ...s, status: 'active' as StepStatus };
            return s;
        });

        const nextIndex = currentStepIndex + 1;
        const isLastStep = nextIndex >= updatedSteps.length;

        set({
            workflowIntent: { ...workflowIntent, steps: updatedSteps },
            currentStepIndex: nextIndex,
        });

        if (isLastStep) {
            set({ appState: 'completed', connectionStatus: 'connected' });
        }
    },

    submitLink: (link: string) => {
        set({ resultLink: link });
        get().markStepComplete();
    },

    resetToPrompt: () => {
        set({
            appState: 'prompt',
            connectionStatus: 'connected',
            currentPrompt: '',
            workflowIntent: null,
            currentStepIndex: 0,
            workflowStartTime: null,
            resultLink: null,
        });
    },

    addToast: (message: string, type: Toast['type']) => {
        const id = Date.now().toString();
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => get().removeToast(id), 2000);
    },

    removeToast: (id: string) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    },
}));
