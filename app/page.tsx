"use client";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { HeroSection } from "@/components/hero";
import { QuickActions } from "@/components/quick-actions";
import { CommandInput } from "@/components/command-input";

export default function Home() {
  return (
    <div className="flex h-screen bg-[#0f1117] text-white overflow-hidden font-sans selection:bg-blue-500/30">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-auto relative">
        <TopBar />
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <HeroSection />
          <CommandInput />
          <QuickActions />
        </div>
      </main>
    </div>
  );
}
