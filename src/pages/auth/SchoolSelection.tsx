import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft01Icon, Location01Icon, UniversityIcon, SentIcon, CheckmarkCircle02Icon } from '@hugeicons/react';
import { Button } from '../../components/ui/Button';

const SCHOOLS = [
  {
    id: 'lcu',
    name: 'Lead City University',
    shortName: 'LCU',
    location: 'Toll Gate / Oba Otudeko, Ibadan',
    logo: '/images/schools/lcu.png', // Fallback handled
    isDefault: true,
  },
  {
    id: 'ui',
    name: 'University of Ibadan',
    shortName: 'UI',
    location: 'UI Road, Ibadan',
    logo: '/images/schools/ui.png',
    isDefault: false,
  },
  {
    id: 'lautech',
    name: 'Ladoke Akintola University',
    shortName: 'LAUTECH',
    location: 'Ogbomoso, Oyo State',
    logo: '/images/schools/lautech.png',
    isDefault: false,
  },
  {
    id: 'polyibadan',
    name: 'Polytechnic Ibadan',
    shortName: 'POLY',
    location: 'Ibadan, Oyo State',
    logo: '/images/schools/poly.png',
    isDefault: false,
  },
  {
    id: 'others',
    name: 'Other Universities',
    shortName: 'OTHERS',
    location: 'Anywhere in Nigeria',
    icon: '🌍',
    isDefault: false,
  },
];

const NIGERIAN_UNIVERSITIES = [
  'Obafemi Awolowo University, Ile-Ife',
  'University of Lagos, Akoka',
  'Ahmadu Bello University, Zaria',
  'University of Nigeria, Nsukka',
  'University of Ilorin, Ilorin',
  'Covenant University, Ota',
  'Babcock University, Ilishan-Remo',
  'Federal University of Technology, Minna',
  'Federal University of Technology, Akure',
  'University of Benin, Benin City',
];

