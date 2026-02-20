'use client';

import { useStore } from '@/lib/orca-store';
import { TopBar } from './components/TopBar';
import { PromptInput } from './components/PromptInput';
import { IntentPreview } from './components/IntentPreview';
import { WorkflowTracker } from './components/WorkflowTracker';
import { CompletionPanel } from './components/CompletionPanel';
import { ToastContainer } from './components/Toast';

export default function OrcaPage() {
    const appState = useStore((s) => s.appState);

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            <TopBar />

            <main>
                {appState === 'prompt' && <PromptInput />}
                {appState === 'preview' && <IntentPreview />}
                {appState === 'executing' && <WorkflowTracker />}
                {appState === 'completed' && <CompletionPanel />}
            </main>

            <ToastContainer />

            <footer className="fixed bottom-0 left-0 right-0 py-3 text-center pointer-events-none">
                <p className="text-[11px] text-[#2A2A2A]">Powered by AccomplishAI + GPT-4o</p>
            </footer>
        </div>
    );
}
