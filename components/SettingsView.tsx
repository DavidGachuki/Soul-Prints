import React, { useState, useEffect } from 'react';
import { Bell, Shield, Heart, LogOut, ChevronRight, User, Globe, MapPin, X } from 'lucide-react';
import { Button } from './Button';
import { UserProfile, UserSettings } from '../types';
import { getCurrentLocation } from '../services/locationService';

interface SettingsViewProps {
    user: UserProfile;
    onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    onLogout: () => void;
    onAdminAccess: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateProfile, onLogout, onAdminAccess }) => {
    // Initialize settings with defaults
    const defaultSettings: UserSettings = {
        discovery: {
            ageMin: 18,
            ageMax: 99,
            maxDistance: 50,
            location: undefined
        },
        notifications: {
            newMatches: true,
            messages: true,
            dailyEditorial: false
        },
        privacy: {
            showOnlineStatus: true,
            showDistance: true
        }
    };


    const [settings, setSettings] = useState<UserSettings>(user.settings || defaultSettings);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    // Debounce timer for slider changes
    const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null);

    // Save settings to database with debouncing
    const saveSettings = (newSettings: UserSettings) => {
        setSettings(newSettings);

        // Clear existing timer
        if (saveTimer) clearTimeout(saveTimer);

        // Set new timer to save after 500ms
        const timer = setTimeout(async () => {
            console.log('💾 Saving settings:', newSettings);
            await onUpdateProfile({ settings: newSettings });
        }, 500);

        setSaveTimer(timer);
    };

    // Handle location enable
    const handleEnableLocation = async () => {
        setIsLoadingLocation(true);
        const location = await getCurrentLocation();

        if (location) {
            const newSettings = {
                ...settings,
                discovery: {
                    ...settings.discovery,
                    location
                }
            };
            setSettings(newSettings);
            await onUpdateProfile({ settings: newSettings });
        } else {
            alert('Could not get your location. Please enable location permissions in your browser.');
        }

        setIsLoadingLocation(false);
    };

    return (
        <div className="flex-1 w-full h-full bg-[#FAFAFA] flex flex-col items-center p-6 md:p-12 pb-28 md:pb-12 overflow-y-auto">
            <div className="max-w-2xl w-full">
                <div className="mb-8">
                    <span className="text-xs font-bold tracking-[0.2em] text-editorial-accent uppercase block mb-1">Preferences</span>
                    <h2 className="font-serif-display text-4xl text-warm-text">Settings</h2>
                </div>

                <div className="space-y-6">
                    {/* Account Section */}
                    <section className="bg-white border border-editorial rounded-xl overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-editorial">
                            <h3 className="text-xs font-bold tracking-widest text-warm-text uppercase">Account</h3>
                        </div>
                        <div className="divide-y divide-editorial">
                            <SettingsItem
                                icon={<User size={18} />}
                                label="Personal Information"
                                onClick={() => setShowPersonalInfoModal(true)}
                            />
                            <SettingsItem
                                icon={<Shield size={18} />}
                                label="Privacy & Security"
                                onClick={() => setShowPrivacyModal(true)}
                            />
                        </div>
                    </section>

                    {/* Discovery Section */}
                    <section className="bg-white border border-editorial rounded-xl overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-editorial">
                            <h3 className="text-xs font-bold tracking-widest text-warm-text uppercase">Discovery</h3>
                        </div>
                        <div className="divide-y divide-editorial">
                            {/* Age Range Slider */}
                            <div className="px-6 py-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Heart size={18} className="text-warm-subtext" />
                                        <span className="font-medium text-warm-text">Age Range</span>
                                    </div>
                                    <span className="text-sm text-warm-subtext font-bold">
                                        {settings.discovery.ageMin} - {settings.discovery.ageMax}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-warm-subtext mb-1 block">Min Age: {settings.discovery.ageMin}</label>
                                        <input
                                            type="range"
                                            min="18"
                                            max="99"
                                            value={settings.discovery.ageMin}
                                            onChange={(e) => {
                                                const newMin = parseInt(e.target.value);
                                                if (newMin <= settings.discovery.ageMax) {
                                                    saveSettings({
                                                        ...settings,
                                                        discovery: { ...settings.discovery, ageMin: newMin }
                                                    });
                                                }
                                            }}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-editorial-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-warm-subtext mb-1 block">Max Age: {settings.discovery.ageMax}</label>
                                        <input
                                            type="range"
                                            min="18"
                                            max="99"
                                            value={settings.discovery.ageMax}
                                            onChange={(e) => {
                                                const newMax = parseInt(e.target.value);
                                                if (newMax >= settings.discovery.ageMin) {
                                                    saveSettings({
                                                        ...settings,
                                                        discovery: { ...settings.discovery, ageMax: newMax }
                                                    });
                                                }
                                            }}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-editorial-accent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Distance Slider */}
                            <div className="px-6 py-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Globe size={18} className="text-warm-subtext" />
                                        <span className="font-medium text-warm-text">Distance</span>
                                    </div>
                                    <span className="text-sm text-warm-subtext font-bold">
                                        Up to {settings.discovery.maxDistance} miles
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={settings.discovery.maxDistance}
                                    onChange={(e) => {
                                        saveSettings({
                                            ...settings,
                                            discovery: { ...settings.discovery, maxDistance: parseInt(e.target.value) }
                                        });
                                    }}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-editorial-accent"
                                />
                            </div>

                            {/* Location */}
                            <div className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <MapPin size={18} className="text-warm-subtext" />
                                        <div>
                                            <span className="font-medium text-warm-text block">Location</span>
                                            {settings.discovery.location?.city && (
                                                <span className="text-xs text-warm-subtext">{settings.discovery.location.city}</span>
                                            )}
                                        </div>
                                    </div>
                                    {!settings.discovery.location ? (
                                        <button
                                            onClick={handleEnableLocation}
                                            disabled={isLoadingLocation}
                                            className="px-4 py-2 bg-editorial-accent text-white rounded-lg text-sm font-medium hover:bg-editorial-accent/90 transition disabled:opacity-50"
                                        >
                                            {isLoadingLocation ? 'Getting...' : 'Enable'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleEnableLocation}
                                            disabled={isLoadingLocation}
                                            className="px-4 py-2 bg-gray-100 text-warm-text rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                                        >
                                            {isLoadingLocation ? 'Updating...' : 'Update'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notifications Section */}
                    <section className="bg-white border border-editorial rounded-xl overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-editorial">
                            <h3 className="text-xs font-bold tracking-widest text-warm-text uppercase">Notifications</h3>
                        </div>
                        <div className="divide-y divide-editorial">
                            <SettingsToggle
                                label="New Matches"
                                checked={settings.notifications.newMatches}
                                onChange={(checked) => {
                                    const newSettings = {
                                        ...settings,
                                        notifications: { ...settings.notifications, newMatches: checked }
                                    };
                                    setSettings(newSettings);
                                    onUpdateProfile({ settings: newSettings });
                                }}
                            />
                            <SettingsToggle
                                label="Messages"
                                checked={settings.notifications.messages}
                                onChange={(checked) => {
                                    const newSettings = {
                                        ...settings,
                                        notifications: { ...settings.notifications, messages: checked }
                                    };
                                    setSettings(newSettings);
                                    onUpdateProfile({ settings: newSettings });
                                }}
                            />
                            <SettingsToggle
                                label="Daily Editorial"
                                checked={settings.notifications.dailyEditorial}
                                onChange={(checked) => {
                                    const newSettings = {
                                        ...settings,
                                        notifications: { ...settings.notifications, dailyEditorial: checked }
                                    };
                                    setSettings(newSettings);
                                    onUpdateProfile({ settings: newSettings });
                                }}
                            />
                        </div>
                    </section>

                    <div className="pt-4 space-y-3">
                        <button
                            onClick={onAdminAccess}
                            className="w-full py-3 text-xs font-bold tracking-widest text-gray-400 hover:text-editorial-accent uppercase transition-colors"
                        >
                            • Access Admin Dashboard •
                        </button>

                        <Button
                            variant="secondary"
                            className="w-full justify-center text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
                            onClick={onLogout}
                        >
                            <LogOut size={16} className="mr-2" /> Log Out
                        </Button>
                        <p className="text-center text-xs text-warm-subtext mt-4">Version 1.0.0 • Soul Prints © 2024</p>
                    </div>
                </div>
            </div>

            {/* Personal Information Modal */}
            {showPersonalInfoModal && (
                <PersonalInfoModal
                    user={user}
                    onClose={() => setShowPersonalInfoModal(false)}
                    onSave={onUpdateProfile}
                />
            )}

            {/* Privacy & Security Modal */}
            {showPrivacyModal && (
                <PrivacyModal
                    settings={settings}
                    onClose={() => setShowPrivacyModal(false)}
                    onSave={(newSettings) => {
                        setSettings(newSettings);
                        onUpdateProfile({ settings: newSettings });
                    }}
                />
            )}
        </div>
    );
};

