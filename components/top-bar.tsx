import { Search, Bell } from "lucide-react";

export function TopBar() {
    return (
        <div className="h-14 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2 text-zinc-300 font-medium">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500"></div>
                <span>Orca</span>
                <span className="text-[10px] text-zinc-600 font-semibold tracking-widest ml-2">
                    STUDY
                </span>
            </div>

            <div className="flex items-center gap-4 text-zinc-400">
                <button className="hover:text-white transition-colors">
                    <Search className="w-5 h-5" />
                </button>
                <button className="hover:text-white transition-colors relative">
                    <Bell className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
