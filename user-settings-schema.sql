-- Add settings column to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "discovery": {
    "ageMin": 18,
    "ageMax": 99,
    "maxDistance": 50,
    "location": null
  },
  "notifications": {
    "newMatches": true,
    "messages": true,
    "dailyEditorial": false
  },
  "privacy": {
    "showOnlineStatus": true,
    "showDistance": true
  }
}'::jsonb;
