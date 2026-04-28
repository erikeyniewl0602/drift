import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { 
  Sparkles, 
  Send, 
  ChevronRight, 
  X, 
  Heart, 
  ArrowLeft, 
  Waves, 
  MessageCircle,
  Clock,
  ShieldCheck,
  Target,
  LayoutGrid,
  Droplets,
  User,
  Info,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { refineMessage, RefinementMode } from "./lib/gemini.ts";

// --- Types ---
type Screen = 
  | "Intro" 
  | "Onboarding" 
  | "Pool" 
  | "Throw" 
  | "BottleDetail" 
  | "Sealed" 
  | "ReBottle" 
  | "TopicPoolList" 
  | "TopicPoolDetail"
  | "Profile";

interface Bottle {
  id: string;
  topic: string;
  intent: string;
  prompt: string;
  message: string;
  author: string;
  style?: string;
  timestamp: string;
}

interface Preferences {
  need: string;
  followUp: boolean;
  style: string;
  avoid: string[];
  heavyContent: boolean;
}

// --- Constants ---
const TOPICS = [
  { id: "boundary", name: "Boundary Setting", desc: "Saying 'no' with grace and firmness." },
  { id: "friendship", name: "Friendship Distance", desc: "Dealing with drifting or awkward conflict." },
  { id: "rejection", name: "Fear of Rejection", desc: "Processing the sting and moving forward." },
  { id: "pleasing", name: "People Pleasing", desc: "Breaking the cycle of external validation." },
  { id: "hard", name: "Hard to Express", desc: "The heavy things that stay stuck in the throat." }
];

const INITIAL_POOL: Bottle[] = [
  {
    id: "1",
    topic: "Friendship Distance",
    intent: "Perspective",
    prompt: "Something I’m afraid to say is...",
    message: "I feel like my friend is slowly leaving me. I see them hanging out with others and it makes me feel like I was just a placeholder.",
    author: "Moon_99",
    style: "Honest",
    timestamp: "2h ago"
  },
  {
    id: "2",
    topic: "Boundary Setting",
    intent: "Validation",
    prompt: "I feel hurt when...",
    message: "My family assumes I'll always be the one to host holidays. I'm burnt out and want to spend Christmas alone this year.",
    author: "Cedar_5",
    style: "Clearer",
    timestamp: "4h ago"
  },
  {
    id: "3",
    topic: "People Pleasing",
    intent: "Advice",
    prompt: "I wish I could tell my boss...",
    message: "That taking on this extra project won't help the team if I crash and burn in two weeks. I'm terrified to say no.",
    author: "River_82",
    style: "Softer",
    timestamp: "1h ago"
  }
];

// --- Components ---

const ActionButton = ({ 
  children, 
  variant = "primary", 
  onClick, 
  className = "",
  disabled = false,
  icon: Icon
}: { 
  children: React.ReactNode; 
  variant?: "primary" | "secondary" | "ghost"; 
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  icon?: any;
}) => (
  <motion.button
    whileHover={disabled ? {} : { scale: 1.01 }}
    whileTap={disabled ? {} : { scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-4 rounded-full font-medium transition-all flex items-center justify-center gap-2 ${
      variant === "primary" 
        ? "bg-accent text-black active:bg-white" 
        : variant === "secondary"
        ? "bg-transparent border border-white/20 text-white hover:border-white"
        : "bg-transparent text-secondary-text hover:text-white"
    } ${disabled ? "opacity-30 cursor-not-allowed" : ""} ${className}`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </motion.button>
);

const Chip = ({ 
  label, 
  selected, 
  onClick,
  className = ""
}: { 
  label: string; 
  selected: boolean; 
  onClick: () => void;
  className?: string;
  key?: string;
}) => (
  <motion.button
    layout
    onClick={onClick}
    className={`px-5 py-3 rounded-2xl border transition-all text-sm font-medium ${
      selected 
        ? "bg-white border-white text-black" 
        : "bg-card border-white/5 text-white/70 hover:border-white/20"
    } ${className}`}
  >
    {label}
  </motion.button>
);

// --- Screen Components ---

const IntroScreen = ({ navigate }: { navigate: (s: Screen) => void }) => (
  <div id="intro-screen" className="flex flex-col h-screen px-5 pb-10 bg-[#0D0D0D]">
    <div className="flex-1 flex flex-col items-center pt-[12vh]">
      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif text-[64px] font-semibold italic tracking-tight leading-none mb-2 text-white"
      >
        Drift
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-secondary-text text-sm font-light tracking-wide mt-2"
      >
        Care without obligation.
      </motion.p>

      {/* Minimalist Bottle Illustration */}
      <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden">
        <svg width="240" height="300" viewBox="0 0 240 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
          {/* Stars */}
          <circle cx="45" cy="50" r="0.5" fill="white" className="animate-pulse" />
          <circle cx="180" cy="30" r="0.5" fill="white" />
          <circle cx="210" cy="80" r="0.8" fill="white" className="animate-pulse" />
          <circle cx="30" cy="120" r="0.5" fill="white" />
          <circle cx="160" cy="110" r="0.8" fill="white" />
          
          {/* Distant Waves */}
          <path d="M40 180 Q 70 175, 100 180 T 160 180 T 220 180" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
          <path d="M20 195 Q 60 190, 100 195 T 180 195 T 260 195" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
          
          {/* Ripples */}
          <ellipse cx="120" cy="225" rx="45" ry="12" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
          <ellipse cx="120" cy="225" rx="30" ry="8" stroke="white" strokeWidth="0.8" strokeOpacity="0.4" />
          
          {/* Bottle */}
          <motion.g
            animate={{ 
              rotate: [15, 18, 15],
              y: [0, -4, 0]
            }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <path 
              d="M105 210 L140 215 L135 155 Q134 140, 128 138 L126 125 H114 L112 138 Q106 140, 105 155 Z" 
              stroke="white" 
              strokeWidth="1.5" 
              fill="#0D0D0D"
            />
            <path d="M112 125 H128" stroke="white" strokeWidth="1.5" />
            <path d="M113 118 H127 V125 H113 V118Z" stroke="white" strokeWidth="1.5" />
            {/* Highlight */}
            <path d="M118 150 Q 120 180, 120 200" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
          </motion.g>

          {/* Foreground Waves */}
          <path d="M0 240 Q 60 230, 120 240 T 240 240" stroke="white" strokeWidth="0.8" strokeOpacity="0.1" />
        </svg>
      </div>
    </div>

    <div className="space-y-4 px-3">
      <ActionButton onClick={() => navigate("Onboarding")}>
        Throw a Bottle
      </ActionButton>
      <ActionButton variant="secondary" onClick={() => navigate("Pool")}>
        Open the Pool
      </ActionButton>
      <div className="pt-6">
        <p className="text-secondary-text text-[13px] text-center leading-relaxed">
          Share what feels hard to say.<br />
          Respond only when you feel able to hold it.
        </p>
      </div>
    </div>
  </div>
);

const OnboardingScreen = ({ 
  prefs, 
  setPrefs, 
  navigate 
}: { 
  prefs: Preferences; 
  setPrefs: (p: Preferences) => void; 
  navigate: (s: Screen) => void;
}) => {
  const [step, setStep] = useState(1);
  
  return (
    <div className="flex flex-col h-full px-6 pt-16 pb-10 overflow-y-auto">
      <div className="flex justify-between items-center mb-10 shrink-0">
        <div className="flex gap-1">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1 w-8 rounded-full ${step >= i ? "bg-accent" : "bg-white/10"}`} />
          ))}
        </div>
        <button onClick={() => navigate("Intro")} className="text-secondary-text text-sm hover:text-white">Exit</button>
      </div>

      <div className="flex-1">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <h2 className="font-serif text-3xl text-white">What do you need most right now?</h2>
            <div className="flex flex-wrap gap-3">
              {["Emotional understanding", "Advice", "Sort out my thoughts", "Light distraction"].map(item => (
                <Chip 
                  key={item} 
                  label={item} 
                  selected={prefs.need === item} 
                  onClick={() => setPrefs({...prefs, need: item})} 
                />
              ))}
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-secondary-text text-sm mb-4">Allow follow-up questions?</p>
              <div className="flex gap-3">
                <Chip label="Yes" selected={prefs.followUp} onClick={() => setPrefs({...prefs, followUp: true})} />
                <Chip label="No" selected={!prefs.followUp} onClick={() => setPrefs({...prefs, followUp: false})} />
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <h2 className="font-serif text-3xl text-white">Your communication style</h2>
            <div>
              <p className="text-secondary-text text-sm mb-4">How do you express yourself?</p>
              <div className="flex gap-3">
                <Chip label="More direct" selected={prefs.style === "direct"} onClick={() => setPrefs({...prefs, style: "direct"})} />
                <Chip label="More gentle" selected={prefs.style === "gentle"} onClick={() => setPrefs({...prefs, style: "gentle"})} />
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-secondary-text text-sm mb-4">What kind of replies do you dislike?</p>
              <div className="flex flex-wrap gap-3">
                {["Lecturing", "Dismissing", "Moral judgment"].map(item => (
                  <Chip 
                    key={item} 
                    label={item} 
                    selected={prefs.avoid.includes(item)} 
                    onClick={() => {
                      const newAvoid = prefs.avoid.includes(item) 
                        ? prefs.avoid.filter(a => a !== item)
                        : [...prefs.avoid, item];
                      setPrefs({...prefs, avoid: newAvoid});
                    }} 
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 text-center pt-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-accent" />
            </div>
            <h2 className="font-serif text-3xl text-white">Safety & Depth</h2>
            <p className="text-secondary-text leading-relaxed">This platform is for peer support, not professional care. Please avoid sharing identifying details.</p>
            <div className="bg-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <span className="text-sm text-white">Allow heavy emotional content?</span>
              <button 
                onClick={() => setPrefs({...prefs, heavyContent: !prefs.heavyContent})}
                className={`w-12 h-6 rounded-full transition-colors ${prefs.heavyContent ? "bg-accent" : "bg-white/10"} relative`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${prefs.heavyContent ? "left-7" : "left-1"}`} />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-8 flex gap-4 shrink-0">
        {step > 1 && (
          <button 
            onClick={() => setStep(step - 1)}
            className="p-4 rounded-full border border-white/10 text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <ActionButton 
          disabled={(step === 1 && !prefs.need) || (step === 2 && !prefs.style)}
          onClick={() => {
            if (step < 3) setStep(step + 1);
            else navigate("Pool");
          }}
        >
          {step === 3 ? "Enter the Pool" : "Continue"}
        </ActionButton>
      </div>
    </div>
  );
};

const ThrowScreen = ({ 
  navigate, 
  promptValue, 
  setPromptValue, 
  selectedTopic, 
  setSelectedTopic,
  selectedIntent,
  setSelectedIntent,
  shapingMode,
  setShapingMode,
  isShaping,
  setIsShaping,
  refinedValue,
  setRefinedValue
}: { 
  navigate: (s: Screen) => void;
  promptValue: string;
  setPromptValue: (s: string) => void;
  selectedTopic: string;
  setSelectedTopic: (s: string) => void;
  selectedIntent: string;
  setSelectedIntent: (s: string) => void;
  shapingMode: RefinementMode;
  setShapingMode: (m: RefinementMode) => void;
  isShaping: boolean;
  setIsShaping: (b: boolean) => void;
  refinedValue: string;
  setRefinedValue: (s: string) => void;
}) => {
  const handleShape = async () => {
    setIsShaping(true);
    const refined = await refineMessage(promptValue, shapingMode);
    setRefinedValue(refined);
  };

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] text-white px-6 pt-16 pb-10 overflow-y-auto">
      <div className="flex items-center justify-between mb-8 shrink-0">
         <h2 className="font-serif text-2xl">Throw a bottle</h2>
         <button onClick={() => navigate("Pool")} className="text-secondary-text"><X /></button>
      </div>

      <div className="flex-1 space-y-8">
        <div>
          <p className="text-secondary-text text-sm mb-4">What are you holding back from saying?</p>
          <textarea
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            placeholder="Write a short thought, question, or dilemma..."
            className="w-full bg-card rounded-3xl p-6 h-40 text-lg border border-white/5 focus:border-accent/40 focus:outline-none resize-none transition-all text-white"
          />
        </div>

        <div className="space-y-4">
           <p className="text-secondary-text text-[10px] uppercase font-bold tracking-widest">Topic</p>
           <div className="flex flex-wrap gap-2">
             {TOPICS.map(t => (
               <Chip key={t.id} label={t.name} selected={selectedTopic === t.name} onClick={() => setSelectedTopic(t.name)} className="!rounded-full !px-4 !py-2 !text-xs" />
             ))}
           </div>
        </div>

        <div className="space-y-4">
           <p className="text-secondary-text text-[10px] uppercase font-bold tracking-widest">I want replies that are</p>
           <div className="flex flex-wrap gap-2">
             {["Comforting", "Helpful", "Honest", "Reflective"].map(item => (
               <Chip key={item} label={item} selected={selectedIntent === item} onClick={() => setSelectedIntent(item)} className="!rounded-full !px-4 !py-2 !text-xs" />
             ))}
           </div>
        </div>
      </div>

      <div className="mt-8 space-y-4 shrink-0">
         <button 
           onClick={handleShape}
           disabled={!promptValue}
           className="w-full py-4 rounded-full border border-accent/20 flex items-center justify-center gap-2 text-accent text-sm font-medium disabled:opacity-20"
         >
           <Sparkles className="w-4 h-4" />
           AI: Help me phrase this
         </button>
         <ActionButton 
           disabled={!promptValue || !selectedTopic || !selectedIntent}
           onClick={() => navigate("Sealed")}
          >
           Release bottle
         </ActionButton>
      </div>

      <AnimatePresence>
        {isShaping && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 bg-background z-50 p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8 shrink-0">
              <span className="text-sm font-medium text-secondary-text">AI Word Shaping</span>
              <button onClick={() => setIsShaping(false)} className="p-2 text-white"><X /></button>
            </div>
            
            <div className="flex-1 space-y-6 overflow-y-auto">
              <div className="bg-white/5 rounded-2xl p-4">
                <p className="text-xs text-secondary-text uppercase mb-2">Original</p>
                <p className="text-sm text-white/50">{promptValue}</p>
              </div>

              <div className="flex bg-card p-1 rounded-full border border-white/5 overflow-x-auto shrink-0">
                 {(["Softer", "Clearer", "Honest", "Boundary"] as RefinementMode[]).map(mode => (
                   <button
                     key={mode}
                     onClick={() => setShapingMode(mode)}
                     className={`flex-1 min-w-[80px] py-2 rounded-full text-xs font-medium transition-all ${shapingMode === mode ? "bg-white text-black" : "text-white/40"}`}
                   >
                     {mode}
                   </button>
                 ))}
              </div>

              <div className="flex-1 min-h-[200px] bg-card rounded-[32px] p-8 border border-accent/10 flex flex-col items-center justify-center text-center">
                 <p className="text-xl font-serif leading-relaxed italic text-white">
                   {refinedValue || "Casting ripples over your words..."}
                 </p>
              </div>
            </div>

            <div className="mt-8 space-y-3 shrink-0">
               <ActionButton disabled={!refinedValue} onClick={() => { setPromptValue(refinedValue); setIsShaping(false); }}>Use this version</ActionButton>
               <button onClick={handleShape} className="w-full text-secondary-text text-sm">Regenerate</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GlobalNav = ({ screen, navigate }: { screen: Screen; navigate: (s: Screen) => void }) => (
  <div className="px-6 py-6 border-t border-white/5 flex justify-between bg-card/30 backdrop-blur-lg shrink-0">
     <button onClick={() => navigate("Pool")} className={`flex flex-col items-center gap-1 ${screen === "Pool" ? "text-accent" : "text-secondary-text hover:text-white"}`}>
       <Droplets className="w-6 h-6" />
       <span className="text-[10px] font-bold uppercase">Pool</span>
     </button>
     <button onClick={() => navigate("Throw")} className={`flex flex-col items-center gap-1 ${screen === "Throw" ? "text-accent" : "text-secondary-text hover:text-white"}`}>
       <Send className="w-6 h-6" />
       <span className="text-[10px] font-bold uppercase">Throw</span>
     </button>
     <button onClick={() => navigate("TopicPoolList")} className={`flex flex-col items-center gap-1 ${screen === "TopicPoolList" || screen === "TopicPoolDetail" ? "text-accent" : "text-secondary-text hover:text-white"}`}>
       <LayoutGrid className="w-6 h-6" />
       <span className="text-[10px] font-bold uppercase">Topics</span>
     </button>
     <button onClick={() => navigate("Profile")} className={`flex flex-col items-center gap-1 ${screen === "Profile" ? "text-accent" : "text-secondary-text hover:text-white"}`}>
       <User className="w-6 h-6" />
       <span className="text-[10px] font-bold uppercase">Profile</span>
     </button>
  </div>
);

const PoolScreen = ({ 
  pool, 
  setCurrentBottle, 
  navigate,
  screen
}: { 
  pool: Bottle[]; 
  setCurrentBottle: (b: Bottle | null) => void; 
  navigate: (s: Screen) => void;
  screen: Screen;
}) => {
  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] overflow-hidden">
      <div className="px-6 pt-16 pb-6 border-b border-white/5 bg-background/50 backdrop-blur-xl z-20">
        <h2 className="font-serif text-2xl mb-1 text-white">Choose one bottle</h2>
        <p className="text-secondary-text text-sm">Matched to your preferences today</p>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
         {/* Pool Background Water Visual */}
         <motion.div 
           animate={{ x: [-10, 10, -10], y: [-5, 5, -5] }}
           transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
           className="absolute inset-0 z-0 opacity-20"
         >
            <svg width="100%" height="100%" viewBox="0 0 400 600">
              <path d="M0 100 Q 100 80 200 100 T 400 100 V 600 H 0 Z" fill="url(#blue_grad)" />
              <defs>
                <linearGradient id="blue_grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2c3e50" />
                  <stop offset="100%" stopColor="#0D0D0D" />
                </linearGradient>
              </defs>
            </svg>
         </motion.div>

         <div className="w-full space-y-4 z-10 overflow-y-auto max-h-full pb-10 scrollbar-hide">
            {pool.map((bottle, idx) => (
              <motion.button
                key={bottle.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCurrentBottle(bottle);
                  navigate("BottleDetail");
                }}
                className="w-full bg-card/80 backdrop-blur-sm border border-white/5 p-6 rounded-[28px] text-left hover:border-white/20 transition-all shadow-xl group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] uppercase font-bold tracking-widest text-accent">{bottle.topic}</span>
                  <span className="text-[10px] text-white/20 uppercase font-bold">{bottle.timestamp}</span>
                </div>
                <p className="text-lg leading-snug mb-4 line-clamp-2 text-white">"{bottle.message}"</p>
                <div className="flex items-center gap-4 text-xs text-secondary-text">
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {bottle.intent}</span>
                  <span className="flex items-center gap-1"><Info className="w-3 h-3" /> {bottle.style} tone</span>
                </div>
              </motion.button>
            ))}
         </div>
      </div>

      <GlobalNav screen={screen} navigate={navigate} />
    </div>
  );
};

const BottleDetailScreen = ({
  currentBottle,
  replyMessage,
  setReplyMessage,
  navigate
}: {
  currentBottle: Bottle | null;
  replyMessage: string;
  setReplyMessage: (s: string) => void;
  navigate: (s: Screen) => void;
}) => {
  const handleAIHelp = async (mode: RefinementMode) => {
     const refined = await refineMessage(replyMessage || "I hear you. Thank you for sharing.", mode);
     setReplyMessage(refined);
  };

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] px-6 pt-16 pb-10 overflow-y-auto">
      <div className="flex items-center justify-between mb-8 shrink-0">
         <button onClick={() => navigate("Pool")} className="text-white"><ArrowLeft /></button>
         <div className="flex gap-4">
            <button className="text-secondary-text p-2 hover:text-red-400 transition-colors"><AlertCircle className="w-5 h-5" /></button>
         </div>
      </div>

      <div className="flex-1 space-y-8">
         <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 relative overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} className="absolute -right-4 -top-4"><Droplets className="w-24 h-24" /></motion.div>
            <div className="mb-6 flex flex-wrap gap-2">
               <span className="px-2 py-1 rounded-md bg-accent/10 text-[9px] font-bold text-accent uppercase tracking-wider">{currentBottle?.topic}</span>
               <span className="px-2 py-1 rounded-md bg-white/5 text-[9px] font-bold text-white/40 uppercase tracking-wider">Seeking {currentBottle?.intent}</span>
            </div>
            <p className="text-2xl font-serif leading-relaxed italic text-white">
              "{currentBottle?.message}"
            </p>
         </div>

         <div className="space-y-4">
            <p className="text-secondary-text text-xs font-bold uppercase tracking-widest pl-2">Send a short response</p>
            <div className="relative">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Write a short reply of care..."
                className="w-full bg-card rounded-[28px] p-6 h-48 text-lg border border-white/5 focus:border-accent/40 focus:outline-none resize-none transition-all text-white"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                 <button 
                   onClick={() => handleAIHelp("Softer")}
                   className="bg-accent/10 border border-accent/20 p-2 rounded-full text-accent hover:bg-accent/20 transition-colors"
                   title="AI Empathy"
                  >
                    <Sparkles className="w-4 h-4" />
                 </button>
              </div>
            </div>
         </div>
      </div>

      <div className="mt-8 shrink-0">
        <ActionButton 
          disabled={!replyMessage.trim()}
          onClick={() => navigate("Sealed")}
        >
          Seal and send
        </ActionButton>
        <p className="text-center text-[10px] text-secondary-text mt-4">
          A single reply is often enough to hold someone.
        </p>
      </div>
    </div>
  );
};

const SealedScreen = ({
  setReplyMessage,
  navigate
}: {
  setReplyMessage: (s: string) => void;
  navigate: (s: Screen) => void;
}) => (
  <div className="flex flex-col h-full items-center justify-center px-8 bg-[#0D0D0D] text-center overflow-y-auto">
     <motion.div
       initial={{ scale: 0.5, opacity: 0 }}
       animate={{ scale: 1, opacity: 1 }}
       transition={{ type: "spring", duration: 1 }}
       className="mb-8 w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center shrink-0"
     >
       <ShieldCheck className="w-10 h-10 text-accent" />
     </motion.div>

     <h2 className="font-serif text-3xl mb-4 text-white">Exchange sealed</h2>
     <p className="text-secondary-text mb-12 leading-relaxed">
       Your reply has been sent. This interaction ends here by default, so you do not need to keep up a conversation.
     </p>

     <div className="w-full space-y-4 max-w-xs">
        <ActionButton onClick={() => { setReplyMessage(""); navigate("Pool"); }}>
          Back to pool
        </ActionButton>
        <ActionButton variant="secondary" icon={RefreshCw} onClick={() => navigate("ReBottle")}>
          Re-bottle once
        </ActionButton>
        <ActionButton variant="ghost" onClick={() => navigate("TopicPoolList")}>
          Explore topic pools
        </ActionButton>
     </div>

     <p className="text-[10px] text-white/20 mt-10 px-6 shrink-0">
       Drift supports short encounters, not ongoing chat.
     </p>
  </div>
);

const ReBottleScreen = ({
  replyMessage,
  setReplyMessage,
  navigate
}: {
  replyMessage: string;
  setReplyMessage: (s: string) => void;
  navigate: (s: Screen) => void;
}) => (
  <div className="flex flex-col h-full bg-[#0D0D0D] px-6 pt-16 pb-10 overflow-y-auto">
     <div className="flex items-center justify-between mb-8 shrink-0">
         <h2 className="font-serif text-2xl text-white">One final ripple</h2>
         <button onClick={() => navigate("Sealed")} className="text-white"><X /></button>
     </div>

     <div className="flex-1 space-y-8">
        <div className="bg-card p-6 rounded-2xl border border-white/5 flex items-start gap-4">
           <Clock className="w-5 h-5 text-accent shrink-0 mt-1" />
           <div>
              <p className="font-medium text-sm text-white">One re-bottle remaining</p>
              <p className="text-xs text-secondary-text mt-1">You choose to continue this for one more exchange. This closes permanently after this message.</p>
           </div>
        </div>

        <textarea
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          placeholder="Add your final thought or question..."
          className="w-full bg-card rounded-[28px] p-6 h-48 text-lg border border-white/5 focus:border-accent/40 focus:outline-none resize-none transition-all text-white"
        />
     </div>

     <div className="mt-8 shrink-0">
        <ActionButton disabled={!replyMessage.trim()} onClick={() => navigate("Sealed")}>
          Send final bottle
        </ActionButton>
     </div>
  </div>
);

const TopicPoolListScreen = ({
  setSelectedTopicPool,
  navigate
}: {
  setSelectedTopicPool: (t: typeof TOPICS[0]) => void;
  navigate: (s: Screen) => void;
}) => (
  <div className="flex flex-col h-full bg-[#0D0D0D] px-6 pt-16 pb-10 overflow-y-auto">
     <div className="mb-10 text-white">
        <h2 className="font-serif text-3xl mb-1">Global Streams</h2>
        <p className="text-secondary-text text-sm">Collective prompts for shared growth</p>
     </div>

     <div className="grid grid-cols-1 gap-4">
        {TOPICS.map(topic => (
          <motion.button
            key={topic.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedTopicPool(topic);
              navigate("TopicPoolDetail");
            }}
            className="bg-card border border-white/5 p-6 rounded-[28px] text-left hover:border-white/20 transition-all flex flex-col gap-3 group"
          >
            <div className="flex justify-between items-center text-white">
               <h3 className="font-serif text-xl group-hover:text-accent transition-colors">{topic.name}</h3>
               <ChevronRight className="w-4 h-4 text-white/20" />
            </div>
            <p className="text-xs text-secondary-text leading-relaxed">{topic.desc}</p>
            <div className="mt-2 flex items-center gap-2 text-[9px] text-accent/50 uppercase font-bold tracking-widest">
               <Target className="w-3 h-3" />
               <span>Prompt live for 24h</span>
            </div>
          </motion.button>
        ))}
     </div>

     <div className="mt-auto py-6 shrink-0">
        <button onClick={() => navigate("Pool")} className="text-secondary-text text-sm flex items-center gap-2 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Pool
        </button>
     </div>
  </div>
);

const TopicPoolDetailScreen = ({
  selectedTopicPool,
  navigate
}: {
  selectedTopicPool: typeof TOPICS[0] | null;
  navigate: (s: Screen) => void;
}) => {
  const mockFeed = [
    "I starting saying no to Sunday dinners and it saved my weekends.",
    "The hardest part was the guilt, but it gets easier after the first time.",
    "You aren't responsible for their disappointment."
  ];

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] px-6 pt-16 pb-10 overflow-y-auto">
       <div className="flex items-center justify-between mb-10 text-white shrink-0">
          <button onClick={() => navigate("TopicPoolList")}><ArrowLeft /></button>
          <h2 className="font-serif text-xl">{selectedTopicPool?.name}</h2>
          <div className="w-5" />
       </div>

       <div className="bg-accent/5 border border-accent/20 rounded-[32px] p-8 mb-8 text-center shrink-0">
          <p className="text-[10px] text-accent uppercase font-bold tracking-widest mb-3">Today's Prompt</p>
          <p className="text-xl font-serif text-white">What is one thing you wish you could say more clearly?</p>
       </div>

       <div className="flex-1 space-y-4 pr-2 scrollbar-hide text-white">
          <p className="text-secondary-text text-[10px] uppercase font-bold tracking-widest pl-2">Collective Echoes</p>
          {mockFeed.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card p-4 rounded-2xl border border-white/5 text-sm leading-relaxed"
            >
              "{msg}"
            </motion.div>
          ))}
       </div>

       <div className="mt-6 pt-6 border-t border-white/5 text-white shrink-0">
          <div className="bg-card rounded-full p-2 flex items-center gap-3">
            <input 
              placeholder="Add your response..."
              className="bg-transparent flex-1 pl-4 h-12 focus:outline-none text-white/80 placeholder:text-white/20"
            />
            <button className="bg-accent p-3 rounded-full text-black active:scale-95 transition-transform"><Send className="w-4 h-4" /></button>
          </div>
       </div>
    </div>
  );
};

const ProfileScreen = ({
  userName,
  setUserName,
  userAvatar,
  setUserAvatar,
  prefs,
  navigate,
  screen
}: {
  userName: string;
  setUserName: (s: string) => void;
  userAvatar: string;
  setUserAvatar: (s: string) => void;
  prefs: Preferences;
  navigate: (s: Screen) => void;
  screen: Screen;
}) => {
  const avatars = ["🌊", "🌙", "🐚", "🕯️", "☁️", "🌱"];
  const names = ["Quiet_Moon_42", "River_82", "Amber_11", "Drift_Echo", "Safe_Haven", "Soft_Sand"];

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] overflow-hidden">
      <div className="px-6 pt-16 pb-6 border-b border-white/5 bg-background/50 backdrop-blur-xl z-20 shrink-0">
        <h2 className="font-serif text-2xl mb-1 text-white">Your Drift Identity</h2>
        <p className="text-secondary-text text-sm">Anonymous by design, personal by choice.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-hide">
        {/* Identity Card */}
        <div className="bg-card rounded-[32px] p-8 border border-white/5 shadow-xl space-y-6">
          <div className="flex justify-between items-center text-white">
            <span className="text-[10px] uppercase font-bold tracking-widest text-accent">Matched Identity</span>
            <RefreshCw className="w-4 h-4 text-white/20 cursor-pointer" onClick={() => setUserName(names[Math.floor(Math.random() * names.length)])} />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-4xl shadow-inner border border-white/10 text-white">
              {userAvatar}
            </div>
            <div className="space-y-1">
              <span className="text-white text-2xl font-serif italic">{userName}</span>
              <p className="text-secondary-text text-xs italic">"Floats through the pool quietly"</p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-2">
            {avatars.map(a => (
              <button 
                key={a}
                onClick={() => setUserAvatar(a)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border transition-all ${userAvatar === a ? "bg-white/10 border-accent" : "bg-white/5 border-transparent"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt 1: Need */}
        <div className="bg-card rounded-[32px] p-8 border border-white/5 shadow-xl space-y-4">
           <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 italic">My Current Need</span>
           <h3 className="font-serif text-xl text-white">I am here today for...</h3>
           <p className="text-accent text-lg font-medium leading-relaxed">
             {prefs.need || "Not selected yet"}
           </p>
           <button onClick={() => navigate("Onboarding")} className="text-secondary-text text-[10px] uppercase tracking-tighter hover:text-white transition-colors underline underline-offset-4">Update Preference</button>
        </div>

        {/* Prompt 2: Communication Style */}
        <div className="bg-card rounded-[32px] p-8 border border-white/5 shadow-xl space-y-4">
           <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 italic">Response Style</span>
           <h3 className="font-serif text-xl text-white">I appreciate replies that feel...</h3>
           <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium uppercase tracking-wide">
                {prefs.style === "gentle" ? "Gentle & Compassionate" : "Direct & Honest"}
              </span>
           </div>
        </div>

        {/* Prompt 3: Boundaries */}
        <div className="bg-card rounded-[32px] p-8 border border-white/5 shadow-xl space-y-4">
           <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 italic">Safe Boundaries</span>
           <h3 className="font-serif text-xl text-white">I prefer to avoid discussing...</h3>
           <div className="flex flex-wrap gap-2">
              {prefs.avoid.map(a => (
                <span key={a} className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">
                  {a}
                </span>
              ))}
              {prefs.avoid.length === 0 && <span className="text-secondary-text italic text-sm">No topics excluded yet</span>}
           </div>
        </div>

        {/* Stats Card */}
        <div className="bg-card rounded-[32px] p-8 border border-white/5 shadow-xl flex justify-between items-center">
           <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Drift History</p>
              <div className="flex items-center gap-2">
                 <Droplets className="w-4 h-4 text-accent" />
                 <span className="text-white font-serif text-xl">12 Bottles</span>
              </div>
           </div>
           <div className="text-right space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Care Given</p>
              <div className="flex items-center gap-2 justify-end">
                 <Heart className="w-4 h-4 text-red-400" />
                 <span className="text-white font-serif text-xl">4 Replies</span>
              </div>
           </div>
        </div>

        <div className="pb-10 pt-4">
          <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.2em]">End of identity card</p>
        </div>
      </div>

      <GlobalNav screen={screen} navigate={navigate} />
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("Intro");
  const [userName, setUserName] = useState("Quiet_Moon_42");
  const [userAvatar, setUserAvatar] = useState("🌊");
  const [prefs, setPrefs] = useState<Preferences>({
    need: "",
    followUp: false,
    style: "",
    avoid: [],
    heavyContent: false
  });
  
  // Writing State
  const [promptValue, setPromptValue] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedIntent, setSelectedIntent] = useState("");
  const [isShaping, setIsShaping] = useState(false);
  const [shapingMode, setShapingMode] = useState<RefinementMode>("Softer");
  const [refinedValue, setRefinedValue] = useState("");

  // Pool State
  const [pool, setPool] = useState<Bottle[]>(INITIAL_POOL);
  const [currentBottle, setCurrentBottle] = useState<Bottle | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Topic State
  const [selectedTopicPool, setSelectedTopicPool] = useState<typeof TOPICS[0] | null>(null);

  const navigate = (next: Screen) => setScreen(next);

  // --- Screens (Moved outside) ---

  // 3. Main Pool Screen
  const PoolScreen = () => {
    return (
      <div className="flex flex-col h-full bg-[#0D0D0D] overflow-hidden">
        <div className="px-6 pt-16 pb-6 border-b border-white/5 bg-background/50 backdrop-blur-xl z-20">
          <h2 className="font-serif text-2xl mb-1 text-white">Choose one bottle</h2>
          <p className="text-secondary-text text-sm">Matched to your preferences today</p>
        </div>

        <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
           {/* Pool Background Water Visual */}
           <motion.div 
             animate={{ x: [-10, 10, -10], y: [-5, 5, -5] }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 z-0 opacity-20"
           >
              <svg width="100%" height="100%" viewBox="0 0 400 600">
                <path d="M0 100 Q 100 80 200 100 T 400 100 V 600 H 0 Z" fill="url(#blue_grad)" />
                <defs>
                  <linearGradient id="blue_grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2c3e50" />
                    <stop offset="100%" stopColor="#0D0D0D" />
                  </linearGradient>
                </defs>
              </svg>
           </motion.div>

           <div className="w-full space-y-4 z-10 overflow-y-auto max-h-full pb-10 scrollbar-hide">
              {pool.map((bottle, idx) => (
                <motion.button
                  key={bottle.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCurrentBottle(bottle);
                    navigate("BottleDetail");
                  }}
                  className="w-full bg-card/80 backdrop-blur-sm border border-white/5 p-6 rounded-[28px] text-left hover:border-white/20 transition-all shadow-xl group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] uppercase font-bold tracking-widest text-accent">{bottle.topic}</span>
                    <span className="text-[10px] text-white/20 uppercase font-bold">{bottle.timestamp}</span>
                  </div>
                  <p className="text-lg leading-snug mb-4 line-clamp-2 text-white">"{bottle.message}"</p>
                  <div className="flex items-center gap-4 text-xs text-secondary-text">
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {bottle.intent}</span>
                    <span className="flex items-center gap-1"><Info className="w-3 h-3" /> {bottle.style} tone</span>
                  </div>
                </motion.button>
              ))}
           </div>
        </div>

        {/* Global Nav */}
        <div className="px-6 py-6 border-t border-white/5 flex justify-between bg-card/30 backdrop-blur-lg shrink-0">
           <button onClick={() => navigate("Pool")} className={`flex flex-col items-center gap-1 ${screen === "Pool" ? "text-accent" : "text-secondary-text hover:text-white"}`}>
             <Droplets className="w-6 h-6" />
             <span className="text-[10px] font-bold uppercase">Pool</span>
           </button>
           <button onClick={() => navigate("Throw")} className={`flex flex-col items-center gap-1 ${screen === "Throw" ? "text-accent" : "text-secondary-text hover:text-white"}`}>
             <Send className="w-6 h-6" />
             <span className="text-[10px] font-bold uppercase">Throw</span>
           </button>
           <button onClick={() => navigate("TopicPoolList")} className={`flex flex-col items-center gap-1 ${screen === "TopicPoolList" || screen === "TopicPoolDetail" ? "text-accent" : "text-secondary-text hover:text-white"}`}>
             <LayoutGrid className="w-6 h-6" />
             <span className="text-[10px] font-bold uppercase">Topics</span>
           </button>
           <button onClick={() => navigate("Profile")} className={`flex flex-col items-center gap-1 ${screen === "Profile" ? "text-accent" : "text-secondary-text hover:text-white"}`}>
             <User className="w-6 h-6" />
             <span className="text-[10px] font-bold uppercase">Profile</span>
           </button>
        </div>
      </div>
    );
  };

  // 4. Throw Screen
  const ThrowScreen = () => {
    const handleShape = async () => {
      setIsShaping(true);
      const refined = await refineMessage(promptValue, shapingMode);
      setRefinedValue(refined);
    };

    return (
      <div className="flex flex-col h-full bg-[#0D0D0D] text-white px-6 pt-16 pb-10 overflow-y-auto">
        <div className="flex items-center justify-between mb-8 shrink-0">
           <h2 className="font-serif text-2xl">Throw a bottle</h2>
           <button onClick={() => navigate("Pool")} className="text-secondary-text"><X /></button>
        </div>

        <div className="flex-1 space-y-8">
          <div>
            <p className="text-secondary-text text-sm mb-4">What are you holding back from saying?</p>
            <textarea
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              placeholder="Write a short thought, question, or dilemma..."
              className="w-full bg-card rounded-3xl p-6 h-40 text-lg border border-white/5 focus:border-accent/40 focus:outline-none resize-none transition-all text-white"
            />
          </div>

          <div className="space-y-4">
             <p className="text-secondary-text text-[10px] uppercase font-bold tracking-widest">Topic</p>
             <div className="flex flex-wrap gap-2">
               {TOPICS.map(t => (
                 <Chip key={t.id} label={t.name} selected={selectedTopic === t.name} onClick={() => setSelectedTopic(t.name)} className="!rounded-full !px-4 !py-2 !text-xs" />
               ))}
             </div>
          </div>

          <div className="space-y-4">
             <p className="text-secondary-text text-[10px] uppercase font-bold tracking-widest">I want replies that are</p>
             <div className="flex flex-wrap gap-2">
               {["Comforting", "Helpful", "Honest", "Reflective"].map(item => (
                 <Chip key={item} label={item} selected={selectedIntent === item} onClick={() => setSelectedIntent(item)} className="!rounded-full !px-4 !py-2 !text-xs" />
               ))}
             </div>
          </div>
        </div>

        <div className="mt-8 space-y-4 shrink-0">
           <button 
             onClick={handleShape}
             disabled={!promptValue}
             className="w-full py-4 rounded-full border border-accent/20 flex items-center justify-center gap-2 text-accent text-sm font-medium disabled:opacity-20"
           >
             <Sparkles className="w-4 h-4" />
             AI: Help me phrase this
           </button>
           <ActionButton 
             disabled={!promptValue || !selectedTopic || !selectedIntent}
             onClick={() => navigate("Sealed")}
            >
             Release bottle
           </ActionButton>
        </div>

        {/* AI Shaping Overlay (Refactored Modal) */}
        <AnimatePresence>
          {isShaping && (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed inset-0 bg-background z-50 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8 shrink-0">
                <span className="text-sm font-medium text-secondary-text">AI Word Shaping</span>
                <button onClick={() => setIsShaping(false)} className="p-2 text-white"><X /></button>
              </div>
              
              <div className="flex-1 space-y-6 overflow-y-auto">
                <div className="bg-white/5 rounded-2xl p-4">
                  <p className="text-xs text-secondary-text uppercase mb-2">Original</p>
                  <p className="text-sm text-white/50">{promptValue}</p>
                </div>

                <div className="flex bg-card p-1 rounded-full border border-white/5 overflow-x-auto shrink-0">
                   {(["Softer", "Clearer", "Honest", "Boundary"] as RefinementMode[]).map(mode => (
                     <button
                       key={mode}
                       onClick={() => setShapingMode(mode)}
                       className={`flex-1 min-w-[80px] py-2 rounded-full text-xs font-medium transition-all ${shapingMode === mode ? "bg-white text-black" : "text-white/40"}`}
                     >
                       {mode}
                     </button>
                   ))}
                </div>

                <div className="flex-1 min-h-[200px] bg-card rounded-[32px] p-8 border border-accent/10 flex flex-col items-center justify-center text-center">
                   <p className="text-xl font-serif leading-relaxed italic text-white">
                     {refinedValue || "Casting ripples over your words..."}
                   </p>
                </div>
              </div>

              <div className="mt-8 space-y-3 shrink-0">
                 <ActionButton disabled={!refinedValue} onClick={() => { setPromptValue(refinedValue); setIsShaping(false); }}>Use this version</ActionButton>
                 <button onClick={handleShape} className="w-full text-secondary-text text-sm">Regenerate</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // --- Screens (Integrated) ---

  return (
    <main className="max-w-md mx-auto h-screen bg-[#0D0D0D] relative overflow-hidden text-white selection:bg-accent/30 font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="h-full"
        >
          {screen === "Intro" && <IntroScreen navigate={navigate} />}
          {screen === "Onboarding" && <OnboardingScreen prefs={prefs} setPrefs={setPrefs} navigate={navigate} />}
          {screen === "Pool" && <PoolScreen pool={pool} setCurrentBottle={setCurrentBottle} navigate={navigate} screen={screen} />}
          {screen === "Throw" && (
            <ThrowScreen 
              navigate={navigate} 
              promptValue={promptValue} 
              setPromptValue={setPromptValue}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              selectedIntent={selectedIntent}
              setSelectedIntent={setSelectedIntent}
              shapingMode={shapingMode}
              setShapingMode={setShapingMode}
              isShaping={isShaping}
              setIsShaping={setIsShaping}
              refinedValue={refinedValue}
              setRefinedValue={setRefinedValue}
            />
          )}
          {screen === "BottleDetail" && (
            <BottleDetailScreen 
              currentBottle={currentBottle}
              replyMessage={replyMessage}
              setReplyMessage={setReplyMessage}
              navigate={navigate}
            />
          )}
          {screen === "Sealed" && <SealedScreen setReplyMessage={setReplyMessage} navigate={navigate} />}
          {screen === "ReBottle" && <ReBottleScreen replyMessage={replyMessage} setReplyMessage={setReplyMessage} navigate={navigate} />}
          {screen === "TopicPoolList" && <TopicPoolListScreen setSelectedTopicPool={setSelectedTopicPool} navigate={navigate} />}
          {screen === "TopicPoolDetail" && <TopicPoolDetailScreen selectedTopicPool={selectedTopicPool} navigate={navigate} />}
          {screen === "Profile" && (
            <ProfileScreen 
              userName={userName}
              setUserName={setUserName}
              userAvatar={userAvatar}
              setUserAvatar={setUserAvatar}
              prefs={prefs}
              navigate={navigate}
              screen={screen}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
