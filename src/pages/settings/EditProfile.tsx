import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { Button } from '../../components/ui/Button';
import { ArrowLeft01Icon, UserCircleIcon, Mail01Icon, CallIcon, Building03Icon, Location01Icon, Tick01Icon } from '@hugeicons/react';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';
import { customAlert } from '../../stores/alertStore';
import { authService } from '../../api/authService';

export function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    bio: (user as any)?.bio || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        bio: (user as any)?.bio || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      customAlert('Please fill in your name and phone number', 'Error', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const response = await authService.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        bio: formData.bio
      } as any);
      setUser({ ...user, ...response.data } as any);
      customAlert('Profile updated successfully', 'Success', 'success');
      navigate(-1);
    } catch (error: any) {
      customAlert(error.response?.data?.error?.message || 'Failed to update profile', 'Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell hideTabBar>
      <div className="flex flex-col h-full bg-background relative pb-[90px]">
        <MobileHeader title="Edit Profile" onBack={() => navigate(-1)} />
        
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-3">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <UserCircleIcon size={48} className="text-primary" />
              )}
            </div>
            <span className="text-sm font-semibold text-primary">Change Photo</span>
          </div>

          <Input
            label="Full Name"
            placeholder="Your name"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
          />

          <Input
            label="Email Address"
            value={user?.email || ''}
            disabled
            leftIcon={<Mail01Icon size={20} />}
          />

          <Input
            label="Phone Number"
            placeholder="Your phone number"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            type="tel"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-textPrimary">Bio</label>
            <textarea
              placeholder="Tell us about yourself"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full bg-surface border border-borderLight rounded-xl p-3 text-sm min-h-[100px] outline-none focus:border-primary focus:bg-white resize-none transition-colors duration-200"
            />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-borderLight z-30">
          <Button
            className="w-full shadow-md"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
