-- Migration to add gallery and video support
-- Run this in your Supabase SQL Editor

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gallery TEXT[],
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add new columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS media_url TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
