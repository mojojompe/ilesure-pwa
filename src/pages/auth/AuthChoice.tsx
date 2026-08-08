import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';

export function AuthChoice() {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Slight delay to allow mounting
    setTimeout(() => setIsReady(true), 50);
  }, []);

  return (
    <div className="min-h-screen bg-primary flex flex-col overflow-hidden">
      {/* TOP HEADER SECTION (Brown) */}
      <div className="h-[60vh] relative flex flex-col items-center justify-center overflow-hidden pt-safe">
        <AnimatePresence>
          {isReady && (
            <>
              <motion.img
                src="/images/bg_fallback_transparent.png"
                className="w-[280px] h-[280px] object-contain mb-8"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  opacity: { duration: 0.4 },
                  delay: 0.15
                }}
              />
              
              <motion.div 
                className="flex flex-col items-center -mt-5"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-5xl font-black tracking-[-1.5px] mb-1">
                  <span style={{ color: '#E8DCC4' }}>ilé</span>
                  <span style={{ color: '#EAA221' }}>Sure</span>
                </h1>
                <p className="text-sm font-semibold tracking-widest text-white/85 uppercase">
                  Your sure home anywhere
                </p>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM SHEET SECTION (White) */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            className="flex-1 bg-white rounded-t-[36px] -mt-[30px] shadow-[0_-10px_20px_rgba(0,0,0,0.15)] z-10"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{
              type: 'spring',
              delay: 0.3
            }}
          >
            <div className="flex-1 px-6 pt-12 flex flex-col items-center h-full">
              <h2 className="text-xl font-extrabold text-[#1A1A1A] mb-8">Welcome Back! 👋 </h2>

              <Button 
                onClick={() => navigate('/login')} 
                className="w-full bg-primary text-white !py-4 rounded-[50px] shadow-sm"
              >
                Login
              </Button>

              <div className="flex flex-row items-center w-full my-8">
                <div className="flex-1 h-px bg-[#E0E0E0]" />
                <span className="mx-4 text-[#9E9E9E] text-sm font-semibold">or</span>
                <div className="flex-1 h-px bg-[#E0E0E0]" />
              </div>

              <Button 
                variant="outline"
                onClick={() => navigate('/auth/role')} 
                className="w-full !bg-[#E8DCC4] border-0 text-primary !py-4 rounded-[50px]"
              >
                Create an account
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
