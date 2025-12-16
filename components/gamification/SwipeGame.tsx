import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Check, X as XIcon } from 'lucide-react';
import { LIFESTYLE_CARDS } from '../../data/arcadeModeData';


interface SwipeGameProps {
    onComplete: (answers: any) => void;
}

export const SwipeGame: React.FC<SwipeGameProps> = ({ onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<any>({});


    // Swipe Logic
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-30, 30]);
    const opacityYes = useTransform(x, [50, 150], [0, 1]);
    const opacityNo = useTransform(x, [-50, -150], [0, 1]);
    const bgYes = useTransform(x, [0, 200], ["rgba(34, 197, 94, 0)", "rgba(34, 197, 94, 0.2)"]);
    const bgNo = useTransform(x, [0, -200], ["rgba(239, 68, 68, 0)", "rgba(239, 68, 68, 0.2)"]);

    const currentCard = LIFESTYLE_CARDS[currentIndex];

    const handleSwipe = (direction: 'left' | 'right') => {

        const newAnswers = { ...answers };

        if (direction === 'right') {
            Object.assign(newAnswers, currentCard.yesValue);
        } else {
            Object.assign(newAnswers, currentCard.noValue);
        }

        setAnswers(newAnswers);

        if (currentIndex < LIFESTYLE_CARDS.length - 1) {
            setCurrentIndex(prev => prev + 1);
            x.set(0); // Reset position
        } else {
            onComplete(newAnswers);
        }
    };

    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.x > 100) {
            handleSwipe('right');
        } else if (info.offset.x < -100) {
            handleSwipe('left');
        }
    };

    if (!currentCard) return null;

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Background Color Shift */}
            <motion.div style={{ backgroundColor: x.get() > 0 ? bgYes : bgNo }} className="absolute inset-0 transition-colors pointer-events-none" />

            <div className="absolute top-8 text-center z-20">
                <h2 className="text-3xl font-black text-white italic tracking-tighter drop-shadow-md">
                    VIBE CHECK
                </h2>
                <p className="text-white/80 text-sm font-medium">Swipe Right for YES, Left for NO</p>
            </div>

            <div className="relative w-full max-w-sm aspect-[3/4] z-10">
                <motion.div
                    key={currentCard.id}
                    style={{ x, rotate, touchAction: 'none' }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing border-4 border-white"
                    whileTap={{ scale: 1.05 }}
                >
                    <img
                        src={currentCard.image}
                        alt="Lifestyle"
                        className="w-full h-3/4 object-cover pointer-events-none"
                    />
                    <div className="h-1/4 bg-white p-6 flex items-center justify-center text-center">
                        <h3 className="font-serif-display text-2xl text-stone-900 leading-tight">
                            {currentCard.text}
                        </h3>
                    </div>

                    {/* Overlay Indicators */}
                    <motion.div style={{ opacity: opacityYes }} className="absolute top-8 left-8 border-4 border-green-500 rounded-xl px-4 py-2 rotate-[-15deg]">
                        <span className="text-4xl font-black text-green-500 uppercase tracking-widest">YES</span>
                    </motion.div>
                    <motion.div style={{ opacity: opacityNo }} className="absolute top-8 right-8 border-4 border-red-500 rounded-xl px-4 py-2 rotate-[15deg]">
                        <span className="text-4xl font-black text-red-500 uppercase tracking-widest">NO</span>
                    </motion.div>

                </motion.div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-10 flex gap-8 z-20">
                <button
                    onClick={() => handleSwipe('left')}
                    className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-transform"
                >
                    <XIcon size={32} strokeWidth={3} />
                </button>
                <button
                    onClick={() => handleSwipe('right')}
                    className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-green-500 hover:scale-110 active:scale-95 transition-transform"
                >
                    <Check size={32} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};
