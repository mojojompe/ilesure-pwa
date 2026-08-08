import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft01Icon, InformationCircleIcon } from '@hugeicons/react';
import { Button } from '../../components/ui/Button';

type Role = 'student' | 'student-non' | 'agent' | 'company';

const ROLES = [
  {
    id: 'student' as Role,
    title: 'Student',
    subtitle: 'Browse apartments near campus, find roommates, and join waitlists.',
    image: '/images/roles/student.png',
    accentColor: '#E1AD01', // Mustard
  },
  {
    id: 'student-non' as Role,
    title: 'Not a Student',
    subtitle: 'A regular tenant looking for housing. Browse and book without school filters.',
    image: '/images/roles/non_student.png',
    accentColor: '#3E1F0A', // Burnt Brown
  },
];

export function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsReady(true), 50);
  }, []);

  const handleContinue = () => {
    if (selectedRole === 'student') {
      // Assuming SchoolSelection is part of Register in PWA or a separate route
      navigate('/auth/school');
    } else if (selectedRole === 'student-non') {
      navigate('/register', { state: { role: 'individual' } });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5E1] flex flex-col font-sans">
      <div className="flex-1 flex flex-col overflow-y-auto px-4 pb-8 pt-safe-top">
        
        {/* Header */}
        <motion.div 
          className="pt-2 mb-6 flex flex-row justify-between items-center"
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

          <button onClick={() => navigate('/login')}>
            <span className="text-base text-text-secondary font-semibold">Skip</span>
          </button>
        </motion.div>

        {/* Title Block */}
        <motion.div 
          className="mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-[32px] font-extrabold text-text-primary tracking-[-0.5px] mb-2">
            I am a...
          </h1>
          <p className="text-base text-text-secondary leading-[22px]">
            Choose your role to get the right experience
          </p>
        </motion.div>

        {/* Role List */}
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {isReady && ROLES.map((role, index) => {
              const isSelected = selectedRole === role.id;
              return (
                <motion.div
                  key={role.id}
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    delay: 0.3 + index * 0.1
                  }}
                >
                  <motion.button
                    layout
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full bg-white rounded-[32px] border-2 border-transparent px-6 min-h-[200px] flex flex-col justify-center text-left transition-all duration-300 ${
                      isSelected 
                        ? 'shadow-[0_20px_40px_rgba(0,0,0,0.12)] scale-[1.02] -translate-y-1.5' 
                        : 'opacity-65'
                    }`}
                  >
                    <div className="flex flex-row items-center gap-6">
                      <div className="w-[90px] h-[90px] flex items-center justify-center shrink-0">
                        <img src={role.image} alt={role.title} className="w-[90px] h-[90px] object-contain" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <motion.h2 
                          layout="position"
                          className="text-[28px] font-black"
                          style={{ color: isSelected ? role.accentColor : '#2D1B12' }} // textPrimary
                        >
                          {role.title}
                        </motion.h2>
                        
                        <AnimatePresence>
                          {isSelected && (
                            <motion.p
                              layout="position"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-base text-text-secondary leading-6 mt-2"
                            >
                              {role.subtitle}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        <div className="h-12" />
      </div>

      {/* Footer */}
      <motion.div 
        className="px-4 pb-8 pt-2 flex flex-col gap-2 bg-[#FFF5E1]"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {selectedRole === 'student' && (
          <div className="flex flex-row items-center gap-1 bg-mustard-pale rounded-lg px-4 py-2 border border-[#FFE88A]">
            <InformationCircleIcon size={16} className="text-accent" />
            <span className="text-sm text-text-secondary flex-1">
              You'll select your school on the next step
            </span>
          </div>
        )}
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
