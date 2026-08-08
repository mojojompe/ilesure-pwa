import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { paymentService } from '../../api/paymentService';
import { Home01Icon, Invoice01Icon, CreditCardIcon } from '@hugeicons/react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface Payment {
  id: string;
  amount: number;
  status: string;
  propertyName: string;
  reference: string;
  paidAt: string;
  createdAt: string;
}

export function PaymentHistory() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const { transactions } = await paymentService.getHistory();
        
        const mapped = transactions.map((t: any) => ({
          id: t.id,
          amount: t.amount,
          status: t.status,
          propertyName: t.listingTitle || (t.type === 'tier_subscription' ? 'Subscription Fee' : t.type.replace('_', ' ')),
          reference: t.reference || '',
          paidAt: t.paidAt ? new Date(t.paidAt).toLocaleDateString() : '',
          createdAt: new Date(t.createdAt).toLocaleDateString(),
          type: t.type
        }));
        
        setPayments(mapped);
        setTotalSpent(transactions.filter((t: any) => t.status === 'completed').reduce((sum: number, t: any) => sum + t.amount, 0));
      } catch (error) {
        console.error('Failed to load payments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = activeFilter === 'all'
    ? payments
    : payments.filter(p => p.status === activeFilter);

  const getTypeIcon = (propertyName: string, reference: string) => {
    if (propertyName === 'Subscription Fee') return <Invoice01Icon size={20} className="text-primary" />;
    if (reference) return <Home01Icon size={20} className="text-primary" />;
    return <CreditCardIcon size={20} className="text-primary" />;
  };

  const handlePaymentClick = (item: any) => {
    navigate('/payment-detail', { 
      state: { 
        propertyName: item.propertyName,
        amount: item.amount,
        status: item.status,
        reference: item.reference,
        paidAt: item.paidAt,
        createdAt: item.createdAt,
        type: item.propertyName === 'Subscription Fee' ? 'tier_subscription' : 'booking_fee',
      }
    });
  };

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background">
        <MobileHeader title="Payment History" onBack={() => navigate(-1)} />
        
        <div className="flex-1 overflow-y-auto pb-6">
          
          {/* Summary Card */}
          <div className="p-4">
            <div className="bg-surface rounded-[24px] p-6 border border-borderLight shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <span className="text-sm text-textSecondary mb-1 block">Total Spent</span>
              <span className="text-3xl font-black text-primary">₦{totalSpent.toLocaleString()}</span>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 mb-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {(['all', 'completed', 'pending', 'failed'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={clsx(
                  "px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-colors",
                  activeFilter === filter 
                    ? "bg-primary text-white" 
                    : "bg-surface border border-borderLight text-textSecondary"
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Payments List */}
          <div className="px-4 flex flex-col gap-3">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-10 text-textSecondary">
                No payments found
              </div>
            ) : (
              filteredPayments.map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={item.id}
                  onClick={() => handlePaymentClick(item)}
                  className="bg-surface rounded-2xl p-4 border border-borderLight shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FFF0E6] flex items-center justify-center shrink-0">
                    {getTypeIcon(item.propertyName, item.reference)}
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-base font-bold text-textPrimary truncate">{item.propertyName}</h4>
                    <p className="text-xs text-textTertiary mt-0.5">{item.paidAt || item.createdAt}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-base font-black text-primary">₦{item.amount.toLocaleString()}</span>
                    <div className={clsx(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      item.status === 'completed' && "bg-[#E8F5E9] text-[#388E3C] border border-[#C8E6C9]",
                      item.status === 'pending' && "bg-[#FFF8E1] text-[#F57C00] border border-[#FFE082]",
                      item.status === 'failed' && "bg-[#FFEBEE] text-[#D32F2F] border border-[#EFCDCA]"
                    )}>
                      {item.status}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
        </div>
      </div>
    </AppShell>
  );
}
