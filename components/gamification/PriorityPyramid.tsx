import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { ArrowRight, Trophy } from 'lucide-react';
import { PRIORITY_ITEMS } from '../../data/arcadeModeData';


interface PriorityPyramidProps {
    onComplete: (topPriorities: string[]) => void;
}

export const PriorityPyramid: React.FC<PriorityPyramidProps> = ({ onComplete }) => {
    const [items, setItems] = useState(PRIORITY_ITEMS);

    const handleReorder = (newOrder: typeof PRIORITY_ITEMS) => {
        setItems(newOrder);
    };

    const handleConfirm = () => {
        const top3 = items.slice(0, 3).map(i => i.label);
        onComplete(top3);
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6">

            <div className="text-center z-10 mb-8">
                <h2 className="text-3xl font-black text-yellow-400 italic tracking-tighter drop-shadow-md">
                    PRIORITY PYRAMID
                </h2>
                <p className="text-white/80 text-sm font-medium">Drag and drop to rank your top 3 life goals.</p>
            </div>

            <div className="w-full max-w-sm relative">

                {/* Visual Pyramid BG */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 pointer-events-none">
                    <Trophy size={200} className="text-white" />
                </div>

                <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-3 relative z-10">
                    {items.map((item, index) => (
                        <Reorder.Item key={item.id} value={item}>
                            <motion.div
                                layout
                                className={`p-4 rounded-xl flex items-center justify-between shadow-lg cursor-grab active:cursor-grabbing backdrop-blur-md border ${index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-500 border-yellow-300' :
                                    index === 1 ? 'bg-stone-700/80 border-stone-500' :
                                        index === 2 ? 'bg-stone-800/80 border-stone-600' :
                                            'bg-stone-900/50 border-stone-800 text-white/50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index < 3 ? 'bg-white text-stone-900' : 'bg-stone-800 text-stone-600'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <span className={`font-bold ${index < 3 ? 'text-white' : 'text-stone-400'}`}>
                                        {item.label}
                                    </span>
                                </div>
                            </motion.div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleConfirm}
                    className="mt-8 w-full py-4 bg-white text-stone-900 font-bold rounded-xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    Confirm Ranking <ArrowRight size={20} />
                </motion.button>
            </div>

        </div>
    );
};
