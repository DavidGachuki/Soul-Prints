import React, { useState } from 'react';
import { Button } from './Button';
import { ChevronRight, ChevronLeft, Upload, Sun, Moon, Coffee, Heart, Zap, Book, Globe } from 'lucide-react';

interface OnboardingData {
    name: string;
    age: string;
    energizer: string;
    idealSunday: string;
    sharedVsDiff: number; // 0 to 100
    photoUrl: string;
    topic: string;
    fridayEve: number; // 0 (Quiet) to 100 (Party)
    passion: string;
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
        energizer: '',
        idealSunday: '',
        sharedVsDiff: 50,
        photoUrl: '',
        topic: '',
        fridayEve: 50,
        passion: ''
    });

    const totalSteps = 8; // 0 (Intro/Name) + 7 questions

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

            case 1: // Q1: Energizers
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <span className="text-xs font-bold tracking-widest text-editorial-accent uppercase">Question 01</span>
                            <h2 className="font-serif text-2xl font-bold text-warm-text mt-2">What energizes you most?</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {['Creating', 'Exploring', 'Learning', 'Connecting', 'Relaxing'].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => { update('energizer', opt); setTimeout(handleNext, 300); }}
                                    className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${data.energizer === opt ? 'border-editorial-accent bg-editorial-accent/5' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                                >
                                    <span className={`font-medium ${data.energizer === opt ? 'text-editorial-accent' : 'text-warm-text'}`}>{opt}</span>
                                    {data.energizer === opt && <Zap size={18} className="text-editorial-accent" />}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 2: // Q2: Ideal Sunday
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="text-center">
                            <span className="text-xs font-bold tracking-widest text-editorial-accent uppercase">Question 02</span>
                            <h2 className="font-serif text-2xl font-bold text-warm-text mt-2">Describe your ideal Sunday in 3 activities.</h2>
                        </div>
                        <textarea
                            value={data.idealSunday}
                            onChange={e => update('idealSunday', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 text-xl font-serif text-warm-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 min-h-[160px] resize-none placeholder:text-gray-300 placeholder:italic"
                            placeholder="e.g., Morning coffee, thrift shopping, cooking dinner..."
                        />
                        <Button className="w-full" variant="primary" onClick={handleNext} disabled={!data.idealSunday}>
                            Next
                        </Button>
                    </div>
                );

            case 3: // Q3: Shared vs Diff (Slider)
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <span className="text-xs font-bold tracking-widest text-editorial-accent uppercase">Question 03</span>
                            <h2 className="font-serif text-2xl font-bold text-warm-text mt-2">What matters more?</h2>
                        </div>

                        <div className="px-4 py-8">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={data.sharedVsDiff}
                                onChange={e => update('sharedVsDiff', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-editorial-accent"
                            />
                            <div className="flex justify-between mt-4 text-sm font-bold text-warm-subtext uppercase tracking-wide">
                                <span className={data.sharedVsDiff < 50 ? 'text-editorial-accent' : ''}>Shared Hobbies</span>
                                <span className={data.sharedVsDiff > 50 ? 'text-editorial-accent' : ''}>Differences</span>
                            </div>
                        </div>

                        <Button className="w-full" variant="primary" onClick={handleNext}>
                            Next
                        </Button>
                    </div>
                );

            case 4: // Q4: Photo Interest
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="text-center">
                            <span className="text-xs font-bold tracking-widest text-editorial-accent uppercase">Question 04</span>
                            <h2 className="font-serif text-2xl font-bold text-warm-text mt-2">Show us one interest.</h2>
                            <p className="text-warm-subtext text-sm mt-2">Upload a photo that represents you</p>
                        </div>

                        <label className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 hover:border-editorial-accent/50 transition-colors cursor-pointer">
                            {data.photoUrl ? (
                                <img src={data.photoUrl} alt="Interest" className="w-32 h-32 object-cover rounded-lg shadow-md" />
                            ) : (
                                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                                    <Upload className="text-gray-400" />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        // Show preview immediately
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            update('photoUrl', reader.result as string);
                                        };
                                        reader.readAsDataURL(file);

                                        // Store file for later upload
                                        (window as any).__pendingPhotoFile = file;
                                    }
                                }}
                            />
                            <p className="text-sm text-warm-subtext">Click to upload an image</p>
                        </label>

                        <Button className="w-full" variant="primary" onClick={handleNext} disabled={!data.photoUrl}>
                            Next
                        </Button>
                        <button onClick={() => { update('photoUrl', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1'); handleNext(); }} className="w-full text-xs text-warm-subtext hover:text-warm-text">
                            Skip (Use Placeholder)
                        </button>
                    </div>
                );

            case 5: // Q5: Discuss Topic
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <span className="text-xs font-bold tracking-widest text-editorial-accent uppercase">Question 05</span>
                            <h2 className="font-serif text-2xl font-bold text-warm-text mt-2">Which would you rather discuss for 20 minutes?</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: 'travel', label: 'Travel Stories', icon: <Globe size={20} /> },
                                { id: 'reading', label: 'Recent Reads', icon: <Book size={20} /> },
                                { id: 'tech', label: 'Innovations', icon: <Zap size={20} /> },
                                { id: 'growth', label: 'Personal Growth', icon: <Sun size={20} /> }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => { update('topic', opt.label); setShowOtherInput(false); setTimeout(handleNext, 300); }}
                                    className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 text-center ${data.topic === opt.label && !showOtherInput ? 'border-editorial-accent bg-editorial-accent text-white shadow-lg scale-105' : 'border-gray-100 bg-white text-warm-text hover:border-gray-200 hover:shadow-sm'}`}
                                >
                                    <span className={(data.topic === opt.label && !showOtherInput) ? 'text-white' : 'text-editorial-accent'}>{opt.icon}</span>
                                    <span className="font-medium text-sm">{opt.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Other Option */}
                        <div className="pt-2">
                            {!showOtherInput ? (
                                <button
                                    onClick={() => setShowOtherInput(true)}
                                    className="w-full text-warm-subtext text-sm hover:text-editorial-accent underline"
                                >
                                    Something else?
                                </button>
                            ) : (
                                <div className="animate-fade-in space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wide text-warm-subtext">Custom Topic</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={data.topic}
                                        onChange={(e) => update('topic', e.target.value)}
                                        placeholder="e.g., Ancient History"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-editorial-accent"
                                    />
                                    <Button className="w-full" variant="primary" onClick={handleNext} disabled={!data.topic}>
                                        Confirm
                                    </Button>
                                    <button onClick={() => setShowOtherInput(false)} className="w-full text-xs text-warm-subtext mt-2">Cancel</button>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 6: // Q6: Friday Eve (Slider)
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center">
                            <span className="text-xs font-bold tracking-widest text-editorial-accent uppercase">Question 06</span>
                            <h2 className="font-serif text-2xl font-bold text-warm-text mt-2">Your typical Friday evening?</h2>
                        </div>

                        <div className="px-4 py-12">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={data.fridayEve}
                                onChange={e => update('fridayEve', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-editorial-accent"
                            />
                            <div className="flex justify-between mt-6">
                                <div className={`flex flex-col items-center gap-2 ${data.fridayEve < 40 ? 'text-editorial-accent' : 'text-gray-400'}`}>
                                    <Coffee size={24} />
                                    <span className="text-xs font-bold uppercase tracking-wide">Quiet Night In</span>
                                </div>
                                <div className={`flex flex-col items-center gap-2 ${data.fridayEve > 60 ? 'text-editorial-accent' : 'text-gray-400'}`}>
                                    <Zap size={24} />
                                    <span className="text-xs font-bold uppercase tracking-wide">Night Out</span>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full" variant="primary" onClick={handleNext}>
                            Next
                        </Button>
                    </div>
                );

            case 7: // Q7: Surprising Passion
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="text-center">
                            <span className="text-xs font-bold tracking-widest text-editorial-accent uppercase">Final Question</span>
                            <h2 className="font-serif text-2xl font-bold text-warm-text mt-2">One thing you're passionate about that surprises people.</h2>
                        </div>
                        <textarea
                            value={data.passion}
                            onChange={e => update('passion', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 text-xl font-serif text-warm-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 min-h-[160px] resize-none placeholder:text-gray-300 placeholder:italic"
                            placeholder="e.g., I collect vintage typewriters..."
                        />
                        <Button className="w-full" variant="primary" onClick={() => onComplete(data)} isLoading={isLoading} disabled={!data.passion}>
                            Complete Profile
                        </Button>
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
