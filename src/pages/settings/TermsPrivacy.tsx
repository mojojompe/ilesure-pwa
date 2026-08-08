import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { GlobalIcon, CheckmarkBadge01Icon, MessageMultiple02Icon } from '@hugeicons/react';

export function TermsPrivacy() {
  const navigate = useNavigate();

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative">
        <MobileHeader title="Terms & Privacy" onBack={() => navigate(-1)} />
        
        <div className="flex-1 overflow-y-auto px-4 pb-20">
          <div className="text-right text-xs text-textSecondary mt-4 mb-6">
            Last updated: January 2024
          </div>

          <div className="mb-6">
            <h3 className="text-[15px] font-semibold text-textPrimary mb-2">1. Introduction</h3>
            <p className="text-[15px] text-textSecondary leading-relaxed">
              Welcome to Ile Sure. By using our application, you agree to these terms.
              Please read them carefully. If you do not agree to these terms, please do not use our app.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-[15px] font-semibold text-textPrimary mb-2">2. Privacy Policy</h3>
            <p className="text-[15px] text-textSecondary leading-relaxed mb-4">
              We are committed to protecting your privacy. Ile Sure collects personal information
              including your name, email, phone number, and lifestyle preferences for roommate
              matching purposes.
            </p>
            <p className="text-[15px] text-textSecondary leading-relaxed mb-4">
              <strong className="font-semibold text-textPrimary block mb-1">Data We Collect:</strong>
              • Account information (name, email, phone)<br/>
              • Housing preferences<br/>
              • Roommate preferences and lifestyle information<br/>
              • Communication data
            </p>
            <p className="text-[15px] text-textSecondary leading-relaxed">
              <strong className="font-semibold text-textPrimary block mb-1">How We Use Your Data:</strong>
              • To provide housing and roommate matching services<br/>
              • To communicate with you about listings and matches<br/>
              • To improve our services
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-[15px] font-semibold text-textPrimary mb-2">3. User Responsibilities</h3>
            <p className="text-[15px] text-textSecondary leading-relaxed">
              As a user of Ile Sure, you agree to:<br/>
              • Provide accurate information<br/>
              • Not use the app for illegal purposes<br/>
              • Not harass or harm other users<br/>
              • Not post false or misleading listings
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-[15px] font-semibold text-textPrimary mb-2">4. Listing Guidelines</h3>
            <p className="text-[15px] text-textSecondary leading-relaxed">
              Landlords must ensure their listings are accurate and legal. We reserve the right
              to remove any listing that violates our guidelines or applicable laws.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-[15px] font-semibold text-textPrimary mb-2">5. Roommate Matching</h3>
            <p className="text-[15px] text-textSecondary leading-relaxed">
              Our matching algorithm uses your lifestyle preferences to find compatible roommates.
              We do not guarantee perfect matches and encourage users to communicate directly
              before making any commitments.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-[15px] font-semibold text-textPrimary mb-2">6. Limitation of Liability</h3>
            <p className="text-[15px] text-textSecondary leading-relaxed">
              Ile Sure is a platform connecting students with landlords and potential roommates.
              We are not responsible for the actions of users or the quality of accommodations.
              Users should exercise caution and verify all information independently.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-[15px] font-semibold text-textPrimary mb-2">7. Intellectual Property</h3>
            <p className="text-[15px] text-textSecondary leading-relaxed">
              All content, features, and functionality of Ile Sure are owned by us and are
              protected by Nigerian and international copyright, trademark, and other laws.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-[15px] font-semibold text-textPrimary mb-2">8. Termination</h3>
            <p className="text-[15px] text-textSecondary leading-relaxed">
              We may terminate or suspend your account at any time for violation of these
              terms or for any other reason at our sole discretion.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-[15px] font-semibold text-textPrimary mb-2">9. Contact Information</h3>
            <p className="text-[15px] text-textSecondary leading-relaxed">
              For questions about these terms, please contact us:<br/>
              Email: support@iléSure.com<br/>
              Phone: +234 812 345 6789
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-[15px] font-semibold text-textPrimary mb-2">10. NDPR Compliance</h3>
            <p className="text-[15px] text-textSecondary leading-relaxed">
              Ile Sure complies with the Nigeria Data Protection Regulation (NDPR). You have
              the right to access, correct, or delete your personal data. Contact us to exercise
              these rights.
            </p>
          </div>

          <div className="pt-6 border-t border-border mt-8 flex flex-col gap-2">
            <a href="#" className="flex items-center py-3 active:opacity-70 transition-opacity">
              <GlobalIcon size={20} className="text-primary" />
              <span className="text-[15px] font-medium text-primary ml-3">Visit our website</span>
            </a>
            <a href="mailto:privacy@iléSure.com" className="flex items-center py-3 active:opacity-70 transition-opacity">
              <CheckmarkBadge01Icon size={20} className="text-primary" />
              <span className="text-[15px] font-medium text-primary ml-3">Privacy Policy</span>
            </a>
            <a href="mailto:support@iléSure.com" className="flex items-center py-3 active:opacity-70 transition-opacity">
              <MessageMultiple02Icon size={20} className="text-primary" />
              <span className="text-[15px] font-medium text-primary ml-3">Contact Us</span>
            </a>
          </div>
          
        </div>
      </div>
    </AppShell>
  );
}
