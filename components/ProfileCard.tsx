import React from 'react';
import { MatchProfile } from '../types';
import { X, MessageCircle, Heart, Sparkles } from 'lucide-react';

interface ProfileCardProps {
  profile: MatchProfile;
  onLike: () => void;
  onPass: () => void;
  onChat?: () => void;
  showActions?: boolean;
  detailed?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  onLike, 
  onPass,
  onChat,
  showActions = true,
  detailed = false
}) => {
  return (
    <div className={`
      relative w-full mx-auto bg-white rounded-3xl overflow-hidden 
      shadow-2xl transition-all duration-500 border border-gray-100
      flex flex-col
      ${detailed ? 'h-auto max-w-2xl' : 'h-[75vh] min-h-[600px] max-h-[850px] max-w-md'}
    `}>
      
      {/* Top Image Section - Fixed Height (40%) */}
      <div className="relative h-[40%] shrink-0 w-full group">
         <img 
            src={profile.imageUrl} 
            alt={profile.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
         />
         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
         
         {/* Match Badge - Prominent */}
         {profile.compatibilityScore && (
           <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md shadow-lg px-4 py-2 rounded-full flex items-center gap-2 animate-fade-in">
             <Heart className="w-4 h-4 text-brand-primary fill-brand-primary" />
             <span className="font-bold text-brand-primary text-sm">{profile.compatibilityScore}% Match</span>
           </div>
         )}
         
         {/* Name & Age Overlay */}
         <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
            <h2 className="font-serif font-bold text-4xl drop-shadow-md mb-2">
              {profile.name}, {profile.age}
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.interests.slice(0, 3).map(interest => (
                <span key={interest} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium border border-white/20">
                  {interest}
                </span>
              ))}
            </div>
         </div>
      </div>

      {/* Bottom Content Section - Scrollable */}
      <div className="flex-1 bg-white relative flex flex-col overflow-hidden">
        
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
           
           {/* Bio */}
           <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
             <p className="text-warm-text text-lg leading-relaxed font-light">{profile.bio}</p>
           </div>

           {/* Compatibility Insight Box */}
           {profile.compatibilityReason && (
              <div className="bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-100 p-5 rounded-2xl animate-fade-in shadow-sm" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center gap-2 mb-3 text-brand-secondary">
                   <Sparkles className="w-4 h-4" />
                   <span className="text-xs font-bold uppercase tracking-wider">AI Compatibility Insight</span>
                </div>
                <p className="text-warm-text italic leading-relaxed text-sm">
                  "{profile.compatibilityReason}"
                </p>
              </div>
           )}

           {/* Soul Analysis */}
           <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
             <h3 className="font-serif font-bold text-xl text-warm-text mb-3">Soul Vibe</h3>
             <div className="relative pl-6 border-l-4 border-brand-accent/30">
               <p className="text-warm-subtext leading-relaxed italic">
                 {profile.soulAnalysis}
               </p>
             </div>
           </div>

           {/* Deep Dive Questions */}
           <div className="space-y-6 animate-fade-in pb-4" style={{animationDelay: '0.4s'}}>
              <h3 className="font-serif font-bold text-xl text-warm-text border-b border-gray-100 pb-2">The Deep Dive</h3>
              
              <div className="space-y-2 bg-gray-50 p-4 rounded-xl">
                <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider">Night Thoughts</p>
                <p className="text-warm-text text-base leading-relaxed">"{profile.deepAnswer1}"</p>
              </div>

              <div className="space-y-2 bg-gray-50 p-4 rounded-xl">
                <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider">Perfect Sunday</p>
                <p className="text-warm-text text-base leading-relaxed">"{profile.deepAnswer2}"</p>
              </div>
           </div>
        </div>

        {/* Action Buttons - Fixed at Bottom with Shadow Gradient */}
        {showActions && (
           <div className="p-4 bg-white relative z-20 flex justify-center items-center gap-8 shrink-0 border-t border-gray-50 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
              {/* Gradient fade above buttons */}
              <div className="absolute bottom-full left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>

              <button 
                onClick={onPass}
                className="w-16 h-16 rounded-full bg-white border border-gray-200 shadow-md text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
                aria-label="Pass"
              >
                <X className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
              </button>
              
              {onChat ? (
                 <button 
                 onClick={onChat}
                 className="h-16 px-8 rounded-full bg-gradient-love text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:scale-105 transition-all duration-300 flex items-center gap-2 font-bold"
               >
                 <MessageCircle className="w-6 h-6" />
                 <span>Say Hello</span>
               </button>
              ) : (
                <button 
                  onClick={onLike}
                  className="w-20 h-20 rounded-full bg-gradient-love text-white shadow-xl shadow-orange-200/50 hover:shadow-2xl hover:shadow-orange-300/60 hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center -mt-4 ring-4 ring-white"
                  aria-label="Connect"
                >
                  <Heart className="w-10 h-10 fill-white animate-pulse-slow" />
                </button>
              )}
           </div>
        )}
      </div>
    </div>
  );
};