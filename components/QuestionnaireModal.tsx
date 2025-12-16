// Questionnaire Modal Component
// Interactive questionnaire flow for profile completion
// Revamped "Editorial" Design

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, ArrowRight } from 'lucide-react';
import { getQuestionnairePrompts, saveQuestionnaireAnswers, QuestionnairePrompt } from '../services/profileCompletionService';

interface QuestionnaireModalProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({ userId, isOpen, onClose, onComplete }) => {
    const [prompts, setPrompts] = useState<QuestionnairePrompt[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadPrompts();
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            document.body.style.overflow = 'unset';
            setPrompts([]); // Reset to ensure fresh load
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const loadPrompts = async () => {
        setLoading(true);
        const allPrompts = await getQuestionnairePrompts();
        setPrompts(allPrompts);
        setLoading(false);
    };

    const currentPrompt = prompts[currentIndex];

    // Calculate progress for the thin line
    const progress = ((currentIndex) / (prompts.length - 1)) * 100;

    const handleAnswer = (value: any) => {
        setAnswers(prev => ({
            ...prev,
            [currentPrompt.section]: value
        }));
    };

    const handleNext = () => {
        if (currentIndex < prompts.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsExiting(false);
            onClose();
        }, 300);
    };

    const handleSubmit = async () => {
        // Map answers to questionnaire format
        const questionnaireData: any = {};

        Object.entries(answers).forEach(([section, value]) => {
            if (section === 'values') questionnaireData.coreValues = value;
            if (section === 'goals') questionnaireData.relationshipTimeline = value;
            if (section === 'communication') questionnaireData.communicationPreference = value;
            if (section === 'lifestyle') questionnaireData.activityLevel = value;
            if (section === 'dealbreakers') questionnaireData.absoluteDealbreakers = value;
            if (section === 'personality') questionnaireData.loveLanguagePrimary = value;
            if (section === 'deep') questionnaireData.idealWeekend = value;
        });

        const success = await saveQuestionnaireAnswers(userId, questionnaireData);

        if (success) {
            onComplete();
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#FDFBF7] transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>

            {/* Minimal Header */}
            <div className="absolute top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <span className="font-serif-display text-xl tracking-wide">Soul Prints</span>
                    <span className="h-4 w-[1px] bg-stone-300"></span>
                    <span className="text-xs uppercase tracking-widest text-stone-500 font-medium">Questionnaire</span>
                </div>
                <button
                    onClick={handleClose}
                    className="p-2 hover:bg-stone-100 rounded-full transition-colors group"
                >
                    <X size={24} className="text-stone-400 group-hover:text-stone-900 transition-colors" />
                </button>
            </div>

            {/* Main Content Container */}
            <div className="w-full max-w-3xl px-6 md:px-12 flex flex-col items-center justify-center min-h-screen pt-20 pb-24">

                {loading ? (
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                        <div className="w-12 h-12 rounded-full border-b-2 border-stone-900 animate-spin"></div>
                        <p className="text-stone-400 font-light tracking-wide">Loading your soulful journey...</p>
                    </div>
                ) : currentPrompt ? (
                    <div className="w-full space-y-10 animate-fade-in-up">

                        {/* Section Tag */}
                        <div className="flex justify-center">
                            <span className="px-4 py-1.5 rounded-full bg-stone-100 text-stone-500 text-xs font-medium uppercase tracking-widest">
                                {currentPrompt.section.replace('_', ' ')} • {currentIndex + 1} of {prompts.length}
                            </span>
                        </div>

                        {/* Question */}
                        <h2 className="font-serif-display text-3xl md:text-5xl text-center text-stone-900 leading-tight">
                            {currentPrompt.questionText}
                        </h2>

                        {/* Options / Inputs */}
                        <div className="max-w-xl mx-auto w-full mt-8">

                            {/* Multiple Choice */}
                            {currentPrompt.questionType === 'multiple_choice' && (
                                <div className="grid gap-3">
                                    {currentPrompt.options?.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                handleAnswer(option);
                                                // Optional: Auto-advance after small delay for single choice (removed for clarity/user control)
                                            }}
                                            className={`group w-full p-5 md:p-6 rounded-xl border transition-all duration-300 text-left relative focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 ${answers[currentPrompt.section] === option
                                                    ? 'border-stone-900 bg-stone-900 text-white shadow-lg'
                                                    : 'border-stone-200 bg-white hover:border-stone-400 hover:shadow-md text-stone-600'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`text-lg font-medium transition-colors ${answers[currentPrompt.section] === option ? 'text-white' : 'text-stone-700'
                                                    }`}>
                                                    {option}
                                                </span>
                                                {answers[currentPrompt.section] === option && (
                                                    <Check className="text-white" size={20} />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Multi Select */}
                            {currentPrompt.questionType === 'multi_select' && (
                                <div className="grid gap-3">
                                    <p className="text-center text-stone-400 text-sm mb-2">Select all that apply</p>
                                    {currentPrompt.options?.map((option, idx) => {
                                        const selected = answers[currentPrompt.section]?.includes(option) || false;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    const current = answers[currentPrompt.section] || [];
                                                    const updated = selected
                                                        ? current.filter((v: string) => v !== option)
                                                        : [...current, option];
                                                    handleAnswer(updated);
                                                }}
                                                className={`group w-full p-4 md:p-5 rounded-xl border transition-all duration-300 text-left relative focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 ${selected
                                                        ? 'border-stone-900 bg-stone-50 text-stone-900'
                                                        : 'border-stone-200 bg-white hover:border-stone-300 text-stone-600'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-lg font-medium transition-colors ${selected ? 'text-stone-900' : 'text-stone-600'
                                                        }`}>
                                                        {option}
                                                    </span>
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selected ? 'bg-stone-900 border-stone-900' : 'border-stone-300 bg-white'
                                                        }`}>
                                                        {selected && <Check className="text-white" size={14} />}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Text Input */}
                            {currentPrompt.questionType === 'text' && (
                                <div className="relative group">
                                    <textarea
                                        value={answers[currentPrompt.section] || ''}
                                        onChange={(e) => handleAnswer(e.target.value)}
                                        placeholder="Type your answer here..."
                                        className="w-full p-6 text-xl bg-transparent border-b-2 border-stone-200 focus:border-stone-900 focus:outline-none min-h-[150px] resize-none font-serif placeholder:font-sans placeholder:text-stone-300 transition-colors"
                                        autoFocus
                                    />
                                    <div className="absolute bottom-4 right-2 text-stone-400 text-sm pointer-events-none">
                                        Shift + Enter for new line
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                ) : null}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 p-6 md:p-8 bg-[#FDFBF7]/90 backdrop-blur-sm border-t border-stone-100 z-20 flex items-center justify-between">

                {/* Progress Line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-stone-100">
                    <div
                        className="h-full bg-stone-900 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <button
                    onClick={handleBack}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-6 py-3 text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    <ChevronLeft size={20} />
                    <span className="hidden md:inline">Previous</span>
                </button>

                <button
                    onClick={handleNext}
                    disabled={!answers[currentPrompt?.section] || (Array.isArray(answers[currentPrompt?.section]) && answers[currentPrompt?.section].length === 0)}
                    className="flex items-center gap-3 px-8 py-4 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                    <span>{currentIndex === prompts.length - 1 ? 'Complete Profile' : 'Continue'}</span>
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};
