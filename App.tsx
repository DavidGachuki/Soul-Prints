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
import { analyzeSoulPrint, calculateCompatibility, generateChatResponse } from './services/geminiService';
import { Sparkles, MessageCircle, ArrowLeft, Send, Search, Compass, LogOut, Heart, User, Coffee } from 'lucide-react';

// --- Mock Data ---
const MOCK_PROFILES: MatchProfile[] = [
  {
    id: '1',
    name: 'Elara',
    age: 24,
    bio: 'Looking for someone to share sunsets with.',
    interests: ['Photography', 'Poetry', 'Coffee'],
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2787&auto=format&fit=crop',
    deepAnswer1: 'I stay awake thinking about how big the universe is, and how small our worries are.',
    deepAnswer2: 'A slow morning with jazz records, rain against the window, and a warm mug.',
    soulAnalysis: 'A gentle dreamer who finds beauty in the quiet moments.',
  },
  {
    id: '2',
    name: 'Liam',
    age: 28,
    bio: 'Let’s build something beautiful together.',
    interests: ['Architecture', 'Hiking', 'Cooking'],
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2787&auto=format&fit=crop',
    deepAnswer1: 'Thinking about whether I’m making enough of a positive impact on the world.',
    deepAnswer2: 'Hiking up a mountain to catch the sunrise, then brunch with friends.',
    soulAnalysis: 'A grounded spirit with a heart full of ambition and kindness.',
  },
  {
    id: '3',
    name: 'Maya',
    age: 26,
    bio: 'Art is my love language.',
    interests: ['Painting', 'Galleries', 'Wine'],
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop',
    deepAnswer1: 'The fear of time passing too quickly without capturing enough memories.',
    deepAnswer2: 'Waking up naturally, painting for hours, then a long walk in the park.',
    soulAnalysis: 'A creative soul who treasures deep emotional expression.',
  },
  {
    id: '4',
    name: 'Julian',
    age: 30,
    bio: 'Seeking deep conversations and spontaneous adventures.',
    interests: ['Philosophy', 'Travel', 'Vinyl'],
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2487&auto=format&fit=crop',
    deepAnswer1: 'Wondering if we truly have free will or if our paths are written in the stars.',
    deepAnswer2: 'Getting lost in a foreign city with no map, just following the music.',
    soulAnalysis: 'An intellectual wanderer seeking truth and authentic connection.',
  },
  {
    id: '5',
    name: 'Amara',
    age: 27,
    bio: 'Plant mom & tea enthusiast.',
    interests: ['Gardening', 'Yoga', 'Reading'],
    imageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=2487&auto=format&fit=crop',
    deepAnswer1: 'The hope that I can heal the parts of myself I usually hide.',
    deepAnswer2: 'Yoga at sunrise, tending to my garden, and reading by the window.',
    soulAnalysis: 'A nurturing spirit who values growth, peace, and inner light.',
  },
  {
    id: '6',
    name: 'Kael',
    age: 25,
    bio: 'Music says what words cannot.',
    interests: ['Guitar', 'Concerts', 'Road Trips'],
    imageUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=2487&auto=format&fit=crop',
    deepAnswer1: 'The melody that I can hear in my head but haven\'t been able to play yet.',
    deepAnswer2: 'Driving down the coast with the windows down and the perfect playlist.',
    soulAnalysis: 'A passionate artist attuned to the rhythm of life and emotion.',
  },
  {
    id: '7',
    name: 'Sophie',
    age: 29,
    bio: 'Kindness is the highest form of intelligence.',
    interests: ['Volunteering', 'Baking', 'Dogs'],
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2459&auto=format&fit=crop',
    deepAnswer1: 'Worrying if I told the people I love how much they mean to me.',
    deepAnswer2: 'Baking fresh bread, a long walk with my dog, and a family dinner.',
    soulAnalysis: 'A warm-hearted giver who finds joy in nourishing others.',
  },
  {
    id: '8',
    name: 'Marcus',
    age: 32,
    bio: 'Restoring old things to new life.',
    interests: ['Woodworking', 'History', 'Whiskey'],
    imageUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=2568&auto=format&fit=crop',
    deepAnswer1: 'The legacy I will leave behind when I am gone.',
    deepAnswer2: 'Working in the shop until noon, then a BBQ with close friends.',
    soulAnalysis: 'A steady, reliable soul who values craftsmanship and tradition.',
  },
  {
    id: '9',
    name: 'Elena',
    age: 28,
    bio: 'Stargazer and night owl.',
    interests: ['Astronomy', 'Sci-Fi', 'Camping'],
    imageUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=2727&auto=format&fit=crop',
    deepAnswer1: 'The infinite silence of space and the possibility of life elsewhere.',
    deepAnswer2: 'Camping under a dark sky, identifying constellations, and total silence.',
    soulAnalysis: 'A visionary thinker who finds comfort in the vastness of the unknown.',
  },
  {
    id: '10',
    name: 'Noah',
    age: 26,
    bio: 'Chasing waves and good vibes.',
    interests: ['Surfing', 'Ocean', 'Sustainability'],
    imageUrl: 'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?q=80&w=2787&auto=format&fit=crop',
    deepAnswer1: 'The state of our oceans and what the world will look like in 50 years.',
    deepAnswer2: 'Catching the early swell, a big breakfast, and a nap in a hammock.',
    soulAnalysis: 'A free spirit deeply connected to nature and the flow of energy.',
  }
];

