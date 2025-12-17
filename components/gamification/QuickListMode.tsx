import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, X } from 'lucide-react';
import { QUICK_LIST_ITEMS } from '../../data/quickListQuestions';
import { saveQuestionnaireAnswers } from '../../services/profileCompletionService';

interface QuickListModeProps {
    userId: string;
    onComplete: () => void;
    onExit: () => void;
}

export const QuickListMode: React.FC<QuickListModeProps> = ({ userId, onComplete, onExit }) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const toggleItem = (itemId: string) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleComplete = async () => {
        // Save selections to database
        await saveQuestionnaireAnswers(userId, {
            quick_list_selections: selectedItems,
            questionnaire_mode: 'quicklist'
        });
        onComplete();
    };

    const categoryLabels = {
        values: 'Core Values',
        personality: 'Personality Traits',
        lifestyle: 'Lifestyle Preferences',
        needs: 'Relationship Needs'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-stone-900 to-stone-900"></div>

            {/* Exit Button */}
            <button
                onClick={onExit}
                className="absolute top-6 right-6 z-50 text-white/50 hover:text-white uppercase text-xs font-bold tracking-widest transition-colors flex items-center gap-2"
            >
                <X size={16} />
                Exit
            </button>

            {/* Content */}
            <div className="relative w-full max-w-5xl mx-auto px-8 py-16 h-full overflow-y-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif-display text-white mb-3">
                        Quick List
                    </h2>
                    <p className="text-white/60 text-lg">
                        Select all that apply • {selectedItems.length} selected
                    </p>
                </div>

                {/* Categories */}
                <div className="space-y-12">
                    {Object.entries(QUICK_LIST_ITEMS).map(([categoryKey, items]) => (
                        <motion.div
                            key={categoryKey}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8"
                        >
                            <h3 className="text-2xl font-serif-display text-white mb-6">
                                {categoryLabels[categoryKey as keyof typeof categoryLabels]}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {items.map((item) => {
                                    const isSelected = selectedItems.includes(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleItem(item.id)}
                                            className={`
                        relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                        ${isSelected
                                                    ? 'bg-purple-500/20 border-purple-500 text-white'
                                                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                                                }
                      `}
                                        >
                                            <div className={`
                        w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                        ${isSelected
                                                    ? 'bg-purple-500 border-purple-500'
                                                    : 'border-white/30'
                                                }
                      `}>
                                                {isSelected && <Check size={16} className="text-white" />}
                                            </div>
                                            <span className="text-left text-sm font-medium">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Category note */}
                            <p className="text-xs text-white/30 mt-4 italic">
                                {items[0]?.citation}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Complete Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="sticky bottom-8 left-0 right-0 flex justify-center mt-12"
                >
                    <button
                        onClick={handleComplete}
                        disabled={selectedItems.length === 0}
                        className="flex items-center gap-3 px-10 py-4 rounded-full bg-purple-500 hover:bg-purple-600 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold text-lg shadow-2xl transition-all hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <span>Complete Quick List</span>
                        <ArrowRight size={24} />
                    </button>
                </motion.div>
            </div>
        </div>
    );
};
