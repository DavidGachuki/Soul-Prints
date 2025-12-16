import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Edit2, Share2, Sparkles, Quote, Save, X, Camera } from 'lucide-react';
import { Button } from './Button';

interface ProfileViewProps {
    user: UserProfile;
    onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<UserProfile>>(user);

    useEffect(() => {
        console.log('👤 User profile updated:', user);
        setEditData(user);
    }, [user]);

    const handleSave = async () => {
        console.log('💾 Saving profile with data:', editData);
        console.log('📷 Gallery being saved:', editData.gallery);
        console.log('🖼️ Image URL being saved:', editData.imageUrl);
        await onUpdateProfile(editData);
        setIsEditing(false);
        console.log('✅ Profile save complete');
    };

    const handleCancel = () => {
        setEditData(user);
        setIsEditing(false);
    };

    return (
        <div className="flex-1 overflow-y-auto w-full h-full bg-[#FAFAFA] pb-28 md:pb-8">
            {/* Media Gallery Section */}
            <div className="w-full bg-[#FAFAFA] pt-8 px-6 md:px-12">
                <div className="max-w-4xl mx-auto mb-8 flex justify-between items-end">
                    <h1 className="font-serif-display text-4xl md:text-5xl font-bold">{editData.name || user.name}, {editData.age || user.age}</h1>
                    <div className="flex gap-2 shrink-0">
                        {isEditing ? (
                            <>
                                <Button variant="secondary" onClick={handleCancel} className="bg-red-500/80 text-white border-none hover:bg-red-600">
                                    <X size={20} />
                                </Button>
                                <Button variant="primary" onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white border-none">
                                    <Save size={20} />
                                </Button>
                            </>
                        ) : (
                            <>
                                <button className="p-2 bg-white border border-editorial hover:bg-gray-50 rounded-full transition-colors">
                                    <Share2 size={20} />
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 bg-white border border-editorial hover:bg-gray-50 rounded-full transition-colors"
                                >
                                    <Edit2 size={20} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <div className="max-w-4xl mx-auto mb-6 p-4 bg-white border border-editorial rounded-xl">
                        <div className="flex gap-4 mb-4">
                            <input
                                type="text"
                                value={editData.name || ''}
                                onChange={e => setEditData({ ...editData, name: e.target.value })}
                                className="bg-transparent border-b border-editorial text-2xl font-bold font-serif-display focus:outline-none w-full"
                                placeholder="Name"
                            />
                            <input
                                type="number"
                                value={editData.age || ''}
                                onChange={e => setEditData({ ...editData, age: parseInt(e.target.value) })}
                                className="bg-transparent border-b border-editorial text-2xl font-bold font-serif-display focus:outline-none w-24 text-center"
                                placeholder="Age"
                            />
                        </div>
                        <textarea
                            value={editData.bio || ''}
                            onChange={e => setEditData({ ...editData, bio: e.target.value })}
                            className="w-full bg-transparent border-b border-editorial text-lg font-light focus:outline-none resize-none h-20"
                            placeholder="Write a short bio..."
                        />
                        <div className="mt-4 flex gap-4">
                            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-bold">
                                <Camera size={16} /> Add Photo
                                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    console.log('📸 File selected:', file?.name, file?.size);
                                    if (file && user.id) {
                                        console.log('🚀 Uploading photo for user:', user.id);

                                        // Show loading state with temp preview
                                        const loadingUrl = URL.createObjectURL(file);
                                        const currentGallery = editData.gallery || user.gallery || [];
                                        console.log('📦 Current gallery before upload:', currentGallery);
                                        const tempGallery = [...currentGallery, loadingUrl];
                                        setEditData({ ...editData, gallery: tempGallery, imageUrl: editData.imageUrl || tempGallery[0] });

                                        try {
                                            const { uploadProfilePhoto } = await import('../services/storageService');
                                            const url = await uploadProfilePhoto(file, user.id);
                                            console.log('✅ Upload complete, URL:', url);

                                            if (url) {
                                                // Replace loading URL with actual URL
                                                const finalGallery = [...currentGallery, url].slice(0, 5);
                                                console.log('📷 Current gallery:', currentGallery);
                                                console.log('📷 Final gallery:', finalGallery);
                                                setEditData(prev => ({
                                                    ...prev,
                                                    gallery: finalGallery,
                                                    imageUrl: prev.imageUrl || finalGallery[0]
                                                }));

                                                // Delay cleanup to ensure state update completes
                                                setTimeout(() => URL.revokeObjectURL(loadingUrl), 1000);
                                            } else {
                                                console.error('❌ Upload failed - no URL returned');
                                                // Remove loading URL if upload failed
                                                setEditData(prev => ({ ...prev, gallery: currentGallery }));
                                                URL.revokeObjectURL(loadingUrl);
                                                alert('Upload failed. Please check console for errors.');
                                            }
                                        } catch (error) {
                                            console.error('❌ Upload error:', error);
                                            setEditData(prev => ({ ...prev, gallery: currentGallery }));
                                            URL.revokeObjectURL(loadingUrl);
                                            alert('Upload error: ' + (error as Error).message);
                                        }
                                    }
                                }} />
                            </label>
                            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-bold">
                                <Camera size={16} /> Set Video
                                <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file && user.id) {
                                        const { uploadProfileVideo } = await import('../services/storageService');
                                        const url = await uploadProfileVideo(file, user.id);
                                        if (url) {
                                            setEditData({ ...editData, videoUrl: url });
                                        }
                                    }
                                }} />
                            </label>
                        </div>
                        <p className="text-xs text-warm-subtext mt-2">Upload up to 5 photos and 1 short video (max 1 min).</p>
                    </div>
                )}

                {/* Visual Gallery */}
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px]">
                    {/* Main Slot (Video or Image) */}
                    <div className="h-full rounded-2xl overflow-hidden relative border border-editorial bg-gray-100 group">
                        {(editData.videoUrl || user.videoUrl) ? (
                            <video
                                src={editData.videoUrl || user.videoUrl}
                                className="w-full h-full object-cover"
                                autoPlay muted loop playsInline controls={!isEditing}
                            />
                        ) : (
                            <img
                                src={editData.imageUrl || (editData.gallery?.[0]) || user.imageUrl}
                                className="w-full h-full object-cover"
                                alt="Main Profile"
                            />
                        )}

                        {/* Change Photo Button (when in edit mode and showing photo) */}
                        {isEditing && !(editData.videoUrl || user.videoUrl) && (
                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                                <div className="bg-white text-warm-text px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg">
                                    <Camera size={20} />
                                    Change Photo
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file && user.id) {
                                            const { uploadProfilePhoto } = await import('../services/storageService');
                                            const url = await uploadProfilePhoto(file, user.id);
                                            if (url) {
                                                // Update main photo and add to gallery if not already there
                                                const newGallery = [url, ...(editData.gallery || []).filter(g => g !== url)].slice(0, 5);
                                                setEditData({ ...editData, imageUrl: url, gallery: newGallery });
                                            }
                                        }
                                    }}
                                />
                            </label>
                        )}

                        {/* Delete Video Button */}
                        {isEditing && (editData.videoUrl || user.videoUrl) && (
                            <button
                                onClick={() => setEditData({ ...editData, videoUrl: undefined })}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                            >
                                <X size={16} />
                            </button>
                        )}

                        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                            {(editData.videoUrl || user.videoUrl) ? 'Motion Profile' : 'Main Photo'}
                        </div>
                    </div>

                    {/* Grid of other photos */}
                    <div className="grid grid-cols-2 gap-4 h-full content-start">
                        {/* If we have a gallery, show items 1-4 (item 0 is used as main if no video, OR we show all unique) */}
                        {/* Actually, user wants up to 5 photos. Let's show them all here or in a scroll. */}
                        {/* Strategy: Main slot = Video OR Photo 1. Side slots = Photos 2-5. */}

                        {(() => {
                            const galleryToShow = editData.gallery || user.gallery || [user.imageUrl];
                            console.log('🖼️ Gallery to display:', galleryToShow);
                            console.log('🖼️ editData.gallery:', editData.gallery);
                            console.log('🖼️ user.gallery:', user.gallery);
                            return galleryToShow.slice(0, 4).map((img, idx) => (
                                <div key={idx} className="aspect-[3/4] rounded-xl overflow-hidden border border-editorial relative group bg-gray-100">
                                    <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                    {isEditing && (
                                        <button
                                            onClick={() => {
                                                const newGallery = (editData.gallery || user.gallery || []).filter((_, i) => i !== idx);
                                                setEditData({ ...editData, gallery: newGallery, imageUrl: newGallery[0] || '' });
                                            }}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ));
                        })()}
                        {/* Add Placeholders if in edit mode and less than 4 side photos */}
                        {isEditing && (editData.gallery?.length || 0) < 5 && (
                            <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-editorial/30 flex items-center justify-center text-warm-subtext">
                                <Camera size={24} className="opacity-50" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Bio Display (Non-Edit Mode) */}
                {!isEditing && (
                    <div className="max-w-4xl mx-auto mt-6">
                        <p className="font-light text-xl leading-relaxed text-warm-text">{user.bio}</p>
                    </div>
                )}
            </div>

            <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">

                {/* Deep Answers */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold tracking-widest text-warm-subtext uppercase border-b border-editorial pb-2">
                            What keeps you up at night?
                        </h3>
                        {isEditing ? (
                            <textarea
                                value={editData.deepAnswer1 || ''}
                                onChange={e => setEditData({ ...editData, deepAnswer1: e.target.value })}
                                className="w-full p-4 bg-white border border-editorial rounded-lg font-serif text-lg leading-relaxed text-warm-text focus:outline-none focus:ring-1 focus:ring-editorial-accent h-40"
                            />
                        ) : (
                            <p className="font-serif text-lg leading-relaxed text-warm-text">
                                {user.deepAnswer1}
                            </p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold tracking-widest text-warm-subtext uppercase border-b border-editorial pb-2">
                            Your Perfect Sunday
                        </h3>
                        {isEditing ? (
                            <textarea
                                value={editData.deepAnswer2 || ''}
                                onChange={e => setEditData({ ...editData, deepAnswer2: e.target.value })}
                                className="w-full p-4 bg-white border border-editorial rounded-lg font-serif text-lg leading-relaxed text-warm-text focus:outline-none focus:ring-1 focus:ring-editorial-accent h-40"
                            />
                        ) : (
                            <p className="font-serif text-lg leading-relaxed text-warm-text">
                                {user.deepAnswer2}
                            </p>
                        )}
                    </div>
                </section>

                {/* Soul Analysis Section (Read Only) */}
                {user.soulAnalysis && (
                    <section className="bg-editorial-secondary/10 border border-editorial p-8 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={100} className="text-editorial-accent" />
                        </div>

                        <h2 className="flex items-center gap-2 text-sm font-bold tracking-[0.2em] text-editorial-accent uppercase mb-4">
                            <Sparkles size={16} />
                            Soul Analysis
                        </h2>
                        {isEditing && <p className="text-xs text-warm-subtext mb-2">(AI Analysis updates automatically based on your answers)</p>}
                        <p className="font-serif text-xl md:text-2xl leading-relaxed text-warm-text italic">
                            "{user.soulAnalysis}"
                        </p>
                    </section>
                )}

                {/* Interests */}
                <section>
                    <h3 className="text-xs font-bold tracking-widest text-warm-subtext uppercase mb-6">
                        Passions & Interests
                    </h3>
                    {isEditing ? (
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {editData.interests?.map((interest, i) => (
                                    <span key={i} className="px-4 py-1 rounded-full bg-editorial-secondary/30 text-warm-text flex items-center gap-2">
                                        {interest}
                                        <button onClick={() => setEditData({ ...editData, interests: editData.interests?.filter((_, index) => index !== i) })} className="hover:text-red-500">
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add an interest..."
                                    className="flex-1 p-3 bg-white border border-editorial rounded-lg focus:outline-none focus:ring-1 focus:ring-editorial-accent"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = e.currentTarget.value.trim();
                                            if (val) {
                                                setEditData({ ...editData, interests: [...(editData.interests || []), val] });
                                                e.currentTarget.value = '';
                                            }
                                        }
                                    }}
                                />
                                <Button variant="secondary" onClick={() => {
                                    // Add logic if button clicked instead of enter
                                    const input = document.querySelector('input[placeholder="Add an interest..."]') as HTMLInputElement;
                                    if (input && input.value.trim()) {
                                        setEditData({ ...editData, interests: [...(editData.interests || []), input.value.trim()] });
                                        input.value = '';
                                    }
                                }}>Add</Button>
                            </div>
                            <p className="text-xs text-warm-subtext mt-1">Press Enter to add</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {user.interests.map((interest, i) => (
                                <span key={i} className="px-6 py-2 rounded-full border border-editorial text-warm-text hover:bg-editorial-secondary/20 transition-colors cursor-default">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

