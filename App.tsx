import React, { useState, useEffect, useRef } from 'react';
import {
  AppView,
  UserProfile,
  MatchProfile,
  Message,
  LoadingState
} from './types';
import { Button } from './components/Button';
import { ProfileCard } from './components/ProfileCard';
import { EditorialSidebar } from './components/EditorialSidebar';
import { StoryCard } from './components/StoryCard';
import { OnboardingView } from './components/OnboardingView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { AdminView } from './components/AdminView';
import { QuestionnaireModal } from './components/QuestionnaireModal';
import { ProfileEnhancementBanner } from './components/ProfileEnhancementBanner';
import { analyzeSoulPrint, calculateCompatibility, generateChatResponse } from './services/geminiService';
import { getProfileCompletionStatus } from './services/profileCompletionService';
import * as db from './services/databaseService';
import { Sparkles, MessageCircle, ArrowLeft, Send, Search, Compass, LogOut, Heart, Flower, User, Coffee, Settings, Paperclip } from 'lucide-react';

// --- Mock Data ---
const MOCK_PROFILES: MatchProfile[] = [
  {
    id: '1',
    name: 'Elara',
    age: 24,
    bio: 'Looking for someone to share sunsets with.',
    interests: ['Photography', 'Poetry', 'Coffee'],
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2787&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2787&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?q=80&w=2787'
    ],
    deepAnswer1: 'I stay awake thinking about how big the universe is, and how small our worries are.',
    deepAnswer2: 'A slow morning with jazz records, rain against the window, and a warm mug.',
    soulAnalysis: "A gentle dreamer who finds beauty in the quiet moments."
  },
  {
    id: '2',
    name: 'Liam',
    age: 28,
    bio: "Let's build something beautiful together.",
    interests: ['Architecture', 'Hiking', 'Cooking'],
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2787&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2787&auto=format&fit=crop'],
    deepAnswer1: "Thinking about whether I'm making enough of a positive impact on the world.",
    deepAnswer2: 'Hiking up a mountain to catch the sunrise, then brunch with friends.',
    soulAnalysis: "A grounded spirit with a heart full of ambition and kindness."
  },
  {
    id: '3',
    name: 'Maya',
    age: 26,
    bio: 'Art is my love language.',
    interests: ['Painting', 'Galleries', 'Wine'],
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop'],
    deepAnswer1: 'The fear of time passing too quickly without capturing enough memories.',
    deepAnswer2: 'Waking up naturally, painting for hours, then a long walk in the park.',
    soulAnalysis: "A creative soul who treasures deep emotional expression."
  },
  {
    id: '4',
    name: 'Julian',
    age: 30,
    bio: 'Seeking deep conversations and spontaneous adventures.',
    interests: ['Philosophy', 'Travel', 'Vinyl'],
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2487&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2487&auto=format&fit=crop'],
    deepAnswer1: 'Wondering if we truly have free will or if our paths are written in the stars.',
    deepAnswer2: 'Getting lost in a foreign city with no map, just following the music.',
    soulAnalysis: "An intellectual wanderer seeking truth and authentic connection."
  },
  {
    id: '5',
    name: 'Amara',
    age: 27,
    bio: 'Plant mom & tea enthusiast.',
    interests: ['Gardening', 'Yoga', 'Reading'],
    imageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=2487&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=2487&auto=format&fit=crop'],
    deepAnswer1: 'The hope that I can heal the parts of myself I usually hide.',
    deepAnswer2: 'Yoga at sunrise, tending to my garden, and reading by the window.',
    soulAnalysis: "A nurturing spirit who values growth, peace, and inner light."
  },
  {
    id: '6',
    name: 'Kael',
    age: 25,
    bio: 'Music says what words cannot.',
    interests: ['Guitar', 'Concerts', 'Road Trips'],
    imageUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=2487&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=2487&auto=format&fit=crop'],
    deepAnswer1: "The melody that I can hear in my head but haven't been able to play yet.",
    deepAnswer2: 'Driving down the coast with the windows down and the perfect playlist.',
    soulAnalysis: "A passionate artist attuned to the rhythm of life and emotion."
  },
  {
    id: '7',
    name: 'Sophie',
    age: 29,
    bio: 'Kindness is the highest form of intelligence.',
    interests: ['Volunteering', 'Baking', 'Dogs'],
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2459&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2459&auto=format&fit=crop'],
    deepAnswer1: 'Worrying if I told the people I love how much they mean to me.',
    deepAnswer2: 'Baking fresh bread, a long walk with my dog, and a family dinner.',
    soulAnalysis: "A warm-hearted giver who finds joy in nourishing others."
  },
  {
    id: '8',
    name: 'Marcus',
    age: 32,
    bio: 'Restoring old things to new life.',
    interests: ['Woodworking', 'History', 'Whiskey'],
    imageUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=2568&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=2568&auto=format&fit=crop'],
    deepAnswer1: 'The legacy I will leave behind when I am gone.',
    deepAnswer2: 'Working in the shop until noon, then a BBQ with close friends.',
    soulAnalysis: "A steady, reliable soul who values craftsmanship and tradition."
  },
  {
    id: '9',
    name: 'Elena',
    age: 28,
    bio: 'Stargazer and night owl.',
    interests: ['Astronomy', 'Sci-Fi', 'Camping'],
    imageUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=2727&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=2727&auto=format&fit=crop'],
    deepAnswer1: 'The infinite silence of space and the possibility of life elsewhere.',
    deepAnswer2: 'Camping under a dark sky, identifying constellations, and total silence.',
    soulAnalysis: "A visionary thinker who finds comfort in the vastness of the unknown."
  },
  {
    id: '10',
    name: 'Noah',
    age: 26,
    bio: 'Chasing waves and good vibes.',
    interests: ['Surfing', 'Ocean', 'Sustainability'],
    imageUrl: 'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?q=80&w=2787&auto=format&fit=crop',
    gallery: ['https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?q=80&w=2787&auto=format&fit=crop'],
    deepAnswer1: 'The state of our oceans and what the world will look like in 50 years.',
    deepAnswer2: 'Catching the early swell, a big breakfast, and a nap in a hammock.',
    soulAnalysis: "A free spirit deeply connected to nature and the flow of energy."
  }
];