export function SchoolSelection() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [selectedSchool, setSelectedSchool] = useState('lcu');
  const [suggestionText, setSuggestionText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionSent, setSuggestionSent] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsReady(true), 50);
  }, []);

  const filteredUniversities = NIGERIAN_UNIVERSITIES.filter(uni => 
    uni.toLowerCase().includes(suggestionText.toLowerCase())
  ).slice(0, 5);

  const handleSendSuggestion = () => {
    if (!suggestionText.trim()) return;
    setSuggestionSent(true);
    setTimeout(() => {
      setSuggestionSent(false);
      setSuggestionText('');
    }, 3000);
  };

  const handleContinue = () => {
    navigate('/register', { state: { role: 'student', school: selectedSchool } });
  };

  return (
    <div className="min-h-screen bg-[#FFF5E1] flex flex-col font-sans relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF9] to-[#F5E6D3] opacity-50 z-0" />
      
      <div className="flex-1 flex flex-col overflow-y-auto px-4 pb-4 pt-safe-top z-10" ref={scrollRef}>
        
        {/* Header */}
        <motion.div 
          className="pt-2 mb-6"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.05)]"
          >
            <ArrowLeft01Icon size={22} className="text-text-primary" />
          </button>
        </motion.div>

        {/* Title Block */}
        <motion.div 
          className="mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[32px] font-extrabold text-text-primary tracking-[-0.5px] mb-2 leading-10">
            Which school<br />are you near?
          </h1>
          <p className="text-base text-text-secondary leading-[22px]">
            We'll show you apartments in your campus corridor
          </p>
        </motion.div>

        {/* School List */}
        <div className="flex flex-col gap-4 mb-6">
          <AnimatePresence>
            {isReady && SCHOOLS.map((school, index) => {
              const isSelected = selectedSchool === school.id;
              return (
                <motion.div
                  key={school.id}
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    delay: index * 0.08
                  }}
                >
                  <button
                    onClick={() => setSelectedSchool(school.id)}
                    className={`w-full bg-white rounded-3xl border-2 px-4 py-5 flex flex-row items-center gap-4 text-left transition-all duration-300 ${
                      isSelected 
                        ? 'border-transparent shadow-[0_12px_35px_rgba(0,0,0,0.08)] scale-[1.02] -translate-y-1' 
                        : 'border-transparent opacity-65'
                    }`}
                  >
                    <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 overflow-hidden ${isSelected ? 'bg-[#FFF8E1] border border-accent' : 'bg-surface-soft'}`}>
                      {school.logo ? (
                        <img src={school.logo} alt={school.shortName} className="w-full h-full object-contain p-1" onError={(e: any) => { e.target.style.display='none'; e.target.parentNode.innerHTML = '🎓'; }} />
                      ) : (
                        <span className="text-2xl">{school.icon}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-[2px]">
                      <div className="flex flex-row items-center flex-wrap gap-2">
                        <span className={`text-[18px] font-extrabold ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                          {school.name}
                        </span>
                        {school.isDefault && (
                          <div className="bg-[#FFF8E1] border border-accent rounded-full px-2 py-0.5">
                            <span className="text-xs font-bold text-accent">Recommended</span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-text-secondary mt-0.5">{school.shortName}</span>
                      
                      {isSelected && (
                        <div className="flex flex-row items-center gap-1 mt-1">
                          <Location01Icon size={14} className="text-text-tertiary" />
                          <span className="text-xs text-text-tertiary">{school.location}</span>
                        </div>
                      )}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <motion.div 
          className="flex flex-row items-center gap-2 bg-[#FFF8E1] rounded-lg p-4 border border-[#FFE88A] mb-4"
          initial={{ y: 50, opacity: 0 }}
          animate={isReady ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
        >
          <UniversityIcon size={18} className="text-accent shrink-0" />
          <span className="text-sm text-text-secondary flex-1">More schools coming soon — suggest yours!</span>
        </motion.div>

        {/* Suggestion Box */}
        <motion.div 
          className="relative z-20 mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={isReady ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
        >
          {suggestionSent ? (
            <div className="flex flex-row items-center gap-2 bg-[#E8F5E9] p-4 rounded-lg border border-[#A5D6A7]">
              <CheckmarkCircle02Icon size={20} className="text-[#4CAF50] shrink-0" />
              <span className="text-sm font-semibold text-[#2E7D32] leading-5">Your suggestion has been sent to admin. Select 'Others' for now.</span>
            </div>
          ) : (
            <div>
              <div className="flex flex-row gap-2 items-center">
                <input
                  type="text"
                  placeholder="Can't find your school? Type here..."
                  className="flex-1 h-12 bg-white rounded-lg px-4 border border-border-light text-base text-text-primary focus:outline-none focus:border-accent"
                  value={suggestionText}
                  onChange={(e) => {
                    setSuggestionText(e.target.value);
                    setShowSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => {
                    if (suggestionText.length > 0) setShowSuggestions(true);
                    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 150);
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                <button
                  onClick={handleSendSuggestion}
                  disabled={!suggestionText.trim()}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${suggestionText.trim() ? 'bg-accent' : 'bg-[#ccc]'}`}
                >
                  <SentIcon size={18} className="text-white" />
                </button>
              </div>

              {showSuggestions && filteredUniversities.length > 0 && (
                <div className="absolute top-14 left-0 right-[56px] bg-white rounded-lg border border-border-light shadow-md mt-1 overflow-hidden z-30">
                  {filteredUniversities.map((uni, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left px-4 py-3 border-b border-border-light last:border-b-0 text-sm text-text-primary hover:bg-surface-soft"
                      onClick={() => {
                        setSuggestionText(uni);
                        setShowSuggestions(false);
                      }}
                    >
                      {uni}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

      </div>

      {/* Footer */}
      <motion.div 
        className="px-4 pb-8 pt-4 bg-transparent z-10"
        initial={{ y: 50, opacity: 0 }}
        animate={isReady ? { y: 0, opacity: 1 } : {}}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={handleContinue}
          className="w-full bg-primary shadow-sm"
          size="lg"
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
}
