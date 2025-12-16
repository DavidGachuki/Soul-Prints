// Profile Enhancement Banner Component
// Prompts users to complete questionnaire for better matches
// Revamped "Editorial" Design

import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { getProfileCompletionStatus } from '../services/profileCompletionService';

interface ProfileEnhancementBannerProps {
    userId: string;
    onStartQuestionnaire: () => void;
}

export const ProfileEnhancementBanner: React.FC<ProfileEnhancementBannerProps> = ({ userId, onStartQuestionnaire }) => {
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
        <div className="w-full max-w-4xl mx-auto mb-10 px-4 animate-fade-in">
            <div className="relative bg-[#FDFBF7] border border-stone-200 rounded-xl overflow-hidden shadow-sm group hover:shadow-md transition-shadow duration-500">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                    {/* Left: Content */}
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-xs tracking-wider uppercase font-medium">
                            <Sparkles size={12} />
                            <span>Soul Compatibility</span>
                        </div>

                        <h3 className="font-serif-display text-2xl md:text-3xl text-stone-900 leading-tight">
                            Unlock your true match potential.
                        </h3>

                        <p className="text-stone-500 font-light leading-relaxed max-w-lg mx-auto md:mx-0">
                            We've curated 13 deep questions to help our algorithm understand your heart.
                            <span className="italic block mt-1 text-stone-600">"What matters most to you in life?"</span>
                        </p>

                        <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                            <div className="flex flex-col gap-1 min-w-[100px]">
                                <div className="h-1 w-full bg-stone-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-stone-800 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${completion}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs text-stone-400 font-medium tracking-wide">
                                    {completion}% COMPLETE
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Action */}
                    <div className="flex-shrink-0">
                        <button
                            onClick={onStartQuestionnaire}
                            className="group relative px-8 py-4 bg-stone-900 text-[#FDFBF7] rounded-lg overflow-hidden transition-all hover:bg-stone-800"
                        >
                            <div className="relative z-10 flex items-center gap-3 font-serif-display text-lg tracking-wide">
                                <span>Begin Questionnaire</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
