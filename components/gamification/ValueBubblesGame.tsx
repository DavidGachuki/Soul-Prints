import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VALUE_BUBBLES } from '../../data/arcadeModeData';


interface ValueBubblesGameProps {
    onComplete: (selectedValues: string[]) => void;
}

export const ValueBubblesGame: React.FC<ValueBubblesGameProps> = ({ onComplete }) => {
    const [visibleBubbles, setVisibleBubbles] = useState<typeof VALUE_BUBBLES>([]);
    const [caughtBubbles, setCaughtBubbles] = useState<string[]>([]);
    // Sound removed

    // Initial load
    useEffect(() => {
        setVisibleBubbles(VALUE_BUBBLES);
    }, []);

    // Win Condition: Catch 5 bubbles
    useEffect(() => {
        if (caughtBubbles.length >= 5) {
            const timeout = setTimeout(() => {
                handleFinish();
            }, 1000); // Reduced wait time since no sound
            return () => clearTimeout(timeout);
        }
    }, [caughtBubbles]);

    const handleCatch = (value: string) => {
        if (caughtBubbles.length < 5 && !caughtBubbles.includes(value)) {
            setCaughtBubbles(prev => [...prev, value]);
        }
    };

    const handleFinish = () => {
        onComplete(caughtBubbles);
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
            {/* HUD */}
            <div className="absolute top-4 left-0 right-0 flex justify-center px-8 z-20">
                <div className="text-white font-bold text-2xl drop-shadow-md bg-stone-900/50 px-6 py-2 rounded-full backdrop-blur-sm border border-white/20">
                    Caught: <span className="text-yellow-400">{caughtBubbles.length}/5</span>
                </div>
            </div>

            <div className="text-center z-10 mb-8 pointer-events-none">
                <h2 className="text-3xl font-black text-white italic tracking-tighter drop-shadow-lg animate-bounce">
                    POP YOUR VALUES!
                </h2>
                <p className="text-white/80 text-sm font-medium">Click to catch up to 5 bubbles!</p>
            </div>

            {/* Bubbles Area */}
            <div className="relative w-full max-w-2xl h-96">
                <AnimatePresence>
                    {visibleBubbles.map((bubble, index) => {
                        const isCaught = caughtBubbles.includes(bubble.value);
                        if (isCaught) return null;

                        // Fixed grid positions logic (PIXELS)
                        const row = Math.floor(index / 3);
                        const col = index % 3;
                        const xOffset = (col - 1) * 120;
                        const yOffset = (row - 1) * 80;

                        // Add organic jitter
                        const jitterX = (index % 2 === 0 ? 1 : -1) * 10;
                        const jitterY = (index % 3 === 0 ? -1 : 1) * 10;

                        return (
                            <motion.button
                                key={bubble.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: 1,
                                    opacity: 1,
                                    x: xOffset + jitterX,
                                    y: yOffset + jitterY,
                                    transition: {
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15,
                                        delay: index * 0.05
                                    }
                                }}
                                whileHover={{ scale: 1.15, zIndex: 50 }}
                                whileTap={{ scale: 0.9 }}
                                exit={{ scale: 0, opacity: 0 }}
                                onClick={() => handleCatch(bubble.value)}
                                className="absolute top-1/2 left-1/2 w-24 h-24 -ml-12 -mt-12 rounded-full flex flex-col items-center justify-center p-2 cursor-pointer z-20 bg-gradient-to-br from-white/95 to-white/60 backdrop-blur-md border border-white/60 shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                                style={{
                                    boxShadow: `0 0 30px ${['#F472B6', '#60A5FA', '#34D399', '#FBBF24'][index % 4]}60`
                                }}
                            >
                                <bubble.icon size={28} className="text-stone-900 mb-1" />
                                <span className="text-[10px] uppercase font-bold text-stone-900 leading-none tracking-wide">{bubble.label}</span>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};