export default function App() {
  // --- STATE ---
  /* TEMP: Force Discovery & User */
  /* const [currentView, setCurrentView] = useState<AppView>(AppView.DISCOVERY);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({ id: 'debug-user', name: 'Debug', age: 25, bio: '', interests: [], imageUrl: '', gallery: [], deepAnswer1: '', deepAnswer2: '', soulAnalysis: '' } as any); */
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [matchedProfiles, setMatchedProfiles] = useState<MatchProfile[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<MatchProfile[]>(MOCK_PROFILES);
  const [chatSessions, setChatSessions] = useState<Record<string, Message[]>>({});
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [chatInput, setChatInput] = useState('');
  const [typingChatId, setTypingChatId] = useState<string | null>(null);
  const [generatedNames, setGeneratedNames] = useState<any[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(100);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Simple Router
  useEffect(() => {
    // Handle initial load
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentView(AppView.ADMIN);
    }

    // Handle back/forward buttons
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setCurrentView(AppView.ADMIN);
      } else {
        // If back to root, verify if we have a user to determine view
        if (currentUser) {
          // Default to discovery or profile if logged in
          // For simplicity in this non-auth router, we might just go to settings or discovery
          // But since we track state, we rely on state for logged-in views usually.
          setCurrentView(AppView.SETTINGS); // Fallback to settings if coming back from admin
        } else {
          setCurrentView(AppView.LANDING);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  // Check Profile Completion
  useEffect(() => {
    if (currentUser) {
      checkCompletion();
      // Check banner dismissal
      const dismissed = localStorage.getItem(`banner-dismissed-${currentUser.id}`);
      setIsBannerDismissed(!!dismissed);
    }
  }, [currentUser, showQuestionnaire]);

  const checkCompletion = async () => {
    if (!currentUser) return;
    const status = await getProfileCompletionStatus(currentUser.id);
    setProfileCompletion(status.percentage);
  };

  // Navigate to Admin
  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setCurrentView(AppView.ADMIN);
  };

  // Exit Admin
  const exitAdmin = () => {
    window.history.pushState({}, '', '/');
    setCurrentView(AppView.SETTINGS);
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---
  const handleCreateProfile = async (data: any) => {
    setLoadingState(LoadingState.LOADING);

    // Upload photo if user selected a file
    let imageUrl = data.photoUrl;
    const pendingFile = (window as any).__pendingPhotoFile;
    if (pendingFile) {
      const { uploadProfilePhoto } = await import('./services/storageService');
      // Use temporary ID for upload, will update after profile creation
      const tempId = 'temp-' + Date.now();
      const uploadedUrl = await uploadProfilePhoto(pendingFile, tempId);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
      delete (window as any).__pendingPhotoFile;
    }

    // Fallback to placeholder if no image
    if (!imageUrl || imageUrl.startsWith('data:')) {
      imageUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2960&auto=format&fit=crop';
    }

    // Synthesize Bio
    const bio = `I'm a ${data.fridayEve < 40 ? 'quiet soul' : 'social spirit'} who loves ${data.energizer.toLowerCase()}. ${data.sharedVsDiff < 50 ? 'Looking for a partner to share hobbies with.' : 'Opposites attract!'}`;

    // We pass the "Passion" as answer1 and "Sunday" as answer2 for now to map to legacy schema
    const analysis = await analyzeSoulPrint(data.name, data.passion, data.idealSunday);

    const newUserData: Omit<UserProfile, 'id'> = {
      name: data.name,
      age: parseInt(data.age),
      bio: bio,
      interests: [data.topic, data.energizer, 'Love'], // Initial interests from quiz
      imageUrl: imageUrl,
      gallery: [imageUrl], // Default gallery to profile pic
      deepAnswer1: data.passion,
      deepAnswer2: data.idealSunday,
      soulAnalysis: analysis

    };

    // Save profile to database
    const savedProfile = await db.createProfile(newUserData);
    if (!savedProfile) {
      setLoadingState(LoadingState.ERROR);
      alert('Failed to create profile. Please try again.');
      return;
    }

    setCurrentUser(savedProfile);

    // Load potential matches from database
    const matches = await db.getPotentialMatches(savedProfile.id);

    // Calculate compatibility for each match
    const processedMatches = await Promise.all(matches.map(async (p) => {
      const comp = await calculateCompatibility(savedProfile, p);
      return { ...p, compatibilityScore: comp.score, compatibilityReason: comp.reason };
    }));

    setPotentialMatches(processedMatches);
    setLoadingState(LoadingState.IDLE);
    setCurrentView(AppView.DISCOVERY);
  };

  const handleLike = async (profile: MatchProfile) => {
    if (!currentUser || isAnimating) return;

    // Trigger Animation
    setIsAnimating(true);
    await new Promise(r => setTimeout(r, 600)); // Wait for animation to finish

    // Create match in database
    const matchId = await db.createMatch(
      currentUser.id,
      profile.id,
      profile.compatibilityScore,
      profile.compatibilityReason
    );

    if (!matchId) {
      setIsAnimating(false);
      alert('Failed to create match. Please try again.');
      return;
    }

    setMatchedProfiles(prev => [profile, ...prev]);
    setPotentialMatches(prev => prev.filter(p => p.id !== profile.id));
    setIsAnimating(false);

    // Send initial message to database
    const initialMsg = await db.sendMessage(
      matchId,
      profile.id,
      `Hi ${currentUser.name}! ${profile.compatibilityReason} I'd love to chat.`,
      true
    );

    if (initialMsg) {
      setChatSessions(prev => ({
        ...prev,
        [profile.id]: [initialMsg]
      }));
    }
  };


  const handlePass = (profileId: string) => {
    setPotentialMatches(prev => prev.filter(p => p.id !== profileId));
  };

  const handleSendMessage = async (e?: React.FormEvent, mediaType?: 'image' | 'video', mediaUrl?: string) => {
    if (e) e.preventDefault();

    // Determine text content
    const text = chatInput.trim();
    if (!text && !mediaUrl) return; // Must have text OR media

    if (activeChatId && currentUser) {
      // Clear input immediately if it was text
      if (text) setChatInput('');

      // Send to DB
      const sentMsg = await db.sendMessage(activeChatId, 'user-me', text, false, mediaType, mediaUrl);
      if (!sentMsg) return;

      // Optimistic Update (if listener is slow, but listener usually handles this)
      // setChatSessions(prev => ({
      //   ...prev,
      //   [activeChatId]: [...(prev[activeChatId] || []), sentMsg]
      // }));

      // ... existing response logic
      const userMessage = text;

      // Simulate AI Typing
      setTypingChatId(activeChatId);

      // Generate Response
      const match = matchedProfiles.find(p => p.id === activeChatId);
      if (match) {
        const fullHistory = chatSessions[activeChatId] || [];
        // Add user msg to history for context
        const historyWithUser = [...fullHistory, sentMsg];
        const responseText = await generateChatResponse(match, historyWithUser, mediaUrl ? '[Sent a media attachment]' : userMessage);

        // Send AI Message
        await db.sendMessage(activeChatId, match.id, responseText, true);
        setTypingChatId(null);
      }
    }
  };

  const handleSendMedia = async () => {
    // Create hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';

    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file || !activeChatId) return;

      const { uploadChatMedia } = await import('./services/storageService');
      const result = await uploadChatMedia(file, activeChatId);

      if (result) {
        await handleSendMessage(undefined, result.type, result.url);
      }
    };

    input.click();
  };



  // Load matches and messages when user is set
  useEffect(() => {
    if (!currentUser) return;

    const loadMatches = async () => {
      const matches = await db.getMatches(currentUser.id);
      setMatchedProfiles(matches);

      // Load messages for each match
      const sessions: Record<string, Message[]> = {};
      for (const match of matches) {
        const matchId = await db.getMatchIdForProfiles(currentUser.id, match.id);
        if (matchId) {
          const messages = await db.getMessages(matchId);
          sessions[match.id] = messages;
        }
      }
      setChatSessions(sessions);
    };

    loadMatches();
  }, [currentUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatSessions, activeChatId]);

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    setLoadingState(LoadingState.LOADING);
    const updatedProfile = await db.updateProfile(currentUser.id, updates);
    if (updatedProfile) {
      setCurrentUser(updatedProfile);
    } else {
      alert('Failed to update profile.');
    }
    setLoadingState(LoadingState.IDLE);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setMatchedProfiles([]);
    setPotentialMatches([]);
    setChatSessions({});
    setActiveChatId(null);
    setCurrentView(AppView.LANDING);
  };


  // --- LANDING PAGE ---
  if (currentView === AppView.LANDING) {
    return (
      <div className="min-h-screen bg-warm-bg flex flex-col relative overflow-hidden font-sans">
        {/* Soft Background Blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-secondary/10 rounded-full blur-[80px] pointer-events-none mix-blend-multiply animate-float"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[80px] pointer-events-none mix-blend-multiply animate-float" style={{ animationDelay: '2s' }}></div>

        {/* Navigation */}
        <nav className="relative z-20 flex justify-between items-center p-8 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2 text-brand-primary">
            <Heart className="w-8 h-8 fill-brand-primary" />
            <span className="text-2xl font-serif font-bold text-warm-text">Soul Prints</span>
          </div>
          <Button variant="ghost" onClick={() => setCurrentView(AppView.PROFILE_CREATION)}>
            Sign In
          </Button>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col justify-center items-center relative z-10 px-6 text-center max-w-4xl mx-auto">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-sm text-brand-secondary font-medium animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Compatibility</span>
          </div>

          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl text-warm-text font-medium leading-tight mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Connect on a <br />
            <span className="text-transparent bg-clip-text bg-gradient-love italic">Deeper Level.</span>
          </h1>

          <p className="text-xl text-warm-subtext max-w-2xl leading-relaxed mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            We believe love isn't just about photos. It's about shared values, deep thoughts, and the quiet moments. Let our AI find the soul that echoes yours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button variant="primary" size="lg" onClick={() => setCurrentView(AppView.PROFILE_CREATION)}>
              Find Your Match
            </Button>
            <Button variant="secondary" size="lg">
              Our Story
            </Button>
          </div>

          <div className="mt-16 flex items-center gap-4 text-sm text-warm-subtext animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="" />
              <img className="w-10 h-10 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="" />
              <img className="w-10 h-10 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" alt="" />
            </div>
            <p>Joined by 10,000+ romantics</p>
          </div>
        </main>
      </div>
    );
  }

  // --- ONBOARDING ---
  if (currentView === AppView.PROFILE_CREATION) {
    return (
      <OnboardingView onComplete={handleCreateProfile} isLoading={loadingState === LoadingState.LOADING} />
    );
  }

  // --- ADMIN VIEW (Standalone) ---
  if (currentView === AppView.ADMIN) {
    return (
      <AdminView onBack={exitAdmin} />
    );
  }

  // --- APP LAYOUT ---
  const isChatMobile = currentView === AppView.CHAT && activeChatId !== null;

  return (
    <div className="flex h-screen w-full bg-warm-bg text-warm-text font-sans overflow-hidden">

      {/* NEW NAVIGATION SIDEBAR */}
      <EditorialSidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        activeChatId={activeChatId}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative h-full flex overflow-hidden bg-white md:rounded-l-[3rem] shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.05)] border-l border-editorial">

        {/* DISCOVERY VIEW - EDITORIAL STYLE */}
        {currentView === AppView.DISCOVERY && (
          <div className="flex-1 flex flex-col items-center p-4 md:p-12 pb-28 md:pb-12 relative overflow-y-auto w-full">

            {/* Editorial Header Layout */}
            <div className="w-full max-w-7xl mb-8">
              {currentUser && !showQuestionnaire && profileCompletion < 100 && !isBannerDismissed && (
                <ProfileEnhancementBanner
                  userId={currentUser.id}
                  onStartQuestionnaire={() => setShowQuestionnaire(true)}
                  onDismiss={() => {
                    setIsBannerDismissed(true);
                    localStorage.setItem(`banner-dismissed-${currentUser.id}`, 'true');
                  }}
                />
              )}
            </div>

            <div className="w-full max-w-7xl mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 px-2 md:px-0">

              {/* Left: Title */}
              <div className="text-left">
                <span className="text-xs font-bold tracking-[0.2em] text-editorial-accent uppercase block mb-2">Discover</span>
                <h2 className="font-serif-display text-4xl md:text-5xl text-warm-text leading-tight">
                  Curated <br className="hidden md:block" /> Souls
                </h2>
              </div>

              {/* Right: Insight Widget (Banner) */}
              {/* Right: Insight Widget (Banner) - REMOVED */}

            </div>

            <div className="w-full max-w-7xl flex items-center justify-center pb-12 relative">
              {/* Animation Overlay */}
              {isAnimating && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                  {/* Central Main Flower */}
                  <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 animate-flower-burst" style={{ '--tw-translate-x': '0px' } as React.CSSProperties}>
                    <div className="w-24 h-24 bg-editorial-accent rounded-full flex items-center justify-center shadow-xl">
                      <Flower className="w-12 h-12 text-white fill-white" />
                    </div>
                  </div>
                  {/* Left Petal */}
                  <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 animate-flower-burst" style={{ animationDelay: '0.1s', '--tw-translate-x': '-60px' } as React.CSSProperties}>
                    <Flower className="w-12 h-12 text-editorial-accent fill-editorial-accent/20" />
                  </div>
                  {/* Right Petal */}
                  <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 animate-flower-burst" style={{ animationDelay: '0.15s', '--tw-translate-x': '60px' } as React.CSSProperties}>
                    <Flower className="w-12 h-12 text-editorial-accent fill-editorial-accent/20" />
                  </div>
                </div>
              )}



              {/* PERSISTENT FLOATING BADGE (If banner dismissed) */}
              {currentUser && localStorage.getItem(`banner-dismissed-${currentUser.id}`) && !showQuestionnaire && (
                <div className="fixed bottom-6 right-6 z-40 animate-fade-in-up">
                  <button
                    onClick={() => setShowQuestionnaire(true)}
                    className="group flex items-center gap-3 bg-white pl-4 pr-2 py-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all hover:-translate-y-1"
                  >
                    <div className="flex flex-col items-start mr-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Profile Pending</span>
                      <span className="text-sm font-serif-display text-stone-900 leading-none">Unlock Matches</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                      <Sparkles size={18} className="text-white" />
                    </div>
                  </button>
                </div>
              )}

              {potentialMatches.length > 0 ? (
                <div className={`w-full flex justify-center transition-all ${isAnimating ? 'animate-slide-out' : 'animate-fade-in'}`}>
                  <StoryCard
                    profile={potentialMatches[0]}
                    onLike={() => handleLike(potentialMatches[0])}
                    onPass={() => handlePass(potentialMatches[0].id)}
                  />
                </div>
              ) : (
                <div className="text-center max-w-md p-12 bg-warm-surface border border-editorial rounded-2xl">
                  <div className="w-16 h-16 bg-editorial-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="w-8 h-8 text-warm-subtext" />
                  </div>
                  <h3 className="font-serif-display text-3xl mb-4 text-warm-text">The end of the edition.</h3>
                  <p className="text-warm-subtext mb-8 leading-relaxed font-light">
                    You've reviewed all curated profiles for today.<br />Check back tomorrow for the next issue.
                  </p>
                  <Button variant="secondary" onClick={() => setPotentialMatches(MOCK_PROFILES.filter(p => !matchedProfiles.find(m => m.id === p.id)))}>
                    Review Previous Issues
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}



        {/* CHAT VIEW - RETAINED BUT STYLED */}
        {currentView === AppView.CHAT && (
          <div className="flex-1 flex w-full bg-white gap-6 md:p-8">
            {/* Styling tweak for chat within new container */}
            <div className="w-full h-full flex gap-6">
              {/* Chat List */}
              <div className={`
                w-full md:w-80 h-full border-r border-editorial
                flex flex-col overflow-hidden
                ${activeChatId ? 'hidden md:flex' : 'flex'}
              `}>
                <div className="pb-6 border-b border-editorial px-2">
                  <h2 className="font-serif-display text-2xl text-warm-text">Conversations</h2>
                </div>
                <div className="flex-1 overflow-y-auto pt-4 pr-2">
                  {matchedProfiles.length === 0 ? (
                    <div className="pt-20 text-center text-warm-subtext text-sm">
                      <p>No conversations started.</p>
                    </div>
                  ) : (
                    matchedProfiles.map(match => (
                      <div
                        key={match.id}
                        onClick={() => setActiveChatId(match.id)}
                        className={`p-4 rounded-lg cursor-pointer transition-all flex gap-3 mb-2 hover:bg-warm-bg ${activeChatId === match.id ? 'bg-[#FAF9F6] border-l-2 border-editorial-accent' : ''}`}
                      >
                        <img src={match.imageUrl} className="w-12 h-12 rounded-full object-cover border border-editorial" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className={`font-bold text-base font-serif-display ${activeChatId === match.id ? 'text-editorial-accent' : 'text-warm-text'}`}>{match.name}</h3>
                          </div>
                          <p className="text-xs text-warm-subtext truncate font-medium uppercase tracking-wide">
                            {chatSessions[match.id]?.slice(-1)[0]?.text || 'Start writing...'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className={`
                flex-1 flex flex-col h-full overflow-hidden relative
                ${!activeChatId ? 'hidden md:flex' : 'flex fixed inset-0 md:static z-50 bg-white'}
              `}>
                {activeChatId ? (
                  <>
                    {/* Header */}
                    <div className="h-20 border-b border-editorial flex items-center px-6 justify-between bg-white/95 backdrop-blur-sm sticky top-0 z-20">
                      <div className="flex items-center gap-4">
                        <button onClick={() => setActiveChatId(null)} className="md:hidden text-warm-subtext hover:text-warm-text"><ArrowLeft /></button>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-editorial">
                            <img src={matchedProfiles.find(p => p.id === activeChatId)?.imageUrl} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-serif-display text-xl text-warm-text">{matchedProfiles.find(p => p.id === activeChatId)?.name}</h3>
                            <p className="text-[10px] tracking-widest text-editorial-accent uppercase font-bold">The Soul Edit</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-8 pb-28 md:pb-8 space-y-8 bg-[#FAFAFA]">
                      {/* Insight Banner */}
                      {matchedProfiles.find(p => p.id === activeChatId)?.compatibilityReason && (
                        <div className="bg-editorial-secondary/20 border border-editorial-secondary rounded-lg p-6 text-center mx-auto max-w-lg mb-8">
                          <span className="text-xs font-bold tracking-widest text-editorial-accent uppercase block mb-2">Why you connect</span>
                          <p className="font-serif text-lg text-warm-text italic leading-relaxed">
                            "{matchedProfiles.find(p => p.id === activeChatId)?.compatibilityReason}"
                          </p>
                        </div>
                      )}

                      {chatSessions[activeChatId]?.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.senderId === 'user-me' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] px-8 py-4 text-base leading-relaxed shadow-sm ${msg.senderId === 'user-me'
                            ? 'bg-editorial-accent text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white text-warm-text border border-editorial rounded-2xl rounded-tl-sm'
                            }`}>
                            {/* Render Media if present */}
                            {msg.type === 'image' && msg.mediaUrl && (
                              <div className="mb-3 rounded-lg overflow-hidden">
                                <img src={msg.mediaUrl} alt="Attachment" className="w-full h-auto object-cover max-h-64" />
                              </div>
                            )}
                            {msg.type === 'video' && msg.mediaUrl && (
                              <div className="mb-3 rounded-lg overflow-hidden">
                                <video src={msg.mediaUrl} controls className="w-full h-auto max-h-64 rounded-lg" />
                              </div>
                            )}
                            {msg.text}
                          </div>
                        </div>
                      ))}

                      {/* Typing Indicator */}
                      {typingChatId === activeChatId && (
                        <div className="flex justify-start animate-fade-in">
                          <div className="bg-white text-warm-text border border-editorial rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm flex items-center gap-1">
                            <span className="w-2 h-2 bg-warm-subtext rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                            <span className="w-2 h-2 bg-warm-subtext rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-2 h-2 bg-warm-subtext rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-6 border-t border-editorial bg-white">
                      <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-4 max-w-4xl mx-auto items-center">
                        <button
                          type="button"
                          onClick={handleSendMedia}
                          className="p-3 rounded-full text-warm-subtext hover:bg-gray-100 hover:text-editorial-accent transition-colors"
                          title="Attach Media"
                        >
                          <Paperclip size={20} />
                        </button>
                        <input
                          type="text"
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          className="flex-1 bg-warm-bg border-none rounded-lg px-6 py-4 text-warm-text focus:outline-none focus:ring-1 focus:ring-editorial-accent placeholder:text-warm-subtext font-light"
                          placeholder="Write a message..."
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim()}
                          className="px-8 py-3 rounded-lg bg-warm-text text-white font-medium hover:bg-black transition-colors disabled:opacity-50"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-warm-subtext bg-[#FAFAFA]">
                    <div className="w-20 h-20 border border-editorial rounded-full flex items-center justify-center mb-6">
                      <MessageCircle className="w-8 h-8 text-warm-subtext" />
                    </div>
                    <p className="font-serif-display text-2xl text-warm-text">Select a Story</p>
                    <p className="text-sm mt-3 tracking-wide uppercase">Open a conversation to begin</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE VIEW */}
        {currentView === AppView.PROFILE && currentUser && (
          <ProfileView user={currentUser} onUpdateProfile={handleUpdateProfile} />
        )}

        {/* SETTINGS VIEW */}
        {currentView === AppView.SETTINGS && currentUser && (
          <SettingsView
            user={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
            onAdminAccess={navigateToAdmin}
          />
        )}

      </main>

      {/* QUESTIONNAIRE MODAL - MOVED TO ROOT */}
      {currentUser && (
        <QuestionnaireModal
          userId={currentUser.id}
          isOpen={showQuestionnaire}
          onClose={() => setShowQuestionnaire(false)}
          onComplete={() => {
            setShowQuestionnaire(false);
            // Optionally reload matches with new data
          }}
        />
      )}

    </div>
  );
}