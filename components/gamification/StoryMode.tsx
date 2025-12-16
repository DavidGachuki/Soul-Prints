import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, Check } from 'lucide-react';
import { SOUL_JOURNEY_SCENARIOS, GameScenario, GameScenarioOption } from '../../data/soulJourneyData';
import { saveQuestionnaireAnswers } from '../../services/profileCompletionService';

interface StoryModeProps {
    userId: string;
    onComplete: () => void;
    onExit: () => void;
}

export const StoryMode: React.FC<StoryModeProps> = ({ userId, onComplete, onExit }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isAnimating, setIsAnimating] = useState(false);
    const [showTransition, setShowTransition] = useState(false);

    // Total scenarios
    const totalScenarios = SOUL_JOURNEY_SCENARIOS.length;
    const currentScenario = SOUL_JOURNEY_SCENARIOS[currentIndex];

    // Handle User Choice
    const handleOptionSelect = async (option: GameScenarioOption) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setShowTransition(true);

        // Save mapped answers to local state
        const newAnswers = { ...answers, ...option.mappedAnswers };
        setAnswers(newAnswers);

        // Save to DB incrementally (or batch at end - focusing on incremental for safety)
        await saveQuestionnaireAnswers(userId, option.mappedAnswers);

        // Delay for visual transition
        setTimeout(() => {
            if (currentIndex < totalScenarios - 1) {
                setCurrentIndex(prev => prev + 1);
                setShowTransition(false);
                setIsAnimating(false);
            } else {
                handleFinish();
            }
        }, 1500);
    };

    const handleFinish = () => {
        onComplete();
    };

    // Calculate progress
    const progress = ((currentIndex + 1) / totalScenarios) * 100;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-1000 ${currentScenario.backgroundClass}`}>

            {/* Background Texture/Overlay */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>

            {/* Main Game Container */}
            <div className="relative w-full max-w-6xl h-full md:h-[90vh] md:rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 overflow-hidden flex flex-col">

                {/* Header: Progress & Exit */}
                <div className="flex items-center justify-between p-6 md:p-8 z-10">
                    <button onClick={onExit} className="text-white/60 hover:text-white transition-colors text-sm font-medium uppercase tracking-wider">
                        Exit Journey
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-white/80 font-serif-display text-lg">
                            Chapter {currentIndex + 1} <span className="text-white/40">/ {totalScenarios}</span>
                        </span>
                        <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 md:p-12 gap-12 relative z-10">

                    {/* Left: Scenario Text */}
                    <AnimatePresence mode="wait">
                        {!showTransition && (
                            <motion.div
                                key={currentScenario.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex-1 space-y-6 max-w-xl"
                            >
                                <h2 className="font-serif-display text-5xl md:text-6xl text-white leading-tight drop-shadow-sm">
                                    {currentScenario.title}
                                </h2>
                                <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed">
                                    {currentScenario.scenario}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Right: Options Grid */}
                    <AnimatePresence mode="wait">
                        {!showTransition ? (
                            <motion.div
                                key={`options-${currentScenario.id}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
                                exit={{ opacity: 0, x: 50 }}
                                className="flex-1 w-full max-w-md grid grid-cols-1 gap-4"
                            >
                                {currentScenario.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionSelect(option)}
                                        className="group relative flex items-center gap-4 p-5 bg-white/90 hover:bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left"
                                    >
                                        <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-900 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                                            <option.icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-stone-900 text-lg">{option.text}</h4>
                                            {option.description && (
                                                <p className="text-stone-500 text-sm mt-1">{option.description}</p>
                                            )}
                                        </div>
                                        <ChevronRight className="ml-auto text-stone-300 group-hover:text-stone-900 transition-colors" />
                                    </button>
                                ))}
                            </motion.div>
                        ) : (
                            /* Transition State Display */
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <div className="text-center text-white space-y-4">
                                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                                    <p className="font-serif-display text-2xl tracking-wide">Weaving your fate...</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};
