import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { Home01Icon, Invoice01Icon, Calendar01Icon, CreditCardIcon } from '@hugeicons/react';
import { clsx } from 'clsx';

interface PaymentDetailState {
  propertyName: string;
  amount: number;
  status: string;
  reference: string;
  paidAt: string;
  createdAt: string;
  type: string;
}

export function PaymentDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PaymentDetailState;

  if (!state) {
    return <Navigate to="/payment-history" replace />;
  }

  const detailItems = [
    { label: 'Property', value: state.propertyName, icon: Home01Icon },
    { label: 'Reference ID', value: state.reference || 'N/A', icon: Invoice01Icon },
    { label: 'Date Paid', value: state.paidAt || state.createdAt, icon: Calendar01Icon },
    { label: 'Payment Type', value: state.type.replace('_', ' '), icon: CreditCardIcon },
  ];

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative overflow-hidden">
        <MobileHeader title="Payment Details" onBack={() => navigate(-1)} />
        
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
          
          {/* Amount Card */}
          <div className="bg-surface rounded-3xl p-8 border border-borderLight shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col items-center">
            <span className="text-sm text-textSecondary mb-2">Amount</span>
            <span className="text-4xl font-black text-primary mb-4">₦{state.amount.toLocaleString()}</span>
            
            <div className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl border",
              state.status === 'completed' && "bg-[#E8F5E9] border-[#C8E6C9]",
              state.status === 'pending' && "bg-[#FFF8E1] border-[#FFE082]",
              state.status === 'failed' && "bg-[#FFEBEE] border-[#EFCDCA]"
            )}>
              <div className={clsx(
                "w-2 h-2 rounded-full",
                state.status === 'completed' && "bg-[#388E3C]",
                state.status === 'pending' && "bg-[#F57C00]",
                state.status === 'failed' && "bg-[#D32F2F]"
              )} />
              <span className={clsx(
                "text-sm font-bold capitalize",
                state.status === 'completed' && "text-[#388E3C]",
                state.status === 'pending' && "text-[#F57C00]",
                state.status === 'failed' && "text-[#D32F2F]"
              )}>
                {state.status}
              </span>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-surface rounded-3xl border border-borderLight shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
            {detailItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.label} 
                  className={clsx(
                    "flex items-center p-4",
                    index < detailItems.length - 1 && "border-b border-borderLight"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-[#FFF0E6] flex items-center justify-center shrink-0 mr-4">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-textSecondary mb-0.5">{item.label}</p>
                    <p className="text-sm font-bold text-textPrimary capitalize truncate">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
        </div>
      </div>
    </AppShell>
  );
}
