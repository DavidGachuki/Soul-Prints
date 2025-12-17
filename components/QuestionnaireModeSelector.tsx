import React from 'react';
import { ClipboardList, Sparkles, ArrowRight, Gamepad2 } from 'lucide-react';

interface QuestionnaireModeSelectorProps {
    onSelectMode: (mode: 'quiz' | 'game' | 'arcade' | 'story' | 'quicklist') => void;
}

export const QuestionnaireModeSelector: React.FC<QuestionnaireModeSelectorProps> = ({ onSelectMode }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto p-6 animate-fade-in">
            <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-xs font-medium tracking-[0.2em] uppercase">
                    <Sparkles size={14} className="text-purple-600" />
                    <span>Build Your Soul Print</span>
                </div>
                <h2 className="font-serif-display text-4xl md:text-5xl text-stone-900 leading-tight">
                    Choose your style.
                </h2>
                <p className="text-stone-500 max-w-lg mx-auto text-lg font-light leading-relaxed">
                    Complete your profile to unlock deeper AI matching. Pick the format that suits your vibe.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 w-full px-4">
                {/* Option 1: Arcade Mode (NEW) */}
                <button
                    onClick={() => onSelectMode('arcade')}
                    className="group relative flex flex-col items-center text-center p-6 bg-stone-900 border border-stone-900 rounded-2xl hover:bg-stone-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="relative z-10 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                        <Gamepad2 size={32} className="text-purple-300" />
                    </div>

                    <h3 className="relative z-10 font-serif-display text-xl text-white mb-2">
                        Arcade Mode
                    </h3>
                    <p className="relative z-10 text-stone-400 text-xs leading-relaxed mb-4">
                        Play 4 mini-games: Pop bubbles, swipe cards, defend dealbreakers, rank priorities.
                    </p>

                    <span className="relative z-10 inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider rounded-full border border-purple-500/30">
                        Most Fun
                    </span>
                </button>

                {/* Option 2: Story Mode */}
                <button
                    onClick={() => onSelectMode('story')}
                    className="group relative flex flex-col items-center text-center p-6 bg-white border border-stone-200 rounded-2xl hover:border-purple-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="relative z-10 w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-50 transition-colors">
                        <Sparkles size={32} className="text-stone-400 group-hover:text-purple-500 transition-colors" />
                    </div>

                    <h3 className="relative z-10 font-serif-display text-xl text-stone-900 mb-2">
                        Story Mode
                    </h3>
                    <p className="relative z-10 text-stone-500 text-xs leading-relaxed mb-4">
                        Answer 8 reflective prompts about relationships, growth, and values.
                    </p>

                    <span className="relative z-10 inline-block px-3 py-1 bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-500/20">
                        Most Depth
                    </span>
                </button>

                {/* Option 3: Quick List */}
                <button
                    onClick={() => onSelectMode('quicklist')}
                    className="group relative flex flex-col items-center text-center p-6 bg-white border border-stone-200 rounded-2xl hover:border-stone-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="relative z-10 w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-stone-100 transition-colors">
                        <ClipboardList size={32} className="text-stone-400 group-hover:text-stone-600 transition-colors" />
                    </div>

                    <h3 className="relative z-10 font-serif-display text-xl text-stone-900 mb-2">
                        Quick List
                    </h3>
                    <p className="relative z-10 text-stone-500 text-xs leading-relaxed mb-4">
                        Check 20 items across values, personality, lifestyle, and relationship needs.
                    </p>

                    <span className="relative z-10 inline-block px-3 py-1 bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-500/20">
                        Quickest
                    </span>
                </button>
            </div>
        </div>
    );
};
