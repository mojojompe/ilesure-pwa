import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { CheckmarkBadge01Icon } from '@hugeicons/react';

export function SafetyTips() {
  const navigate = useNavigate();

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative">
        <MobileHeader title="Safety Tips" onBack={() => navigate(-1)} />
        
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
              <CheckmarkBadge01Icon size={32} className="text-[#2E7D32]" variant="solid" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-textPrimary leading-tight">House Hunting<br/>Safely</h2>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-[15px] font-bold text-textPrimary mb-2">1. Never Pay Before Inspection</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Legitimate landlords and agents will not ask for inspection fees or full rent before you have seen the property physically.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-textPrimary mb-2">2. Verify Documents</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Always ask to see proof of ownership or the agent's mandate from the landlord before signing any agreements.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-textPrimary mb-2">3. Meet in Daylight</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Schedule inspections during daylight hours and preferably go with a friend or family member.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-textPrimary mb-2">4. Pay to Company Accounts</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Where possible, make payments through our platform or direct to corporate accounts, never to an agent's personal account.
              </p>
            </div>
          </div>

          <div className="mt-10 p-5 bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl">
            <h3 className="text-[15px] font-bold text-[#991B1B] mb-2">Spotted a scammer?</h3>
            <p className="text-sm text-[#B91C1C] leading-relaxed mb-4">
              If an agent asks for inspection fees before viewing, pressures you for cash, or refuses to show the property, report them immediately.
            </p>
            <button 
              className="w-full bg-[#DC2626] text-white font-bold py-3 rounded-xl active:opacity-80"
              onClick={() => alert('Navigate to support or report page')}
            >
              Report Suspicious Activity
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
