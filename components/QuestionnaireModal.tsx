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

import { QuestionnaireModeSelector } from './QuestionnaireModeSelector';
import { StoryMode } from './gamification/StoryMode';
import { ArcadeMode } from './gamification/ArcadeMode';
import { QuickListMode } from './gamification/QuickListMode';

export const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({ userId, isOpen, onClose, onComplete }) => {
    const [mode, setMode] = useState<'select' | 'quiz' | 'game' | 'arcade' | 'story' | 'quicklist'>('select');
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
            setMode('select'); // Reset mode
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

    const canProceed = () => {
        if (!currentPrompt) return false;
        const answer = answers[currentPrompt.section];

        if (currentPrompt.questionType === 'multi_select') {
            return Array.isArray(answer) && answer.length > 0;
        }

        return !!answer;
    };

    const renderInput = () => {
        if (!currentPrompt) return null;

        // Multiple Choice
        if (currentPrompt.questionType === 'multiple_choice') {
            return (
                <div className="grid gap-3">
                    {currentPrompt.options?.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(option)}
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
            );
        }

        // Multi Select
        if (currentPrompt.questionType === 'multi_select') {
            return (
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
            );
        }

        // Text Input
        if (currentPrompt.questionType === 'text') {
            return (
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
            );
        }

        return null;
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

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

            {/* Content Switch */}
            {mode === 'select' && (
                <div className="relative z-10 w-full max-w-5xl h-[80vh] bg-white rounded-3xl shadow-2xl overflow-y-auto overflow-x-hidden animate-scale-in">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 transition-colors z-20"
                    >
                        <X size={24} className="text-stone-500" />
                    </button>
                    <QuestionnaireModeSelector onSelectMode={setMode} />
                </div>
            )}

            {mode === 'game' && (
                <StoryMode
                    userId={userId}
                    onComplete={() => {
                        onComplete();
                        onClose();
                    }}
                    onExit={() => setMode('select')}
                />
            )}

            {mode === 'arcade' && (
                <ArcadeMode
                    userId={userId}
                    onComplete={() => {
                        onComplete();
                        onClose();
                    }}
                    onExit={() => setMode('select')}
                />
            )}

            {mode === 'story' && (
                <StoryMode
                    userId={userId}
                    onComplete={() => {
                        onComplete();
                        onClose();
                    }}
                    onExit={() => setMode('select')}
                />
            )}

            {mode === 'quicklist' && (
                <QuickListMode
                    userId={userId}
                    onComplete={() => {
                        onComplete();
                        onClose();
                    }}
                    onExit={() => setMode('select')}
                />
            )}

            {mode === 'quiz' && (
                <div className="relative z-10 w-full max-w-2xl bg-[#FDFBF7] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in border border-stone-200">

                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-stone-100">
                        <div
                            className="h-full bg-stone-900 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between p-6 pb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase">
                                Question {currentIndex + 1}/{prompts.length}
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-8 py-2">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
                            </div>
                        ) : currentPrompt ? (
                            <div className="py-4 animate-fade-in-right">
                                {/* Section Tag */}
                                <div className="inline-block px-3 py-1 mb-6 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider">
                                    {currentPrompt.section}
                                </div>

                                <h3 className="font-serif-display text-2xl md:text-3xl text-stone-900 leading-tight mb-8">
                                    {currentPrompt.questionText}
                                </h3>

                                <div className="space-y-3">
                                    {renderInput()}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-stone-500">All set! Completing your profile...</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-4 bg-[#FDFBF7] border-t border-stone-100 flex items-center justify-between">
                        <button
                            onClick={handleBack}
                            disabled={currentIndex === 0}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${currentIndex === 0
                                ? 'text-stone-300 cursor-not-allowed'
                                : 'text-stone-500 hover:text-stone-900'
                                }`}
                        >
                            <ChevronLeft size={16} />
                            Back
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${canProceed()
                                ? 'bg-stone-900 text-white shadow-lg hover:bg-stone-800 hover:scale-105 transform'
                                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                }`}
                        >
                            {currentIndex === prompts.length - 1 ? 'Complete' : 'Next'}
                            {currentIndex === prompts.length - 1 ? <Check size={16} /> : <ArrowRight size={16} />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

