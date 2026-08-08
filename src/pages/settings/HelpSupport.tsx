import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { 
  MessageMultiple02Icon, 
  Mail01Icon, 
  ArrowRight01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  InstagramIcon,
  TwitterIcon,
  Linkedin01Icon,
  TiktokIcon,
  WhatsappIcon
} from '@hugeicons/react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ_ITEMS = [
  {
    q: 'How do I find apartments near my school?',
    a: 'Use the Discover tab to browse all available listings. You can filter by price, distance, property type, and more.',
  },
  {
    q: 'How does roommate matching work?',
    a: 'We compare your lifestyle preferences (sleep schedule, cleanliness, study habits, etc.) with other students using a compatibility algorithm. The higher the score, the better the match.',
  },
  {
    q: 'Is my identity kept private until I match?',
    a: 'Yes. All matches are fully anonymous until both parties express interest. Contact details are released only on mutual interest.',
  },
  {
    q: 'How do agents get verified?',
    a: 'Agents must submit identity documents, a utility bill, proof of property ownership, and a live selfie. Our team reviews and approves within 48 hours.',
  },
  {
    q: 'What is the Waitlist feature?',
    a: "If no apartment currently matches your criteria, you can join the waitlist with your preferences. We'll notify you when a suitable listing becomes available.",
  },
  {
    q: 'Can I report a suspicious listing?',
    a: 'Yes. Tap the flag icon on any listing or contact our support team. We investigate all reports within 24 hours.',
  },
];

const CONTACT_CHANNELS = [
  { icon: MessageMultiple02Icon, label: 'AI Chatbot', detail: 'Available 24/7', link: 'https://www.ilesure.com/chat' },
  { icon: Mail01Icon, label: 'Email Support', detail: 'ilesuresupport@gmail.com', link: 'mailto:ilesuresupport@gmail.com' },
  { icon: WhatsappIcon, label: 'WhatsApp', detail: '+234 816 938 4301', link: 'https://wa.me/2348169384301' },
];

const SOCIAL_CHANNELS = [
  { icon: InstagramIcon, label: 'Instagram', detail: '@ilesure_technologies', link: 'https://www.instagram.com/ilesure_technologies/' },
  { icon: TwitterIcon, label: 'Twitter / X', detail: '@ilesuresupport', link: 'https://x.com/ilesuresupport' },
  { icon: Linkedin01Icon, label: 'LinkedIn', detail: 'ilèsure Technologies', link: 'https://www.linkedin.com/company/ilesure-technologies' },
  { icon: TiktokIcon, label: 'TikTok', detail: '@ilesure.com', link: 'https://www.tiktok.com/@ilesure.com' },
];

export function HelpSupport() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative">
        <MobileHeader title="Help & Support" onBack={() => navigate(-1)} />
        
        <div className="flex-1 overflow-y-auto px-4 pb-12">
          
          {/* Hero */}
          <div className="bg-surface rounded-3xl p-6 flex flex-col items-center mb-6 mt-4 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="w-16 h-16 rounded-full bg-[#FFF0E6] flex items-center justify-center mb-4 shadow-sm">
              <MessageMultiple02Icon size={32} className="text-primary" />
            </div>
            <h2 className="text-[22px] font-extrabold text-textPrimary text-center">How can we help?</h2>
            <p className="text-[15px] text-textSecondary text-center leading-snug mt-1">
              Browse FAQs or reach out to our support team
            </p>
          </div>

          {/* Contact channels */}
          <h3 className="text-xs font-bold tracking-wide text-textTertiary mb-2 uppercase">
            CONTACT US
          </h3>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-6">
            {CONTACT_CHANNELS.map((ch, idx) => {
              const Icon = ch.icon;
              return (
                <a 
                  key={ch.label}
                  href={ch.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx(
                    "flex items-center px-4 py-4 active:bg-surfaceLight transition-colors",
                    idx < CONTACT_CHANNELS.length - 1 && "border-b border-borderLight"
                  )}
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <div className="flex-1 ml-2">
                    <h4 className="text-[15px] font-bold text-textPrimary mb-0.5">{ch.label}</h4>
                    <p className="text-sm text-textSecondary">{ch.detail}</p>
                  </div>
                  <ArrowRight01Icon size={18} className="text-textTertiary" />
                </a>
              );
            })}
          </div>

          {/* Social channels */}
          <h3 className="text-xs font-bold tracking-wide text-textTertiary mb-2 uppercase">
            SOCIALS
          </h3>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-6">
            {SOCIAL_CHANNELS.map((ch, idx) => {
              const Icon = ch.icon;
              return (
                <a 
                  key={ch.label}
                  href={ch.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx(
                    "flex items-center px-4 py-4 active:bg-surfaceLight transition-colors",
                    idx < SOCIAL_CHANNELS.length - 1 && "border-b border-borderLight"
                  )}
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <div className="flex-1 ml-2">
                    <h4 className="text-[15px] font-bold text-textPrimary mb-0.5">{ch.label}</h4>
                    <p className="text-sm text-textSecondary">{ch.detail}</p>
                  </div>
                  <ArrowRight01Icon size={18} className="text-textTertiary" />
                </a>
              );
            })}
          </div>

          {/* FAQ */}
          <h3 className="text-xs font-bold tracking-wide text-textTertiary mb-2 uppercase">
            FREQUENTLY ASKED
          </h3>
          <div className="flex flex-col gap-2 mb-8">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div 
                  key={idx}
                  className={clsx(
                    "bg-surface rounded-[16px] border transition-colors",
                    isOpen ? "border-accent bg-[#FFFDF5]" : "border-border"
                  )}
                >
                  <button 
                    className="w-full flex items-start justify-between p-4 text-left"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  >
                    <span className={clsx(
                      "flex-1 text-[15px] font-semibold leading-snug mr-2",
                      isOpen ? "text-primary" : "text-textPrimary"
                    )}>
                      {item.q}
                    </span>
                    <div className="mt-0.5">
                      {isOpen ? (
                        <ArrowUp01Icon size={18} className="text-primary" />
                      ) : (
                        <ArrowDown01Icon size={18} className="text-textTertiary" />
                      )}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0">
                          <p className="text-sm text-textSecondary leading-relaxed">{item.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          
        </div>
      </div>
    </AppShell>
  );
}
