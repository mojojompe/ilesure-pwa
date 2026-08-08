import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { 
  CheckmarkCircle02Icon, 
  Location01Icon, 
  UserIcon, 
  Building03Icon,
  Money01Icon,
  Note01Icon,
  CreditCardIcon,
  Calendar01Icon
} from '@hugeicons/react';
import { clsx } from 'clsx';
// import { paymentService } from '../../api/paymentService'; // Uncomment when available

export function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Mock the payment process and then fetch summary
    const processPayment = async () => {
      setLoading(true);
      // Simulate Paystack redirect and callback
      setTimeout(() => {
        // Mock data matching RN's PaymentSummary
        setData({
          payment: {
            status: 'completed',
            amount: 1550000,
            reference: 'PAY_MOCK_12345',
            paymentMethod: 'card',
            paidAt: new Date().toISOString(),
          },
          listing: {
            title: 'Modern 2 Bedroom Apartment',
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
            address: '15 Admiralty Way',
            city: 'Lekki',
            propertyType: 'apartment',
            rentAnnual: 1500000,
            duration: 'yearly',
            furnishing: 'furnished',
            maxOccupants: 3,
          },
          agent: {
            fullName: 'Jane Smith',
            role: 'agent',
            email: 'jane@ilesure.com',
            phone: '+234 800 000 0000',
            avatar: null
          },
          company: null
        });
        setSuccess(true);
        setLoading(false);
      }, 2500);
    };
    
    processPayment();
  }, [id]);

  const goToDashboard = () => {
    navigate('/tabs/profile', { replace: true });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return { bg: '#E8F5E9', dot: '#388E3C', text: '#388E3C' };
      case 'pending': return { bg: '#FFF8E1', dot: '#F57C00', text: '#F57C00' };
      case 'failed': return { bg: '#FFEBEE', dot: '#D32F2F', text: '#D32F2F' };
      default: return { bg: '#F5F5F5', dot: '#9E9E9E', text: '#9E9E9E' };
    }
  };

  if (loading) {
    return (
      <AppShell hideTabBar>
        <div className="flex flex-col h-full items-center justify-center bg-background">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-textSecondary font-medium">Processing payment securely...</p>
        </div>
      </AppShell>
    );
  }

  if (!data) return null;

  const statusStyle = getStatusStyle(data.payment.status);

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative">
        <MobileHeader title="Payment Summary" onBack={() => navigate(-1)} />
        
        <div className="flex-1 overflow-y-auto pb-24">
          
          {/* Success Banner */}
          <div className="flex flex-col items-center py-10 px-4">
            <div className="mb-3">
              <CheckmarkCircle02Icon size={56} className="text-[#2E7D32]" variant="solid" />
            </div>
            <h2 className="text-[28px] font-black text-textPrimary mb-3">Payment Successful!</h2>
            <div 
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full"
              style={{ backgroundColor: statusStyle.bg }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusStyle.dot }} />
              <span className="text-sm font-bold capitalize" style={{ color: statusStyle.text }}>
                {data.payment.status}
              </span>
            </div>
          </div>

          {/* Property Details */}
          {data.listing && (
            <div className="bg-surface rounded-2xl mx-4 mb-4 p-4 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <h3 className="text-base font-black text-textPrimary mb-4">Property Details</h3>
              {data.listing.images?.[0] && (
                <img 
                  src={data.listing.images[0]} 
                  alt="Property" 
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              <h4 className="text-xl font-black text-textPrimary mb-1">{data.listing.title}</h4>
              
              {data.listing.address && (
                <div className="flex items-center gap-1 mb-4">
                  <Location01Icon size={16} className="text-textSecondary" />
                  <span className="text-sm text-textSecondary flex-1">
                    {data.listing.address}{data.listing.city ? `, ${data.listing.city}` : ''}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <div className="w-[47%] bg-background rounded-lg p-3 border border-border">
                  <p className="text-xs text-textSecondary mb-0.5">Type</p>
                  <p className="text-sm font-bold text-textPrimary capitalize">{data.listing.propertyType.replace(/_/g, ' ')}</p>
                </div>
                <div className="w-[47%] bg-background rounded-lg p-3 border border-border">
                  <p className="text-xs text-textSecondary mb-0.5">Rent</p>
                  <p className="text-sm font-bold text-textPrimary">
                    ₦{data.listing.rentAnnual.toLocaleString()}/{data.listing.duration === 'monthly' ? 'mo' : data.listing.duration === 'weekly' ? 'wk' : data.listing.duration === 'daily' ? 'day' : 'yr'}
                  </p>
                </div>
                <div className="w-[47%] bg-background rounded-lg p-3 border border-border">
                  <p className="text-xs text-textSecondary mb-0.5">Furnishing</p>
                  <p className="text-sm font-bold text-textPrimary capitalize">{data.listing.furnishing.replace(/_/g, ' ')}</p>
                </div>
                <div className="w-[47%] bg-background rounded-lg p-3 border border-border">
                  <p className="text-xs text-textSecondary mb-0.5">Max Occupants</p>
                  <p className="text-sm font-bold text-textPrimary">{data.listing.maxOccupants}</p>
                </div>
              </div>
            </div>
          )}

          {/* Agent / Landlord */}
          {data.agent && (
            <div className="bg-surface rounded-2xl mx-4 mb-4 p-4 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <h3 className="text-base font-black text-textPrimary mb-4">Agent / Landlord</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FFF0E6] flex items-center justify-center overflow-hidden">
                  {data.agent.avatar ? (
                    <img src={data.agent.avatar} alt="Agent" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={22} className="text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-[15px] font-bold text-textPrimary mb-0.5">{data.agent.fullName}</h4>
                  <p className="text-xs text-textSecondary capitalize mb-0.5">{data.agent.role.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-textTertiary">{data.agent.email}</p>
                  {data.agent.phone && <p className="text-xs text-textTertiary">{data.agent.phone}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Company */}
          {data.company && (
            <div className="bg-surface rounded-2xl mx-4 mb-4 p-4 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <h3 className="text-base font-black text-textPrimary mb-4">Company</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E3F2FD] flex items-center justify-center overflow-hidden">
                  <Building03Icon size={22} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[15px] font-bold text-textPrimary mb-0.5">{data.company.name}</h4>
                  <p className="text-xs text-textTertiary">{data.company.email}</p>
                  {data.company.phone && <p className="text-xs text-textTertiary">{data.company.phone}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          <div className="bg-surface rounded-2xl mx-4 mb-4 p-4 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-black text-textPrimary mb-4">Payment Details</h3>
            
            <div className="flex items-center py-2 border-b border-border">
              <div className="w-7 h-7 rounded-full bg-[#FFF0E6] flex items-center justify-center mr-3">
                <Money01Icon size={16} className="text-primary" />
              </div>
              <span className="text-sm text-textSecondary flex-1">Amount</span>
              <span className="text-sm font-bold text-textPrimary">₦{data.payment.amount.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center py-2 border-b border-border">
              <div className="w-7 h-7 rounded-full bg-[#FFF0E6] flex items-center justify-center mr-3">
                <Note01Icon size={16} className="text-primary" />
              </div>
              <span className="text-sm text-textSecondary flex-1">Reference</span>
              <span className="text-sm font-bold text-textPrimary">{data.payment.reference || 'N/A'}</span>
            </div>
            
            <div className="flex items-center py-2 border-b border-border">
              <div className="w-7 h-7 rounded-full bg-[#FFF0E6] flex items-center justify-center mr-3">
                <CreditCardIcon size={16} className="text-primary" />
              </div>
              <span className="text-sm text-textSecondary flex-1">Method</span>
              <span className="text-sm font-bold text-textPrimary capitalize">{data.payment.paymentMethod || 'N/A'}</span>
            </div>
            
            <div className="flex items-center py-2">
              <div className="w-7 h-7 rounded-full bg-[#FFF0E6] flex items-center justify-center mr-3">
                <Calendar01Icon size={16} className="text-primary" />
              </div>
              <span className="text-sm text-textSecondary flex-1">Date Paid</span>
              <span className="text-sm font-bold text-textPrimary">
                {data.payment.paidAt ? new Date(data.payment.paidAt).toLocaleDateString() : new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          <button 
            onClick={goToDashboard}
            className="bg-primary text-white text-[15px] font-bold py-4 rounded-xl mx-4 mt-2 active:scale-[0.98] transition-transform flex justify-center"
          >
            Go to Dashboard
          </button>
          
        </div>
      </div>
    </AppShell>
  );
}
