import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ValueBubblesGame } from './ValueBubblesGame';
import { SwipeGame } from './SwipeGame';
import { DealbreakerGame } from './DealbreakerGame';
import { PriorityPyramid } from './PriorityPyramid';
import { saveQuestionnaireAnswers } from '../../services/profileCompletionService';
import { Trophy } from 'lucide-react';


interface ArcadeModeProps {
    userId: string;
    onComplete: () => void;
    onExit: () => void;
}

export const ArcadeMode: React.FC<ArcadeModeProps> = ({ userId, onComplete, onExit }) => {
    const [level, setLevel] = useState(1);
    const [answers, setAnswers] = useState<any>({});
    const [showLevelIntro, setShowLevelIntro] = useState(true);

    const handleLevelComplete = async (levelData: any) => {
        const newAnswers = { ...answers, ...levelData };
        setAnswers(newAnswers);

        // Save intermediate results
        await saveQuestionnaireAnswers(userId, newAnswers);

        if (level < 4) { // Changed from 2 to 4 levels
            setShowLevelIntro(true);
            setLevel(prev => prev + 1);
        } else {
            handleVictory(newAnswers);
        }
    };

    const handleVictory = (finalAnswers: any) => {
        // Final save logic if needed, but we saved incrementally
        setTimeout(() => {
            onComplete();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-stone-900 animate-gradient-xy"></div>

            {/* Particles/Stars */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* Sound Toggle */}
            <div className="absolute top-6 right-24 z-50">

            </div>

            {/* Exit Button */}
            <button
                onClick={onExit}
                className="absolute top-6 right-6 z-50 text-white/50 hover:text-white uppercase text-xs font-bold tracking-widest transition-colors flex items-center gap-2"
            >
                <span>Exit Game</span>
            </button>

            {/* Content Area */}
            <div className="relative w-full h-full max-w-4xl mx-auto flex flex-col items-center justify-center">

                <AnimatePresence mode="wait">
                    {/* Level 1: Value Bubbles */}
                    {level === 1 && (
                        <motion.div
                            key="level1"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="w-full h-full"
                        >
                            <ValueBubblesGame
                                onComplete={(values) => handleLevelComplete({ coreValues: values })}
                            />
                        </motion.div>
                    )}

                    {/* Level 2: Swipe Game */}
                    {level === 2 && (
                        <motion.div
                            key="level2"
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className="w-full h-full"
                        >
                            <SwipeGame
                                onComplete={(swipeData) => handleLevelComplete(swipeData)}
                            />
                        </motion.div>
                    )}

                    {/* Level 3: Dealbreaker Defender */}
                    {level === 3 && (
                        <motion.div
                            key="level3"
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -100 }}
                            className="w-full h-full"
                        >
                            <DealbreakerGame
                                onComplete={(dealbreakers) => handleLevelComplete({ absoluteDealbreakers: dealbreakers })}
                            />
                        </motion.div>
                    )}

                    {/* Level 4: Priority Pyramid */}
                    {level === 4 && (
                        <motion.div
                            key="level4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="w-full h-full"
                        >
                            <PriorityPyramid
                                onComplete={(topPriorities) => handleLevelComplete({ lifeGoals: topPriorities })}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};