export default function App() {
  // --- State Management ---
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [potentialMatches, setPotentialMatches] = useState<MatchProfile[]>([]);
  const [matchedProfiles, setMatchedProfiles] = useState<MatchProfile[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<Record<string, Message[]>>({});
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [chatInput, setChatInput] = useState('');
  
  // Onboarding Wizard State
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    deepAnswer1: '',
    deepAnswer2: ''
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---
  const handleCreateProfile = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    setLoadingState(LoadingState.LOADING);
    await new Promise(r => setTimeout(r, 2000)); // Simulate thoughtful analysis

    const analysis = await analyzeSoulPrint(formData.name, formData.deepAnswer1, formData.deepAnswer2);
    
    const newUser: UserProfile = {
      id: 'user-me',
      name: formData.name,
      age: parseInt(formData.age),
      bio: 'Ready to connect.',
      interests: ['Life', 'Love'],
      imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2960&auto=format&fit=crop',
      deepAnswer1: formData.deepAnswer1,
      deepAnswer2: formData.deepAnswer2,
      soulAnalysis: analysis
    };

    setCurrentUser(newUser);

    const processedMatches = await Promise.all(MOCK_PROFILES.map(async (p) => {
      const comp = await calculateCompatibility(newUser, p);
      return { ...p, compatibilityScore: comp.score, compatibilityReason: comp.reason };
    }));

    setPotentialMatches(processedMatches);
    setLoadingState(LoadingState.IDLE);
    setCurrentView(AppView.DISCOVERY);
  };

  const handleLike = (profile: MatchProfile) => {
    setMatchedProfiles(prev => [profile, ...prev]);
    setPotentialMatches(prev => prev.filter(p => p.id !== profile.id));
    setChatSessions(prev => ({
      ...prev,
      [profile.id]: [{
        id: 'msg-init',
        senderId: profile.id,
        text: `Hi ${currentUser?.name}! ${profile.compatibilityReason} I'd love to chat.`,
        timestamp: Date.now()
      }]
    }));
  };

  const handlePass = (profileId: string) => {
    setPotentialMatches(prev => prev.filter(p => p.id !== profileId));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'user-me',
      text: chatInput,
      timestamp: Date.now()
    };

    const targetProfile = matchedProfiles.find(p => p.id === activeChatId);
    if (!targetProfile) return;

    setChatSessions(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage]
    }));
    setChatInput('');

    const currentHistory = [...(chatSessions[activeChatId] || []), newMessage];
    const aiResponseText = await generateChatResponse(targetProfile, currentHistory, newMessage.text);
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      senderId: activeChatId,
      text: aiResponseText,
      timestamp: Date.now(),
      isAiGenerated: true
    };

    setChatSessions(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), aiMessage]
    }));
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatSessions, activeChatId]);


  // --- LANDING PAGE ---
  if (currentView === AppView.LANDING) {
    return (
      <div className="min-h-screen bg-warm-bg flex flex-col relative overflow-hidden font-sans">
        {/* Soft Background Blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-secondary/10 rounded-full blur-[80px] pointer-events-none mix-blend-multiply animate-float"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[80px] pointer-events-none mix-blend-multiply animate-float" style={{animationDelay: '2s'}}></div>
        
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

          <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl text-warm-text font-medium leading-tight mb-8 animate-fade-in" style={{animationDelay: '0.1s'}}>
            Connect on a <br/>
            <span className="text-transparent bg-clip-text bg-gradient-love italic">Deeper Level.</span>
          </h1>

          <p className="text-xl text-warm-subtext max-w-2xl leading-relaxed mb-10 animate-fade-in" style={{animationDelay: '0.2s'}}>
            We believe love isn't just about photos. It's about shared values, deep thoughts, and the quiet moments. Let our AI find the soul that echoes yours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <Button variant="primary" size="lg" onClick={() => setCurrentView(AppView.PROFILE_CREATION)}>
              Find Your Match
            </Button>
            <Button variant="secondary" size="lg">
              Our Story
            </Button>
          </div>
          
          <div className="mt-16 flex items-center gap-4 text-sm text-warm-subtext animate-fade-in" style={{animationDelay: '0.4s'}}>
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
      <div className="min-h-screen bg-warm-bg flex items-center justify-center p-6 relative">
        {/* Background Accent */}
        <div className="absolute inset-0 bg-gradient-warm opacity-50"></div>
        
        <div className="w-full max-w-xl relative z-10">
          <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 relative overflow-hidden">
             
             {/* Progress Indicator */}
             <div className="flex gap-2 mb-8">
               <div className={`h-1.5 rounded-full flex-1 transition-colors duration-500 ${onboardingStep >= 1 ? 'bg-brand-primary' : 'bg-gray-100'}`}></div>
               <div className={`h-1.5 rounded-full flex-1 transition-colors duration-500 ${onboardingStep >= 2 ? 'bg-brand-primary' : 'bg-gray-100'}`}></div>
             </div>

             <div className="mb-6 text-center">
               <h2 className="font-serif text-3xl font-bold text-warm-text mb-2">
                 {onboardingStep === 1 ? "Let's introduce you." : "What makes you, you?"}
               </h2>
               <p className="text-warm-subtext">
                 {onboardingStep === 1 ? "We'll start with the basics." : "The answers that reveal your heart."}
               </p>
             </div>

            {onboardingStep === 1 ? (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <label className="block text-sm font-bold text-warm-text ml-1">First Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-lg text-warm-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all placeholder:text-gray-300"
                    placeholder="e.g., Sarah"
                  />
                </div>
                <div className="space-y-1">
                   <label className="block text-sm font-bold text-warm-text ml-1">Age</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-lg text-warm-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all placeholder:text-gray-300"
                    placeholder="25"
                  />
                </div>
                <div className="pt-4">
                   <Button className="w-full" variant="primary" onClick={() => setOnboardingStep(2)} disabled={!formData.name || !formData.age}>
                     Continue
                   </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-brand-secondary">
                    <Coffee className="w-4 h-4" />
                    Deep Question 01
                  </label>
                  <p className="text-lg font-serif text-warm-text">What keeps you up at night?</p>
                  <textarea 
                    value={formData.deepAnswer1}
                    onChange={e => setFormData({...formData, deepAnswer1: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-warm-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all resize-none min-h-[100px]"
                    placeholder="Is it excitement for the future, or perhaps a worry..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-brand-secondary">
                    <Sparkles className="w-4 h-4" />
                    Deep Question 02
                  </label>
                  <p className="text-lg font-serif text-warm-text">Describe your perfect Sunday.</p>
                  <textarea 
                    value={formData.deepAnswer2}
                    onChange={e => setFormData({...formData, deepAnswer2: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-warm-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all resize-none min-h-[100px]"
                    placeholder="Morning coffee, a walk in the park..."
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button variant="secondary" onClick={() => setOnboardingStep(1)}>Back</Button>
                  <Button className="flex-1" variant="primary" onClick={handleCreateProfile} isLoading={loadingState === LoadingState.LOADING} disabled={!formData.deepAnswer1 || !formData.deepAnswer2}>
                    Find My Soul Match
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- APP LAYOUT ---
  const isChatMobile = currentView === AppView.CHAT && activeChatId !== null;

  return (
    <div className="flex h-screen w-full bg-warm-bg text-warm-text font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className={`
        fixed z-50 bottom-0 left-0 right-0 md:static md:w-64 md:h-full 
        bg-white border-t md:border-t-0 md:border-r border-gray-100
        flex md:flex-col items-center md:items-stretch justify-around md:justify-start md:p-6 md:gap-2
        transition-transform duration-300 shadow-sm md:shadow-none
        ${currentView === AppView.LANDING || currentView === AppView.PROFILE_CREATION ? 'hidden' : ''}
        ${isChatMobile ? 'hidden md:flex' : 'flex'}
      `}>
         <div className="hidden md:flex items-center gap-2 px-2 mb-8 mt-2">
           <Heart className="w-6 h-6 fill-brand-primary text-brand-primary" />
           <span className="font-serif font-bold text-xl text-warm-text">Soul Prints</span>
         </div>

         <button 
           onClick={() => { setActiveChatId(null); setCurrentView(AppView.DISCOVERY); }}
           className={`p-3 md:px-4 md:py-3 rounded-2xl transition-all flex items-center gap-3 ${currentView === AppView.DISCOVERY ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-warm-subtext hover:bg-gray-50'}`}
         >
           <Compass className="w-6 h-6" />
           <span className="hidden md:inline">Discover</span>
         </button>
         
         <button 
           onClick={() => setCurrentView(AppView.CHAT)}
           className={`p-3 md:px-4 md:py-3 rounded-2xl transition-all flex items-center gap-3 relative ${currentView === AppView.CHAT ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-warm-subtext hover:bg-gray-50'}`}
         >
           <MessageCircle className="w-6 h-6" />
           <span className="hidden md:inline">Messages</span>
           {matchedProfiles.length > 0 && <span className="absolute top-3 right-3 md:top-auto md:bottom-auto md:right-4 w-2 h-2 bg-brand-primary rounded-full"></span>}
         </button>

         <div className="hidden md:block mt-auto border-t border-gray-100 pt-6">
            <div className="flex items-center gap-3 px-2 mb-4">
              <img src={currentUser?.imageUrl} className="w-10 h-10 rounded-full object-cover" alt="Me" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{currentUser?.name}</p>
                <p className="text-xs text-warm-subtext truncate">Online</p>
              </div>
            </div>
            <button onClick={() => window.location.reload()} className="flex items-center gap-3 px-2 text-sm text-warm-subtext hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative h-full flex overflow-hidden">
        
        {/* DISCOVERY VIEW */}
        {currentView === AppView.DISCOVERY && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-warm -z-10"></div>

             {potentialMatches.length > 0 ? (
               <div className="w-full max-w-md animate-fade-in relative z-10">
                 <ProfileCard 
                   profile={potentialMatches[0]}
                   onLike={() => handleLike(potentialMatches[0])}
                   onPass={() => handlePass(potentialMatches[0].id)}
                 />
               </div>
             ) : (
               <div className="text-center z-10 max-w-md bg-white p-8 rounded-[2rem] shadow-xl">
                 <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-primary">
                    <User className="w-10 h-10" />
                 </div>
                 <h3 className="font-serif font-bold text-3xl mb-3 text-warm-text">All Caught Up</h3>
                 <p className="text-warm-subtext mb-8">
                   You've seen all the potential soul connections in your area for now. Check back soon for new hearts.
                 </p>
                 <Button variant="secondary" onClick={() => setPotentialMatches(MOCK_PROFILES.filter(p => !matchedProfiles.find(m => m.id === p.id)))}>
                   Review Passed Profiles
                 </Button>
               </div>
             )}
          </div>
        )}

        {/* CHAT VIEW */}
        {currentView === AppView.CHAT && (
           <div className="flex-1 flex w-full bg-white md:bg-warm-bg md:p-6 gap-6">
              {/* Chat List (Card style on Desktop) */}
              <div className={`
                w-full md:w-80 bg-white md:rounded-[2rem] md:shadow-sm border-r md:border-none border-gray-100
                flex flex-col overflow-hidden
                ${activeChatId ? 'hidden md:flex' : 'flex'}
              `}>
                <div className="p-6 border-b border-gray-50">
                  <h2 className="font-serif font-bold text-2xl text-warm-text">Connections</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {matchedProfiles.length === 0 ? (
                    <div className="p-8 text-center text-warm-subtext text-sm">
                      <p>No connections yet.</p>
                      <p className="mt-2 text-xs">Go to Discovery to find your match!</p>
                    </div>
                  ) : (
                    matchedProfiles.map(match => (
                      <div 
                        key={match.id}
                        onClick={() => setActiveChatId(match.id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all flex gap-3 hover:bg-gray-50 ${activeChatId === match.id ? 'bg-brand-primary/5' : ''}`}
                      >
                         <img src={match.imageUrl} className="w-12 h-12 rounded-full object-cover" />
                         <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-baseline mb-1">
                             <h3 className={`font-bold text-base ${activeChatId === match.id ? 'text-brand-primary' : 'text-warm-text'}`}>{match.name}</h3>
                             <span className="text-xs text-brand-primary font-bold">{match.compatibilityScore}%</span>
                           </div>
                           <p className="text-sm text-warm-subtext truncate">
                             {chatSessions[match.id]?.slice(-1)[0]?.text || 'Say hello...'}
                           </p>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area (Card style on Desktop) */}
              <div className={`
                flex-1 flex flex-col bg-white md:rounded-[2rem] md:shadow-sm overflow-hidden relative
                ${!activeChatId ? 'hidden md:flex' : 'flex fixed inset-0 md:static z-50'}
              `}>
                {activeChatId ? (
                   <>
                     {/* Header */}
                     <div className="h-20 border-b border-gray-50 flex items-center px-6 justify-between bg-white/90 backdrop-blur-md sticky top-0 z-20">
                        <div className="flex items-center gap-4">
                           <button onClick={() => setActiveChatId(null)} className="md:hidden text-warm-subtext hover:text-warm-text"><ArrowLeft /></button>
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full overflow-hidden">
                               <img src={matchedProfiles.find(p => p.id === activeChatId)?.imageUrl} className="w-full h-full object-cover" />
                             </div>
                             <div>
                               <h3 className="font-serif font-bold text-lg text-warm-text">{matchedProfiles.find(p => p.id === activeChatId)?.name}</h3>
                               <p className="text-xs text-brand-secondary font-medium">Soul Match</p>
                             </div>
                           </div>
                        </div>
                     </div>
                     
                     {/* Messages */}
                     <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                        {/* Insight Banner */}
                        {matchedProfiles.find(p => p.id === activeChatId)?.compatibilityReason && (
                          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center mx-auto max-w-lg">
                            <Heart className="w-4 h-4 fill-orange-200 text-orange-400 mx-auto mb-2" />
                            <p className="text-sm text-warm-subtext italic">
                              "{matchedProfiles.find(p => p.id === activeChatId)?.compatibilityReason}"
                            </p>
                          </div>
                        )}
                        
                        {chatSessions[activeChatId]?.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.senderId === 'user-me' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[75%] px-6 py-3 rounded-2xl text-base leading-relaxed shadow-sm ${
                               msg.senderId === 'user-me' 
                                 ? 'bg-brand-primary text-white rounded-tr-none' 
                                 : 'bg-white text-warm-text border border-gray-100 rounded-tl-none'
                             }`}>
                               {msg.text}
                             </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                     </div>

                     {/* Input */}
                     <div className="p-4 border-t border-gray-50 bg-white">
                       <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
                         <input 
                           type="text" 
                           value={chatInput}
                           onChange={e => setChatInput(e.target.value)}
                           className="flex-1 bg-gray-50 border-none rounded-full px-6 py-4 text-warm-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 placeholder:text-gray-400"
                           placeholder="Type a message..."
                         />
                         <button 
                           type="submit"
                           disabled={!chatInput.trim()}
                           className="w-14 h-14 rounded-full bg-brand-primary text-white flex items-center justify-center hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/30 disabled:opacity-50 disabled:shadow-none"
                         >
                           <Send className="w-6 h-6 ml-0.5" />
                         </button>
                       </form>
                     </div>
                   </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-warm-subtext bg-gray-50/50">
                    <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                      <MessageCircle className="w-10 h-10 text-brand-secondary/50" />
                    </div>
                    <p className="font-serif text-xl text-warm-text">Select a conversation</p>
                    <p className="text-sm mt-2">Pick a person from the list to start chatting.</p>
                  </div>
                )}
              </div>
           </div>
        )}
      </main>
    </div>
  );
}