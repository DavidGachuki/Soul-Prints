// Profile Enhancement Banner Component
// Prompts users to complete questionnaire for better matches
// Revamped "Editorial" Design

import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Star, X } from 'lucide-react';
import { getProfileCompletionStatus } from '../services/profileCompletionService';

interface ProfileEnhancementBannerProps {
    userId: string;
    onStartQuestionnaire: () => void;
    onDismiss: () => void;
}

export const ProfileEnhancementBanner: React.FC<ProfileEnhancementBannerProps> = ({ userId, onStartQuestionnaire, onDismiss }) => {
    const [completion, setCompletion] = useState(0);
    const [show, setShow] = useState(false);

    useEffect(() => {
        checkCompletion();
    }, [userId]);

    const checkCompletion = async () => {
        const status = await getProfileCompletionStatus(userId);
        setCompletion(status.percentage);
        setShow(status.percentage < 100);
    };

    if (!show) return null;

    return (
        <div className="w-full animate-fade-in relative group/banner">
            <div className="relative bg-[#FDFBF7] border border-stone-200 p-6 md:px-8 md:py-6">
                {/* Close Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDismiss();
                    }}
                    className="absolute top-2 right-2 md:top-1/2 md:-translate-y-1/2 md:right-4 p-2 text-stone-300 hover:text-stone-900 transition-colors z-20"
                >
                    <X size={14} />
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
                    {/* Left: Indicator */}
                    <div className="flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-1 min-w-[120px]">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-medium">
                            Insight
                        </span>
                        <div className="flex items-center gap-2 w-full">
                            <span className="text-[10px] font-mono text-stone-400 whitespace-nowrap">
                                {completion}% COMPLETE
                            </span>
                            <div className="h-px bg-stone-200 w-16 md:hidden">
                                <div
                                    className="h-full bg-stone-900 transition-all duration-1000 ease-out"
                                    style={{ width: `${completion}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Middle: Content */}
                    <div className="flex-1 space-y-1 border-l-0 md:border-l border-stone-100 md:pl-8">
                        <h3 className="font-serif-display text-xl md:text-2xl text-stone-900 leading-tight">
                            Unlock your true match potential.
                        </h3>
                        <p className="text-sm text-stone-600 font-light leading-relaxed max-w-xl">
                            Choose your path: Arcade Mode, Story Mode, or Quick List to build your Soul Print.
                        </p>
                    </div>

                    {/* Desktop Progress Bar (Hidden on mobile used above) */}
                    <div className="hidden md:block w-32">
                        <div className="h-px bg-stone-200 w-full mb-2">
                            <div
                                className="h-full bg-stone-900 transition-all duration-1000 ease-out"
                                style={{ width: `${completion}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Right: Action */}
                    <div className="flex-shrink-0 md:mr-8">
                        <button
                            onClick={onStartQuestionnaire}
                            className="group flex items-center gap-3 px-6 py-3 bg-stone-900 text-[#FDFBF7] text-sm tracking-wide uppercase font-medium hover:bg-stone-800 transition-colors"
                        >
                            <span>Begin</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
