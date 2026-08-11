import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { Button } from '../../components/ui/Button';
import roommateService from '../../api/roommateService';
import { customAlert } from '../../stores/alertStore';
import { motion } from 'framer-motion';

interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: string[];
  values: string[];
}

const YOUR_LIFESTYLE: Question[] = [
  { id: 'noiseTolerance', title: 'Noise Tolerance', subtitle: 'How much noise can you tolerate?', options: ['Prefer quiet', 'Moderate', "I'm loud"], values: ['quiet', 'moderate', 'loud'] },
  { id: 'cleanliness', title: 'Cleanliness', subtitle: 'How tidy do you keep your space?', options: ['Relaxed', 'Moderate', 'Strict'], values: ['relaxed', 'moderate', 'strict'] },
  { id: 'sleepSchedule', title: 'Sleep Schedule', subtitle: "What's your typical sleep pattern?", options: ['Early bird', 'Moderate', 'Night owl'], values: ['early', 'moderate', 'night-owl'] },
  { id: 'studySchedule', title: 'Study Habits', subtitle: 'Where do you prefer to study?', options: ['At home', 'Mixed', 'Library'], values: ['home', 'mixed', 'library'] },
  { id: 'socialActivity', title: 'Social Activity', subtitle: 'How social are you?', options: ['Introvert', 'Balanced', 'Extrovert'], values: ['introvert', 'balanced', 'extrovert'] },
  { id: 'guestComfort', title: 'Guest Comfort', subtitle: 'How often do you have guests?', options: ['No guests', 'Occasional', 'Frequent'], values: ['no-guests', 'occasional', 'frequent'] },
  { id: 'cookingFrequency', title: 'Cooking', subtitle: 'How often do you cook?', options: ['Never', 'Weekly', 'Daily'], values: ['never', 'weekly', 'daily'] },
  { id: 'smokingAlcohol', title: 'Smoking & Alcohol', subtitle: 'Your stance on smoking/alcohol?', options: ['Not okay', 'Neutral', 'Okay'], values: ['not-ok', 'neutral', 'ok'] },
  { id: 'powerUsage', title: 'Power Usage', subtitle: 'Your AC/fan/heater usage?', options: ['Minimal', 'Moderate', 'Heavy'], values: ['minimal', 'moderate', 'heavy'] },
];

const PREFERENCES: Question[] = [
  { id: 'preferredCleanliness', title: 'Preferred Cleanliness', subtitle: 'How tidy should your roommate be?', options: ['Any', 'Relaxed', 'Moderate', 'Strict'], values: ['any', 'relaxed', 'moderate', 'strict'] },
  { id: 'preferredNoiseTolerance', title: 'Preferred Noise', subtitle: 'Preferred noise level from roommate?', options: ['Any', 'Quiet', 'Moderate', 'Loud'], values: ['any', 'quiet', 'moderate', 'loud'] },
  { id: 'preferredSleepSchedule', title: 'Preferred Sleep', subtitle: 'Preferred roommate sleep schedule?', options: ['Any', 'Early', 'Moderate', 'Night owl'], values: ['any', 'early', 'moderate', 'night-owl'] },
  { id: 'preferredSmokingAlcohol', title: 'Smoking/Alcohol OK?', subtitle: 'Roommate smoking/alcohol okay?', options: ['Any', 'Not okay', 'Neutral', 'Okay'], values: ['any', 'not-ok', 'neutral', 'ok'] },
  { id: 'preferredSocialActivity', title: 'Preferred Social Level', subtitle: 'How social should they be?', options: ['Any', 'Introvert', 'Balanced', 'Extrovert'], values: ['any', 'introvert', 'balanced', 'extrovert'] },
];

export function LifestyleSurvey() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'lifestyle' | 'preferences'>('lifestyle');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const totalQuestions = YOUR_LIFESTYLE.length + PREFERENCES.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleSelect = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const payload: Record<string, any> = {
        ...answers,
        openness: 3, // default
        religionImportance: 3,
        lookingFor: 'any',
        budgetMin: 0,
        budgetMax: 0,
      };

      let existingProfile = null;
      try {
        const response = await roommateService.getProfile();
        existingProfile = response.data;
      } catch (e) {
        // ignore
      }

      if (existingProfile) {
        await roommateService.updateProfile(payload);
      } else {
        await roommateService.createProfile(payload);
      }

      await customAlert('Your roommate profile is ready.', 'Profile Saved!', 'success');
      navigate(-1);
    } catch (error: any) {
      console.error(error);
      customAlert(error.response?.data?.error?.message || 'Failed to save profile', 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentQuestions = step === 'lifestyle' ? YOUR_LIFESTYLE : PREFERENCES;
  const canProceed = step === 'lifestyle' 
    ? YOUR_LIFESTYLE.every(q => answers[q.id]) 
    : PREFERENCES.every(q => answers[q.id]);

  const renderQuestion = (q: Question) => (
    <div key={q.id} className="mb-6 bg-surface p-5 rounded-2xl border border-borderLight shadow-sm">
      <h3 className="text-base font-bold text-textPrimary mb-1">{q.title}</h3>
      <p className="text-sm text-textSecondary mb-4">{q.subtitle}</p>
      <div className="flex flex-wrap gap-2">
        {q.options.map((opt, i) => {
          const isSelected = answers[q.id] === q.values[i];
          return (
            <button
              key={opt}
              onClick={() => handleSelect(q.id, q.values[i])}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                isSelected 
                  ? 'bg-primary text-white border-primary shadow-sm' 
                  : 'bg-surfaceLight text-textSecondary border-borderLight border'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative">
        <MobileHeader title="Lifestyle Survey" onBack={() => navigate(-1)} />
        
        {/* Progress Bar */}
        <div className="px-5 pt-4 pb-2 bg-background z-10 sticky top-[60px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">
              {step === 'lifestyle' ? 'Your Lifestyle' : 'Preferences'}
            </span>
            <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-surfaceLight rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary" 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {currentQuestions.map(renderQuestion)}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-background/80 backdrop-blur-md border-t border-borderLight pb-safe">
          {step === 'lifestyle' ? (
            <Button
              fullWidth
              disabled={!canProceed}
              onClick={() => setStep('preferences')}
            >
              Next: Preferences
            </Button>
          ) : (
            <Button
              fullWidth
              disabled={!canProceed || saving}
              loading={saving}
              onClick={handleSave}
            >
              Save Profile
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
