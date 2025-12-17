import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, BookOpen, AlertCircle } from 'lucide-react';
import { STORY_PROMPTS } from '../../data/storyModeQuestions';
import { saveQuestionnaireAnswers } from '../../services/profileCompletionService';

interface StoryModeProps {
    userId: string;
    onComplete: () => void;
    onExit: () => void;
}

export const StoryMode: React.FC<StoryModeProps> = ({ userId, onComplete, onExit }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState<Record<string, string>>({});
    const [currentText, setCurrentText] = useState('');

    const currentPrompt = STORY_PROMPTS[currentIndex];
    const progress = ((currentIndex + 1) / STORY_PROMPTS.length) * 100;

    const handleNext = async () => {
        // Save current response
        if (currentText.trim()) {
            const newResponses = {
                ...responses,
                [currentPrompt.id]: currentText
            };
            setResponses(newResponses);

            // Save to database incrementally
            await saveQuestionnaireAnswers(userId, {
                story_responses: newResponses,
                questionnaire_mode: 'story'
            });
        }

        if (currentIndex < STORY_PROMPTS.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setCurrentText(responses[STORY_PROMPTS[currentIndex + 1]?.id] || '');
        } else {
            // Completed all prompts
            onComplete();
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setCurrentText(responses[STORY_PROMPTS[currentIndex - 1]?.id] || '');
        }
    };

    const handleSkip = async () => {
        // Save empty response to track skips
        const newResponses = {
            ...responses,
            [currentPrompt.id]: '[skipped]'
        };
        setResponses(newResponses);

        await saveQuestionnaireAnswers(userId, {
            story_responses: newResponses,
            questionnaire_mode: 'story'
        });

        if (currentIndex < STORY_PROMPTS.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setCurrentText(responses[STORY_PROMPTS[currentIndex + 1]?.id] || '');
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-stone-900 to-stone-900"></div>

            {/* Exit Button */}
            <button
                onClick={onExit}
                className="absolute top-6 right-6 z-50 text-white/50 hover:text-white uppercase text-xs font-bold tracking-widest transition-colors"
            >
                Exit
            </button>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-stone-800">
                <motion.div
                    className="h-full bg-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Content */}
            <div className="relative w-full max-w-3xl mx-auto px-8 py-16">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full"
                    >
                        {/* Header */}
                        <div className="text-center mb-12">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <BookOpen className="text-amber-500" size={32} />
                                <h2 className="text-3xl font-serif-display text-white">
                                    Story Mode
                                </h2>
                            </div>
                            <p className="text-white/60 text-sm">
                                Question {currentIndex + 1} of {STORY_PROMPTS.length}
                            </p>
                        </div>

                        {/* Prompt Card */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 mb-8">
                            {currentPrompt.sensitive && (
                                <div className="flex items-start gap-3 mb-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                    <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                                    <p className="text-sm text-amber-200">
                                        This question touches on sensitive topics. Feel free to skip if uncomfortable.
                                    </p>
                                </div>
                            )}

                            <h3 className="text-xl text-white font-serif-display mb-6 leading-relaxed">
                                {currentPrompt.prompt}
                            </h3>

                            <textarea
                                value={currentText}
                                onChange={(e) => setCurrentText(e.target.value)}
                                placeholder={currentPrompt.placeholder}
                                maxLength={currentPrompt.maxLength}
                                className="w-full h-48 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 resize-none focus:outline-none focus:border-amber-500/50 transition-colors"
                            />

                            <div className="flex justify-between items-center mt-4">
                                <span className="text-xs text-white/40">
                                    {currentText.length} / {currentPrompt.maxLength} characters
                                </span>
                                {currentPrompt.citation && (
                                    <span className="text-xs text-white/30 italic">
                                        {currentPrompt.citation}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={handleBack}
                                disabled={currentIndex === 0}
                                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ArrowLeft size={20} />
                                <span>Back</span>
                            </button>

                            <button
                                onClick={handleSkip}
                                className="px-6 py-3 rounded-lg text-white/50 hover:text-white/80 transition-colors text-sm"
                            >
                                Skip if uncomfortable
                            </button>

                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors"
                            >
                                <span>{currentIndex === STORY_PROMPTS.length - 1 ? 'Complete' : 'Next'}</span>
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
