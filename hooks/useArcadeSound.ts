import { useCallback, useState, useEffect } from 'react';
import { AudioEngine } from '../utils/audioEngine';

// PREMIUM ARCADE AUDIO HOOK
// Uses AudioEngine (Procedural) for guaranteed sound.

// Keys
const MUTE_STORAGE_KEY = 'arcade_muted';
const MUTE_EVENT_KEY = 'arcade_mute_change';

export const useArcadeSound = () => {
    // State for UI toggles
    const [isMuted, setIsMuted] = useState(() => {
        return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
    });

    // Sync state across components
    useEffect(() => {
        const handleStorageChange = () => {
            const muted = localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
            setIsMuted(muted);
        };

        window.addEventListener(MUTE_EVENT_KEY, handleStorageChange);
        return () => window.removeEventListener(MUTE_EVENT_KEY, handleStorageChange);
    }, []);

    const toggleMute = useCallback(() => {
        const newState = !isMuted;
        localStorage.setItem(MUTE_STORAGE_KEY, String(newState));
        setIsMuted(newState);
        // Dispatch event for other components
        window.dispatchEvent(new Event(MUTE_EVENT_KEY));

        // Resume context on user interaction (important for browsers)
        if (!newState) AudioEngine.resume();
    }, [isMuted]);

    // Wrappers
    const playSound = (fn: () => void) => {
        if (!isMuted) {
            AudioEngine.resume(); // Ensure context is running
            fn();
        }
    };

    const playPop = useCallback(() => playSound(AudioEngine.pop), [isMuted]);
    const playSwipe = useCallback(() => playSound(AudioEngine.swipe), [isMuted]);
    const playSmash = useCallback(() => playSound(AudioEngine.smash), [isMuted]);
    const playSuccess = useCallback(() => playSound(AudioEngine.success), [isMuted]);
    const playClick = useCallback(() => playSound(AudioEngine.click), [isMuted]);

    return {
        playPop,
        playSwipe,
        playSmash,
        playSuccess,
        playClick,
        isMuted,
        toggleMute
    };
};
