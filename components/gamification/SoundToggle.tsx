import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useArcadeSound } from '../../hooks/useArcadeSound';

export const SoundToggle: React.FC = () => {
    const { isMuted, toggleMute } = useArcadeSound();

    return (
        <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors border border-white/10 group"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
        >
            {isMuted ? (
                <VolumeX size={20} className="text-white/60 group-hover:text-red-400 transition-colors" />
            ) : (
                <Volume2 size={20} className="text-white/80 group-hover:text-green-400 transition-colors" />
            )}
        </button>
    );
};
