import React from 'react';
import { Heart, X, MessageCircle } from 'lucide-react';
import { MatchProfile } from '../types';

interface StoryCardProps {
    profile: MatchProfile;
    onLike: () => void;
    onPass: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ profile, onLike, onPass }) => {
    return (
        <div className="w-full max-w-lg md:max-w-6xl bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden border border-[#EBEBEB] md:flex md:flex-row md:h-[600px] transition-all duration-500">

            {/* Image Section - Left (Desktop) / Top (Mobile) */}
            <div className="relative h-[450px] md:h-full w-full md:w-5/12 group overflow-hidden bg-black">
                {(() => {
                    const mediaList = [];
                    if (profile.videoUrl) mediaList.push({ type: 'video', url: profile.videoUrl });
                    // Deduplicate image if it's the same as the first one and video exists, etc.
                    // But simple map is fine.
                    if (profile.gallery && profile.gallery.length > 0) {
                        profile.gallery.forEach(url => mediaList.push({ type: 'image', url }));
                    } else {
                        mediaList.push({ type: 'image', url: profile.imageUrl });
                    }

                    const [currentIndex, setCurrentIndex] = React.useState(0);
                    const currentMedia = mediaList[currentIndex] || mediaList[0];

                    return (
                        <>
                            {currentMedia.type === 'video' ? (
                                <video
                                    src={currentMedia.url}
                                    className="w-full h-full object-cover"
                                    autoPlay muted loop playsInline
                                />
                            ) : (
                                <img
                                    src={currentMedia.url}
                                    alt={profile.name}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                            )}

                            {/* Navigation Zones */}
                            {mediaList.length > 1 && (
                                <>
                                    <div
                                        className="absolute inset-y-0 left-0 w-1/2 z-20 cursor-w-resize"
                                        onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : mediaList.length - 1)}
                                    />
                                    <div
                                        className="absolute inset-y-0 right-0 w-1/2 z-20 cursor-e-resize"
                                        onClick={() => setCurrentIndex(prev => prev < mediaList.length - 1 ? prev + 1 : 0)}
                                    />

                                    {/* Indicators */}
                                    <div className="absolute top-4 left-0 right-0 z-30 flex justify-center gap-1 px-4">
                                        {mediaList.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`h-1 rounded-full flex-1 max-w-[40px] transition-all duration-300 ${idx === currentIndex ? 'bg-white' : 'bg-white/30'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    );
                })()}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none"></div>

                <div className="absolute bottom-8 left-8 text-white z-10 pointer-events-none">
                    <h2 className="font-serif-display text-5xl font-medium tracking-tight mb-2">{profile.name}, {profile.age}</h2>
                    <p className="text-white/90 font-light text-xl leading-relaxed max-w-[90%]">{profile.bio}</p>
                </div>
            </div>

            {/* Editorial Content - Right (Desktop) / Bottom (Mobile) */}
            <div className="p-8 md:p-12 bg-warm-surface md:w-7/12 flex flex-col md:overflow-y-auto custom-scrollbar">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-editorial-accent"></span>
                        <h3 className="uppercase tracking-[0.2em] text-xs font-bold text-editorial-accent">Soul Analysis</h3>
                    </div>
                    <p className="font-serif-display text-3xl md:text-4xl text-warm-text leading-tight">
                        "{profile.soulAnalysis}"
                    </p>
                </div>

                {/* Traits / Keywords */}
                <div className="flex flex-wrap gap-3 mb-10">
                    {profile.interests.map((tag, i) => (
                        <span key={i} className="px-4 py-1.5 bg-[#F5F5F0] text-warm-text text-xs uppercase tracking-widest font-bold rounded-sm border border-transparent hover:border-editorial-secondary transition-colors cursor-default">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Deep Dive - 2 col grid on wide screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 md:mb-auto">
                    <div>
                        <span className="text-warm-subtext text-xs font-bold uppercase tracking-widest block mb-2">The Fear</span>
                        <p className="text-warm-text/90 text-sm leading-7 font-light border-l border-editorial pl-4">
                            {profile.deepAnswer1}
                        </p>
                    </div>
                    <div>
                        <span className="text-warm-subtext text-xs font-bold uppercase tracking-widest block mb-2">The Joy</span>
                        <p className="text-warm-text/90 text-sm leading-7 font-light border-l border-editorial pl-4">
                            {profile.deepAnswer2}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 pt-8 border-t border-editorial mt-auto">
                    <button
                        onClick={onPass}
                        className="px-8 py-4 border-2 border-gray-100 text-warm-subtext rounded-xl hover:border-gray-900 hover:text-gray-900 transition-all font-bold text-sm uppercase tracking-widest"
                    >
                        Pass
                    </button>

                    <button
                        onClick={onLike}
                        className="flex-1 py-4 bg-gray-900 text-white rounded-xl shadow-xl hover:bg-black hover:scale-[1.01] transition-all font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                        Connect <span className="opacity-30 text-xs">|</span> <Heart className="w-4 h-4 fill-white" />
                    </button>
                </div>

            </div>
        </div>
    );
};
