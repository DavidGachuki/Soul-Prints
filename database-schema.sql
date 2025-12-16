-- Soul Prints Database Schema
-- Execute this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  bio TEXT,
  interests TEXT[],
  image_url TEXT,
  gallery TEXT[],
  video_url TEXT,
  deep_answer_1 TEXT NOT NULL,
  deep_answer_2 TEXT NOT NULL,
  soul_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id_1 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  profile_id_2 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  compatibility_score INTEGER,
  compatibility_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id_1, profile_id_2)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  media_url TEXT,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for now - can be restricted later with auth)
CREATE POLICY "Allow all on profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all on matches" ON matches FOR ALL USING (true);
CREATE POLICY "Allow all on messages" ON messages FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_profile_1 ON matches(profile_id_1);
CREATE INDEX IF NOT EXISTS idx_matches_profile_2 ON matches(profile_id_2);
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
