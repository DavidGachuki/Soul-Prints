import React, { useState } from 'react';
import { Button } from './Button';
import { ChevronRight, ChevronLeft, Upload, Sun, Moon, Coffee, Heart, Zap, Book, Globe, Languages } from 'lucide-react';
import { WORLD_LANGUAGES, COMMON_WORLD_LANGUAGES, LANGUAGE_REGIONS, getLanguagesByRegion } from '../data/languagesData';

interface OnboardingData {
    name: string;
    age: string;
    // Inclusive identity fields
    genderIdentity?: string;
    genderSelfDescribe?: string;
    sexualOrientation?: string[];
    orientationSelfDescribe?: string;
    relationshipStructure?: string;
    relationshipGoals?: string;
    selfDescription?: string[];
    loveLanguage?: string;
    languages?: string[];
}

interface OnboardingViewProps {
    onComplete: (data: OnboardingData) => void;
    isLoading: boolean;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete, isLoading }) => {
    const [step, setStep] = useState(0);
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [data, setData] = useState<OnboardingData>({
        name: '',
        age: '',
        genderIdentity: undefined,
        genderSelfDescribe: '',
        sexualOrientation: [],
        orientationSelfDescribe: '',
        relationshipStructure: undefined,
        relationshipGoals: undefined,
        selfDescription: [],
        loveLanguage: undefined,
        languages: []
    });

    const totalSteps = 8; // 0 (Name/Age) + 7 questions (6 inclusive + 1 languages)

    const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps - 1));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 0));

    const update = (field: keyof OnboardingData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const renderStep = () => {
        switch (step) {
            case 0: // Basic Info
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="text-center mb-8">
                            <h2 className="font-serif text-3xl font-bold text-warm-text mb-2">Let's introduce you.</h2>
                            <p className="text-warm-subtext">We'll start with the basics.</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-warm-text ml-1 mb-1">First Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={data.name}
                                    onChange={e => update('name', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                    placeholder="e.g., Sarah"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-warm-text ml-1 mb-1">Age</label>
                                <input
                                    type="number"
                                    value={data.age}
                                    onChange={e => update('age', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                    placeholder="25"
                                />
                            </div>
                            <Button className="w-full mt-4" variant="primary" onClick={handleNext} disabled={!data.name || !data.age}>
                                Begin Journey
                            </Button>
                        </div>
                    </div>
                );

            case 1: // NEW: Gender Identity
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <span className="text-xs font-bold tracking-widest text-editorial-accent uppercase">Question 01</span>
                            <h2 className="font-serif text-2xl font-bold text-warm-text mt-2">What is your gender identity?</h2>
                            <p className="text-sm text-warm-subtext mt-2">You can skip this if you prefer</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {['Woman', 'Man', 'Non-binary', 'Prefer to self-describe', 'Prefer not to answer'].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => {
                                        update('genderIdentity', opt);
                                        if (opt !== 'Prefer to self-describe') setTimeout(handleNext, 300);
                                    }}
                                    className={`p-4 rounded-xl border-2 transition-all ${data.genderIdentity === opt ? 'border-editorial-accent bg-editorial-accent/5 text-editorial-accent' : 'border-transparent bg-gray-50 hover:bg-gray-100 text-warm-text'}`}
                                >
                                    <span className="font-medium">{opt}</span>
                                </button>
                            ))}
                        </div>
                        {data.genderIdentity === 'Prefer to self-describe' && (
                            <div className="animate-fade-in">
                                <input
                                    autoFocus
                                    type="text"
                                    value={data.genderSelfDescribe}
                                    onChange={(e) => update('genderSelfDescribe', e.target.value)}
                                    placeholder="How do you identify?"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-editorial-accent"
                                />
                                <Button className="w-full mt-3" variant="primary" onClick={handleNext} disabled={!data.genderSelfDescribe}>
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                );

            case 2: // NEW: Sexual Orientation
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <span className="text-xs font-bold tracking-widest text-editorial-accent uppercase">Question 02</span>
                            <h2 className="font-serif text-2xl font-bold text-warm-text mt-2">What is your sexual orientation?</h2>
                            <p className="text-sm text-warm-subtext mt-2">Select all that apply</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {['Gay/Lesbian', 'Bisexual', 'Straight/Heterosexual', 'Pansexual', 'Queer', 'Asexual', 'Aromantic', 'Prefer not to answer'].map((opt) => {
                                const isSelected = data.sexualOrientation?.includes(opt);
                                return (
                                    <button
                                        key={opt}
                                        onClick={() => {
                                            const current = data.sexualOrientation || [];
                                            if (opt === 'Prefer not to answer') {
                                                update('sexualOrientation', [opt]);
                                            } else {
                                                const filtered = current.filter(o => o !== 'Prefer not to answer');
                                                update('sexualOrientation', isSelected ? filtered.filter(o => o !== opt) : [...filtered, opt]);
                                            }
                                        }}
                                        className={`p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-editorial-accent bg-editorial-accent/5 text-editorial-accent' : 'border-transparent bg-gray-50 hover:bg-gray-100 text-warm-text'}`}
                                    >
                                        <span className="font-medium">{opt}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <Button className="w-full" variant="primary" onClick={handleNext} disabled={!data.sexualOrientation || data.sexualOrientation.length === 0}>
                            Next
                        </Button>
                    </div>
                );

            case 3: // NEW: Relationship Structure
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <span className="text-xs font-bold tracking-widest text-editorial-accent uppercase">Question 03</span>
                            <h2 className="font-serif text-2xl font-bold text-warm-text mt-2">Which relationship structure do you prefer?</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {['Monogamous (one partner)', 'Polyamorous (multiple partners)', 'Open (non-monogamous with transparency)', 'Polyfidelity', 'Other', 'Prefer not to say'].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => { update('relationshipStructure', opt); setTimeout(handleNext, 300); }}
                                    className={`p-4 rounded-xl border-2 transition-all ${data.relationshipStructure === opt ? 'border-editorial-accent bg-editorial-accent/5 text-editorial-accent' : 'border-transparent bg-gray-50 hover:bg-gray-100 text-warm-text'}`}
                                >
                                    <span className="font-medium">{opt}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 4: // NEW: Relationship Goals
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <span className="text-xs font-bold tracking-widest text-editorial-accent uppercase">Question 04</span>
                            <h2 className="font-serif text-2xl font-bold text-warm-text mt-2">What are you looking for right now?</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {['Long-term commitment/marriage', 'Serious relationship', 'Casual dating/friendship', 'Marriage eventually', 'Unsure/Exploring'].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => { update('relationshipGoals', opt); setTimeout(handleNext, 300); }}
                                    className={`p-4 rounded-xl border-2 transition-all ${data.relationshipGoals === opt ? 'border-editorial-accent bg-editorial-accent/5 text-editorial-accent' : 'border-transparent bg-gray-50 hover:bg-gray-100 text-warm-text'}`}
                                >
                                    <span className="font-medium">{opt}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 5: // NEW: Self Description
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <span className="text-xs font-bold tracking-widest text-editorial-accent uppercase">Question 05</span>
                            <h2 className="font-serif text-2xl font-bold text-warm-text mt-2">Which of these best describes you?</h2>
                            <p className="text-sm text-warm-subtext mt-2">Select up to 3</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {['Ambitious/Career-focused', 'Family-oriented', 'Free-spirited/Adventurous', 'Homebody/Coziness', 'Socially active/Extroverted', 'Reflective/Introverted', 'Creative/Artistic', 'Logical/Analytical'].map((opt) => {
                                const isSelected = data.selfDescription?.includes(opt);
                                const count = data.selfDescription?.length || 0;
                                return (
                                    <button
                                        key={opt}
                                        onClick={() => {
                                            const current = data.selfDescription || [];
                                            if (isSelected) {
                                                update('selfDescription', current.filter(o => o !== opt));
                                            } else if (count < 3) {
                                                update('selfDescription', [...current, opt]);
                                            }
                                        }}
                                        className={`p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-editorial-accent bg-editorial-accent/5 text-editorial-accent' : 'border-transparent bg-gray-50 hover:bg-gray-100 text-warm-text'} ${!isSelected && count >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={!isSelected && count >= 3}
                                    >
                                        <span className="font-medium text-sm">{opt}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <Button className="w-full" variant="primary" onClick={handleNext} disabled={!data.selfDescription || data.selfDescription.length === 0}>
                            Next ({data.selfDescription?.length || 0}/3 selected)
                        </Button>
                    </div>
                );

            case 6: // NEW: Languages Spoken
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <span className="text-xs font-bold tracking-widest text-editorial-accent uppercase">Question 06</span>
                            <h2 className="font-serif text-2xl font-bold text-warm-text mt-2">Which languages do you speak?</h2>
                            <p className="text-sm text-warm-subtext mt-2">Select all that apply</p>
                        </div>

                        {/* Common languages section */}
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-warm-subtext mb-3">Most Common</p>
                            <div className="grid grid-cols-2 gap-3">
                                {WORLD_LANGUAGES.filter(lang => COMMON_WORLD_LANGUAGES.includes(lang.code)).map((lang) => {
                                    const isSelected = data.languages?.includes(lang.code);
                                    return (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                const current = data.languages || [];
                                                update('languages', isSelected ? current.filter(l => l !== lang.code) : [...current, lang.code]);
                                            }}
                                            className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${isSelected ? 'border-editorial-accent bg-editorial-accent/5 text-editorial-accent' : 'border-transparent bg-gray-50 hover:bg-gray-100 text-warm-text'}`}
                                        >
                                            <Globe size={16} className={isSelected ? 'text-editorial-accent' : 'text-gray-400'} />
                                            <div className="text-left">
                                                <div className="font-medium text-sm">{lang.name}</div>
                                                <div className="text-xs opacity-60">{lang.native}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Browse by region */}
                        <details className="group">
                            <summary className="cursor-pointer text-sm text-editorial-accent hover:underline font-medium">
                                + Browse by Region
                            </summary>
                            <div className="mt-4 space-y-4 max-h-80 overflow-y-auto">
                                {LANGUAGE_REGIONS.map(region => {
                                    const regionLangs = getLanguagesByRegion(region);
                                    return (
                                        <div key={region}>
                                            <p className="text-xs font-bold uppercase tracking-wide text-warm-subtext mb-2">{region}</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {regionLangs.map((lang) => {
                                                    const isSelected = data.languages?.includes(lang.code);
                                                    return (
                                                        <button
                                                            key={lang.code}
                                                            onClick={() => {
                                                                const current = data.languages || [];
                                                                update('languages', isSelected ? current.filter(l => l !== lang.code) : [...current, lang.code]);
                                                            }}
                                                            className={`p-2 rounded-lg border transition-all text-left ${isSelected ? 'border-editorial-accent bg-editorial-accent/5 text-editorial-accent' : 'border-gray-200 bg-white hover:border-gray-300 text-warm-text'}`}
                                                        >
                                                            <div className="font-medium text-xs">{lang.name}</div>
                                                            <div className="text-[10px] opacity-60">{lang.native}</div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </details>

                        <Button className="w-full" variant="primary" onClick={handleNext} disabled={!data.languages || data.languages.length === 0}>
                            Next ({data.languages?.length || 0} selected)
                        </Button>
                    </div>
                );

            case 7: // NEW: Love Language (FINAL STEP)
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <span className="text-xs font-bold tracking-widest text-editorial-accent uppercase">Final Question</span>
                            <h2 className="font-serif text-2xl font-bold text-warm-text mt-2">What's your primary love language?</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {['Quality Time', 'Words of Affirmation', 'Acts of Service', 'Physical Touch', 'Gifts'].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => {
                                        const updatedData = { ...data, loveLanguage: opt };
                                        update('loveLanguage', opt);
                                        setTimeout(() => onComplete(updatedData), 300);
                                    }}
                                    className={`p-4 rounded-xl border-2 transition-all ${data.loveLanguage === opt ? 'border-editorial-accent bg-editorial-accent/5 text-editorial-accent' : 'border-transparent bg-gray-50 hover:bg-gray-100 text-warm-text'}`}
                                >
                                    <span className="font-medium">{opt}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-warm-bg flex items-center justify-center p-6 relative">
            <div className="absolute inset-0 bg-gradient-warm opacity-50"></div>

            <div className="w-full max-w-xl relative z-10">
                {/* Simple Back Check */}
                {step > 0 && (
                    <button onClick={handleBack} className="absolute top-8 left-8 md:-left-12 p-2 text-warm-subtext hover:text-warm-text transition-colors">
                        <ChevronLeft />
                    </button>
                )}

                <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 relative overflow-hidden min-h-[500px] flex flex-col justify-center">
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100">
                        <div
                            className="h-full bg-brand-primary transition-all duration-500 ease-out"
                            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                        ></div>
                    </div>

                    {renderStep()}
                </div>
            </div>
        </div>
    );
};