const SettingsItem = ({ icon, label, value, onClick }: { icon: React.ReactNode, label: string, value?: string, onClick?: () => void }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
        <div className="flex items-center gap-3 text-warm-text group-hover:text-editorial-accent transition-colors">
            <span className="text-warm-subtext group-hover:text-editorial-accent">{icon}</span>
            <span className="font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {value && <span className="text-sm text-warm-subtext">{value}</span>}
            <ChevronRight size={16} className="text-warm-subtext" />
        </div>
    </button>
);

const SettingsToggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (checked: boolean) => void }) => (
    <div className="flex items-center justify-between px-6 py-4">
        <span className="font-medium text-warm-text">{label}</span>
        <button
            onClick={() => onChange(!checked)}
            className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-editorial-accent' : 'bg-gray-200'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${checked ? 'left-7' : 'left-1'}`}></div>
        </button>
    </div>
);

// Personal Information Modal
const PersonalInfoModal = ({ user, onClose, onSave }: { user: UserProfile, onClose: () => void, onSave: (updates: Partial<UserProfile>) => Promise<void> }) => {
    const [name, setName] = useState(user.name);
    const [age, setAge] = useState(user.age);
    const [bio, setBio] = useState(user.bio);

    const handleSave = async () => {
        await onSave({ name, age, bio });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-editorial">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif-display text-2xl text-warm-text">Personal Information</h3>
                    <button onClick={onClose} className="text-warm-subtext hover:text-warm-text">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold tracking-widest text-warm-subtext uppercase block mb-2">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-editorial rounded-lg focus:outline-none focus:ring-2 focus:ring-editorial-accent"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold tracking-widest text-warm-subtext uppercase block mb-2">Age</label>
                        <input
                            type="number"
                            min="18"
                            max="99"
                            value={age}
                            onChange={(e) => setAge(parseInt(e.target.value))}
                            className="w-full px-4 py-3 border border-editorial rounded-lg focus:outline-none focus:ring-2 focus:ring-editorial-accent"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold tracking-widest text-warm-subtext uppercase block mb-2">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-editorial rounded-lg focus:outline-none focus:ring-2 focus:ring-editorial-accent resize-none"
                            placeholder="Tell us about yourself..."
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-editorial rounded-lg text-warm-text hover:bg-gray-50 transition font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-3 bg-editorial-accent text-white rounded-lg hover:bg-editorial-accent/90 transition font-medium"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// Privacy & Security Modal
const PrivacyModal = ({ settings, onClose, onSave }: { settings: UserSettings, onClose: () => void, onSave: (settings: UserSettings) => void }) => {
    const [showOnlineStatus, setShowOnlineStatus] = useState(settings.privacy.showOnlineStatus);
    const [showDistance, setShowDistance] = useState(settings.privacy.showDistance);
    const [city, setCity] = useState(settings.discovery.location?.city || '');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const handleGetCurrentLocation = async () => {
        setIsLoadingLocation(true);
        const location = await getCurrentLocation();

        if (location) {
            setCity(location.city || '');
        } else {
            alert('Could not get your location. Please enable location permissions or enter manually.');
        }

        setIsLoadingLocation(false);
    };

    const handleSave = () => {
        // Update location if city was changed
        const updatedSettings = {
            ...settings,
            privacy: {
                showOnlineStatus,
                showDistance
            },
            discovery: {
                ...settings.discovery,
                location: city ? {
                    latitude: settings.discovery.location?.latitude || 0,
                    longitude: settings.discovery.location?.longitude || 0,
                    city: city
                } : undefined
            }
        };

        onSave(updatedSettings);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-editorial max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif-display text-2xl text-warm-text">Privacy & Security</h3>
                    <button onClick={onClose} className="text-warm-subtext hover:text-warm-text">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Privacy Settings */}
                    <div>
                        <h4 className="text-xs font-bold tracking-widest text-warm-subtext uppercase mb-3">Privacy</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium text-warm-text">Show Online Status</p>
                                    <p className="text-xs text-warm-subtext mt-1">Let others see when you're active</p>
                                </div>
                                <button
                                    onClick={() => setShowOnlineStatus(!showOnlineStatus)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${showOnlineStatus ? 'bg-editorial-accent' : 'bg-gray-200'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${showOnlineStatus ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium text-warm-text">Show Distance</p>
                                    <p className="text-xs text-warm-subtext mt-1">Display your distance to matches</p>
                                </div>
                                <button
                                    onClick={() => setShowDistance(!showDistance)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${showDistance ? 'bg-editorial-accent' : 'bg-gray-200'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${showDistance ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Location Settings */}
                    <div className="border-t border-editorial pt-4">
                        <h4 className="text-xs font-bold tracking-widest text-warm-subtext uppercase mb-3">Location</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold tracking-widest text-warm-subtext uppercase block mb-2">
                                    City/Location
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="Enter your city"
                                        className="flex-1 px-4 py-3 border border-editorial rounded-lg focus:outline-none focus:ring-2 focus:ring-editorial-accent"
                                    />
                                    <button
                                        onClick={handleGetCurrentLocation}
                                        disabled={isLoadingLocation}
                                        className="px-4 py-3 bg-gray-100 text-warm-text rounded-lg hover:bg-gray-200 transition disabled:opacity-50 whitespace-nowrap"
                                        title="Use current location"
                                    >
                                        {isLoadingLocation ? '...' : <MapPin size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-warm-subtext mt-2">
                                    Your location helps us show you nearby matches
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-editorial rounded-lg text-warm-text hover:bg-gray-50 transition font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-3 bg-editorial-accent text-white rounded-lg hover:bg-editorial-accent/90 transition font-medium"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
