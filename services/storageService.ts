import { supabase } from './supabaseClient';

// File upload limits
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_CHAT_MEDIA_SIZE = 10 * 1024 * 1024; // 10MB

// Storage buckets
const BUCKETS = {
    PROFILE_PHOTOS: 'profile-photos',
    PROFILE_VIDEOS: 'profile-videos',
    CHAT_MEDIA: 'chat-media'
};

/**
 * Validate file size and type
 */
function validateFile(file: File, maxSize: number, allowedTypes: string[]): { valid: boolean; error?: string } {
    if (file.size > maxSize) {
        return { valid: false, error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` };
    }

    const fileType = file.type.split('/')[0];
    if (!allowedTypes.includes(fileType)) {
        return { valid: false, error: `File type must be ${allowedTypes.join(' or ')}` };
    }

    return { valid: true };
}

/**
 * Upload a profile photo
 */
export async function uploadProfilePhoto(file: File, userId: string): Promise<string | null> {
    console.log('📤 uploadProfilePhoto called with:', { fileName: file.name, fileSize: file.size, userId });

    const validation = validateFile(file, MAX_PHOTO_SIZE, ['image']);
    if (!validation.valid) {
        console.error('❌ Validation failed:', validation.error);
        alert(validation.error);
        return null;
    }
    console.log('✅ File validation passed');

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    console.log('📝 Generated file name:', fileName);

    try {
        console.log('⬆️ Starting upload to Supabase...');
        const { data, error } = await supabase.storage
            .from(BUCKETS.PROFILE_PHOTOS)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('❌ Supabase upload error:', error);
            throw error;
        }
        console.log('✅ Upload successful, data:', data);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKETS.PROFILE_PHOTOS)
            .getPublicUrl(fileName);

        console.log('🔗 Public URL generated:', publicUrl);
        return publicUrl;
    } catch (error) {
        console.error('❌ Error uploading photo:', error);
        alert('Failed to upload photo. Please try again.');
        return null;
    }
}

/**
 * Upload a profile video
 */
export async function uploadProfileVideo(file: File, userId: string): Promise<string | null> {
    const validation = validateFile(file, MAX_VIDEO_SIZE, ['video']);
    if (!validation.valid) {
        alert(validation.error);
        return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    try {
        const { data, error } = await supabase.storage
            .from(BUCKETS.PROFILE_VIDEOS)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKETS.PROFILE_VIDEOS)
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading video:', error);
        alert('Failed to upload video. Please try again.');
        return null;
    }
}

/**
 * Upload chat media (photo or video)
 */
export async function uploadChatMedia(file: File, matchId: string): Promise<{ url: string; type: 'image' | 'video' } | null> {
    const fileType = file.type.split('/')[0] as 'image' | 'video';
    const validation = validateFile(file, MAX_CHAT_MEDIA_SIZE, ['image', 'video']);

    if (!validation.valid) {
        alert(validation.error);
        return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${matchId}/${Date.now()}.${fileExt}`;

    try {
        const { data, error } = await supabase.storage
            .from(BUCKETS.CHAT_MEDIA)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKETS.CHAT_MEDIA)
            .getPublicUrl(fileName);

        return { url: publicUrl, type: fileType };
    } catch (error) {
        console.error('Error uploading chat media:', error);
        alert('Failed to upload media. Please try again.');
        return null;
    }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(bucket: string, filePath: string): Promise<boolean> {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
}

/**
 * Extract file path from Supabase public URL
 */
export function extractFilePathFromUrl(url: string, bucket: string): string | null {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split(`/object/public/${bucket}/`);
        return pathParts[1] || null;
    } catch {
        return null;
    }
}
