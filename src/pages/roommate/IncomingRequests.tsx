import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { roommateService } from '../../api/roommateService';
import { customAlert } from '../../stores/alertStore';

interface IncomingRequest {
  _id: string;
  fromUserId: { _id: string; fullName: string; avatar?: string };
  status: string;
  createdAt: string;
}

export function IncomingRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await roommateService.getRequests();
      setRequests(res.data || []);
    } catch {
      customAlert('Failed to load requests', 'Error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      setProcessing(requestId);
      await roommateService.updateRequest(requestId, action);
      if (action === 'accept') {
        customAlert('You accepted the roommate request', 'Match!', 'success');
      }
      setRequests(prev => prev.filter(r => r._id !== requestId));
    } catch {
      customAlert(`Failed to ${action} request`, 'Error', 'error');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative pb-[90px]">
        
        {/* Header */}
        <MobileHeader title="Incoming Requests" onBack={() => navigate(-1)} />

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg className="w-16 h-16 text-textTertiary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-bold text-textPrimary mb-1">No pending requests</h3>
              <p className="text-textSecondary text-sm">When someone shows interest, it will appear here.</p>
            </div>
          ) : (
            requests.map((item) => (
              <div key={item._id} className="bg-surface rounded-2xl p-4 shadow-sm border border-borderLight flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-white font-bold">{item.fromUserId.fullName?.substring(0, 2).toUpperCase() || '??'}</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-base font-bold text-textPrimary truncate">{item.fromUserId.fullName || 'Anonymous'}</h4>
                    <span className="text-xs text-textSecondary">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <p className="text-sm font-medium text-textPrimary px-1">Wants to be your roommate</p>

                <div className="flex items-center gap-3 mt-1">
                  <button
                    disabled={processing === item._id}
                    onClick={() => handleAction(item._id, 'decline')}
                    className="flex-1 py-2.5 rounded-xl border border-borderLight text-textSecondary font-bold text-sm active:bg-surfaceLight transition-colors disabled:opacity-50"
                  >
                    Decline
                  </button>
                  <button
                    disabled={processing === item._id}
                    onClick={() => handleAction(item._id, 'accept')}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-sm active:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
                  >
                    {processing === item._id ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Accept'
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
