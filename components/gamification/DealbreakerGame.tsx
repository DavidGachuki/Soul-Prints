import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, ShieldCheck } from 'lucide-react';
import { DEALBREAKER_ITEMS } from '../../data/arcadeModeData';


interface DealbreakerGameProps {
    onComplete: (dealbreakers: string[]) => void;
}

export const DealbreakerGame: React.FC<DealbreakerGameProps> = ({ onComplete }) => {
    const [items, setItems] = useState<any[]>([]);
    const [smackedItems, setSmackedItems] = useState<string[]>([]); // These are NOT dealbreakers (you defended against them)
    const [missedItems, setMissedItems] = useState<string[]>([]); // These ARE dealbreakers (you let them pass / accepted them? Logic inversion: Wait.)


    // GAME LOGIC REVISION:
    // "Smash the Dealbreakers" -> Clicking them means "I REJECT THIS".
    // So smacked items = Added to "Absolute Dealbreakers" list.
    // Letting them fall = "I can tolerate this".

    const [gameOver, setGameOver] = useState(false);
    const [spawnIndex, setSpawnIndex] = useState(0);

    // Improve Gameplay: Use Lanes to prevent overlap
    const LANES = [-35, -18, 0, 18, 35]; // Percentages from center

    // Initial Spawner
    useEffect(() => {
        const interval = setInterval(() => {
            if (spawnIndex < DEALBREAKER_ITEMS.length) {
                // Pick a random lane
                const randomLane = LANES[Math.floor(Math.random() * LANES.length)];

                const newItem = {
                    ...DEALBREAKER_ITEMS[spawnIndex],
                    x: randomLane,
                    id: DEALBREAKER_ITEMS[spawnIndex].id,
                    // Vary speed slightly for natural feel
                    duration: 5 + Math.random() * 2
                };
                setItems(prev => [...prev, newItem]);
                setSpawnIndex(prev => prev + 1);
            } else {
                clearInterval(interval);
                // End game logic
                if (items.length === 0) {
                    setTimeout(() => setGameOver(true), 2000);
                }
            }
        }, 1800); // Slightly slower spawn rate (was 1500)

        return () => clearInterval(interval);
    }, [spawnIndex, items.length]);

    useEffect(() => {
        if (gameOver) {
            if (gameOver) {
                onComplete(smackedItems);
            }
        }
    }, [gameOver]);

    const handleSmash = (value: string) => {

        setSmackedItems(prev => [...prev, value]);
        setItems(prev => prev.filter(i => i.value !== value)); // Remove from screen
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">

            <div className="text-center z-10 mb-8 pointer-events-none absolute top-12">
                <h2 className="text-3xl font-black text-red-500 italic tracking-tighter drop-shadow-lg animate-pulse">
                    DEFEND YOUR HEART!
                </h2>
                <p className="text-white/80 text-sm font-medium">Click to SMASH the things you can't tolerate!</p>
            </div>

            {/* Shake Container */}
            <motion.div
                className="relative w-full h-full max-w-4xl" // Wider container
                animate={smackedItems.length % 2 === 0 ? { x: 0 } : { x: [-5, 5, -5, 5, 0] }}
                transition={{ duration: 0.1 }}
            >
                <AnimatePresence>
                    {items.map((item) => (
                        <motion.button
                            key={item.id}
                            initial={{ y: -120, opacity: 0, x: `${item.x}%` }}
                            animate={{
                                y: 600, // Fall further down to clear screen
                                opacity: 1,
                                transition: { duration: item.duration || 5, ease: "linear" }
                            }}
                            exit={{ scale: [1.1, 0], opacity: 0, rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.3 }}
                            className="absolute top-0 left-1/2 w-40 p-6 bg-stone-800/90 backdrop-blur-md border-2 border-red-500/50 hover:border-red-400 rounded-xl shadow-2xl flex items-center justify-center group active:scale-95 z-20 cursor-pointer"
                            onClick={() => handleSmash(item.value)}
                            // Giant Hitbox: Use padding or a pseudo-element if needed, but w-40 p-6 is big.
                            style={{ marginLeft: '-5rem' }} // Center via negative margin (half of w-40)
                        >
                            <Bomb className="text-red-500 mr-3 w-8 h-8 group-hover:animate-pulse" />
                            <span className="text-white font-bold text-lg leading-tight">{item.label}</span>
                        </motion.button>
                    ))}

                    {/* Explosion Particles */}
                    {smackedItems.map((_, i) => (
                        <motion.div
                            key={`explosion-${i}`}
                            initial={{ scale: 0.5, opacity: 1, x: '-50%', y: '-50%' }}
                            animate={{ scale: 4, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-1/2 left-1/2 w-32 h-32 bg-red-600/30 rounded-full blur-2xl pointer-events-none z-10"
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            <div className="absolute bottom-10 z-20 text-white/50 text-xs">
                Smashed: {smackedItems.length}
            </div>

        </div>
    );
};
