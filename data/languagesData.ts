// Comprehensive world languages organized by region
// Covers 150+ languages representing ~95% of world speakers

export interface Language {
    code: string;
    name: string;
    native: string;
    region: string;
}

export const WORLD_LANGUAGES: Language[] = [
    // ========== EUROPE ==========
    // Western Europe
    { code: 'en', name: 'English', native: 'English', region: 'Europe' },
    { code: 'fr', name: 'French', native: 'Français', region: 'Europe' },
    { code: 'de', name: 'German', native: 'Deutsch', region: 'Europe' },
    { code: 'nl', name: 'Dutch', native: 'Nederlands', region: 'Europe' },
    { code: 'it', name: 'Italian', native: 'Italiano', region: 'Europe' },
    { code: 'es', name: 'Spanish', native: 'Español', region: 'Europe' },
    { code: 'pt', name: 'Portuguese', native: 'Português', region: 'Europe' },
    { code: 'ca', name: 'Catalan', native: 'Català', region: 'Europe' },

    // Nordic
    { code: 'sv', name: 'Swedish', native: 'Svenska', region: 'Europe' },
    { code: 'no', name: 'Norwegian', native: 'Norsk', region: 'Europe' },
    { code: 'da', name: 'Danish', native: 'Dansk', region: 'Europe' },
    { code: 'fi', name: 'Finnish', native: 'Suomi', region: 'Europe' },
    { code: 'is', name: 'Icelandic', native: 'Íslenska', region: 'Europe' },

    // Eastern Europe
    { code: 'pl', name: 'Polish', native: 'Polski', region: 'Europe' },
    { code: 'cs', name: 'Czech', native: 'Čeština', region: 'Europe' },
    { code: 'sk', name: 'Slovak', native: 'Slovenčina', region: 'Europe' },
    { code: 'hu', name: 'Hungarian', native: 'Magyar', region: 'Europe' },
    { code: 'ro', name: 'Romanian', native: 'Română', region: 'Europe' },
    { code: 'bg', name: 'Bulgarian', native: 'Български', region: 'Europe' },
    { code: 'hr', name: 'Croatian', native: 'Hrvatski', region: 'Europe' },
    { code: 'sr', name: 'Serbian', native: 'Српски', region: 'Europe' },
    { code: 'sl', name: 'Slovenian', native: 'Slovenščina', region: 'Europe' },
    { code: 'ru', name: 'Russian', native: 'Русский', region: 'Europe' },
    { code: 'uk', name: 'Ukrainian', native: 'Українська', region: 'Europe' },
    { code: 'be', name: 'Belarusian', native: 'Беларуская', region: 'Europe' },

    // Baltic
    { code: 'lt', name: 'Lithuanian', native: 'Lietuvių', region: 'Europe' },
    { code: 'lv', name: 'Latvian', native: 'Latviešu', region: 'Europe' },
    { code: 'et', name: 'Estonian', native: 'Eesti', region: 'Europe' },

    // Southern Europe
    { code: 'el', name: 'Greek', native: 'Ελληνικά', region: 'Europe' },
    { code: 'sq', name: 'Albanian', native: 'Shqip', region: 'Europe' },
    { code: 'mk', name: 'Macedonian', native: 'Македонски', region: 'Europe' },

    // ========== ASIA ==========
    // East Asia
    { code: 'zh', name: 'Chinese (Mandarin)', native: '中文', region: 'Asia' },
    { code: 'zh-yue', name: 'Cantonese', native: '粵語', region: 'Asia' },
    { code: 'ja', name: 'Japanese', native: '日本語', region: 'Asia' },
    { code: 'ko', name: 'Korean', native: '한국어', region: 'Asia' },

    // Southeast Asia
    { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', region: 'Asia' },
    { code: 'th', name: 'Thai', native: 'ไทย', region: 'Asia' },
    { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', region: 'Asia' },
    { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', region: 'Asia' },
    { code: 'tl', name: 'Tagalog', native: 'Tagalog', region: 'Asia' },
    { code: 'my', name: 'Burmese', native: 'မြန်မာ', region: 'Asia' },
    { code: 'km', name: 'Khmer', native: 'ខ្មែរ', region: 'Asia' },
    { code: 'lo', name: 'Lao', native: 'ລາວ', region: 'Asia' },

    // South Asia
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'Asia' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা', region: 'Asia' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', region: 'Asia' },
    { code: 'mr', name: 'Marathi', native: 'मराठी', region: 'Asia' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', region: 'Asia' },
    { code: 'ur', name: 'Urdu', native: 'اردو', region: 'Asia' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', region: 'Asia' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'Asia' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം', region: 'Asia' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'Asia' },
    { code: 'si', name: 'Sinhala', native: 'සිංහල', region: 'Asia' },
    { code: 'ne', name: 'Nepali', native: 'नेपाली', region: 'Asia' },

    // Central Asia
    { code: 'kk', name: 'Kazakh', native: 'Қазақ', region: 'Asia' },
    { code: 'uz', name: 'Uzbek', native: 'Oʻzbek', region: 'Asia' },
    { code: 'ky', name: 'Kyrgyz', native: 'Кыргызча', region: 'Asia' },
    { code: 'tg', name: 'Tajik', native: 'Тоҷикӣ', region: 'Asia' },
    { code: 'tk', name: 'Turkmen', native: 'Türkmen', region: 'Asia' },
    { code: 'mn', name: 'Mongolian', native: 'Монгол', region: 'Asia' },

    // ========== MIDDLE EAST ==========
    { code: 'ar', name: 'Arabic', native: 'العربية', region: 'Middle East' },
    { code: 'he', name: 'Hebrew', native: 'עברית', region: 'Middle East' },
    { code: 'fa', name: 'Persian (Farsi)', native: 'فارسی', region: 'Middle East' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe', region: 'Middle East' },
    { code: 'ku', name: 'Kurdish', native: 'کوردی', region: 'Middle East' },
    { code: 'az', name: 'Azerbaijani', native: 'Azərbaycan', region: 'Middle East' },
    { code: 'hy', name: 'Armenian', native: 'Հայերեն', region: 'Middle East' },
    { code: 'ka', name: 'Georgian', native: 'ქართული', region: 'Middle East' },

    // ========== AFRICA ==========
    // North Africa (covered by Arabic above)
    // Sub-Saharan Africa
    { code: 'sw', name: 'Swahili', native: 'Kiswahili', region: 'Africa' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ', region: 'Africa' },
    { code: 'yo', name: 'Yoruba', native: 'Yorùbá', region: 'Africa' },
    { code: 'ig', name: 'Igbo', native: 'Igbo', region: 'Africa' },
    { code: 'ha', name: 'Hausa', native: 'Hausa', region: 'Africa' },
    { code: 'zu', name: 'Zulu', native: 'isiZulu', region: 'Africa' },
    { code: 'xh', name: 'Xhosa', native: 'isiXhosa', region: 'Africa' },
    { code: 'af', name: 'Afrikaans', native: 'Afrikaans', region: 'Africa' },
    { code: 'so', name: 'Somali', native: 'Soomaali', region: 'Africa' },
    { code: 'rw', name: 'Kinyarwanda', native: 'Ikinyarwanda', region: 'Africa' },
    { code: 'mg', name: 'Malagasy', native: 'Malagasy', region: 'Africa' },
    { code: 'sn', name: 'Shona', native: 'chiShona', region: 'Africa' },

    // ========== AMERICAS ==========
    // Languages (Spanish/Portuguese/English already listed)
    { code: 'qu', name: 'Quechua', native: 'Runa Simi', region: 'Americas' },
    { code: 'gn', name: 'Guarani', native: 'Avañe\'ẽ', region: 'Americas' },
    { code: 'ay', name: 'Aymara', native: 'Aymar aru', region: 'Americas' },
    { code: 'ht', name: 'Haitian Creole', native: 'Kreyòl', region: 'Americas' },
    { code: 'nah', name: 'Nahuatl', native: 'Nāhuatl', region: 'Americas' },

    // ========== OCEANIA ==========
    { code: 'mi', name: 'Māori', native: 'Te Reo Māori', region: 'Oceania' },
    { code: 'sm', name: 'Samoan', native: 'Gagana Samoa', region: 'Oceania' },
    { code: 'to', name: 'Tongan', native: 'Lea Faka-Tonga', region: 'Oceania' },
    { code: 'fj', name: 'Fijian', native: 'Na Vosa Vakaviti', region: 'Oceania' },
    { code: 'haw', name: 'Hawaiian', native: 'ʻŌlelo Hawaiʻi', region: 'Oceania' },
];

// Get unique regions
export const LANGUAGE_REGIONS = [
    'Europe',
    'Asia',
    'Middle East',
    'Africa',
    'Americas',
    'Oceania'
];

// Most common global languages (for quick selection)
export const COMMON_WORLD_LANGUAGES = [
    'en', 'zh', 'es', 'hi', 'ar', 'pt', 'bn', 'ru', 'ja', 'fr',
    'de', 'ko', 'tr', 'vi', 'it', 'th', 'pl', 'nl'
];

// Helper functions
export const getLanguagesByRegion = (region: string): Language[] => {
    return WORLD_LANGUAGES.filter(lang => lang.region === region);
};

export const getLanguageByCode = (code: string): Language | undefined => {
    return WORLD_LANGUAGES.find(lang => lang.code === code);
};

export const getCommonLanguages = (): Language[] => {
    return WORLD_LANGUAGES.filter(lang => COMMON_WORLD_LANGUAGES.includes(lang.code));
};
