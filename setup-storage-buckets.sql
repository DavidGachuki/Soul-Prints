-- Supabase Storage Buckets Setup
-- Run this in Supabase SQL Editor to create storage buckets

-- Create profile-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create profile-videos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-videos', 'profile-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create chat-media bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for profile-photos
CREATE POLICY "Public Access for profile-photos" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Authenticated users can upload profile-photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Users can update their own profile-photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can delete their own profile-photos" ON storage.objects
FOR DELETE USING (bucket_id = 'profile-photos');

-- Set up storage policies for profile-videos
CREATE POLICY "Public Access for profile-videos" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-videos');

CREATE POLICY "Authenticated users can upload profile-videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'profile-videos');

CREATE POLICY "Users can update their own profile-videos" ON storage.objects
FOR UPDATE USING (bucket_id = 'profile-videos');

CREATE POLICY "Users can delete their own profile-videos" ON storage.objects
FOR DELETE USING (bucket_id = 'profile-videos');

-- Set up storage policies for chat-media
CREATE POLICY "Public Access for chat-media" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-media');

CREATE POLICY "Authenticated users can upload chat-media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chat-media');

CREATE POLICY "Users can update their own chat-media" ON storage.objects
FOR UPDATE USING (bucket_id = 'chat-media');

CREATE POLICY "Users can delete their own chat-media" ON storage.objects
FOR DELETE USING (bucket_id = 'chat-media');
