import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

import { Splash } from './pages/auth/Splash';
import { Onboarding } from './pages/auth/Onboarding';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { AuthChoice } from './pages/auth/AuthChoice';
import { RoleSelection } from './pages/auth/RoleSelection';
import { SchoolSelection } from './pages/auth/SchoolSelection';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { OTP } from './pages/auth/OTP';

import { Discover } from './pages/tabs/Discover';
import { Roommates } from './pages/tabs/Roommates';
import { MyApartments } from './pages/tabs/MyApartments';
import { ChatsList } from './pages/tabs/ChatsList';
import { Waitlist } from './pages/settings/Waitlist';
import { SafetyTips } from './pages/common/SafetyTips';
import { Notifications } from './pages/tabs/Notifications';
import { Profile } from './pages/tabs/Profile';

import { ListingDetail } from './pages/details/ListingDetail';
import { AgentProfile } from './pages/details/AgentProfile';
import { MatchProfile } from './pages/details/MatchProfile';
import { ChatScreen } from './pages/details/ChatScreen';
import { LifestyleSurvey } from './pages/roommate/LifestyleSurvey';

import { Checkout } from './pages/booking/Checkout';
import { KYC } from './pages/booking/KYC';
import { Signature } from './pages/booking/Signature';
import { Payment } from './pages/booking/Payment';
import { BookingDetail } from './pages/booking/BookingDetail';
import { SharedBookingDetail } from './pages/booking/SharedBookingDetail';
import { PaymentHistory } from './pages/booking/PaymentHistory';
import { PaymentDetail } from './pages/booking/PaymentDetail';

import { SavedListings } from './pages/settings/SavedListings';
import { NotificationSettings } from './pages/settings/NotificationSettings';
import { PrivacySecurity } from './pages/settings/PrivacySecurity';
import { TermsPrivacy } from './pages/settings/TermsPrivacy';
import { HelpSupport } from './pages/settings/HelpSupport';
import { EditProfile } from './pages/settings/EditProfile';
import { AlertModal } from './components/common/AlertModal';
import { PWAInstallModal } from './components/common/PWAInstallModal';

const NotFound = () => <div className="p-4 text-center">404 - Not Found</div>;

export default function App() {
  useEffect(() => {
    // Hide splash screen or initialization logic here
  }, []);

  return (
    <div className="w-full min-h-screen bg-background flex flex-col md:max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/choice" element={<AuthChoice />} />
        <Route path="/auth/role" element={<RoleSelection />} />
        <Route path="/auth/school" element={<SchoolSelection />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/otp" element={<OTP />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/roommates" element={<Roommates />} />
        <Route path="/my-apartments" element={<MyApartments />} />
        <Route path="/chats" element={<ChatsList />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />

        {/* Details & Modals */}
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/agent/:id" element={<AgentProfile />} />
        <Route path="/match/:id" element={<MatchProfile />} />
        <Route path="/lifestyle-survey" element={<LifestyleSurvey />} />
        <Route path="/chat/:id" element={<ChatScreen />} />
        
        {/* Booking & Checkout */}
        <Route path="/booking/:id" element={<BookingDetail />} />
        <Route path="/shared-booking/:id" element={<SharedBookingDetail />} />
        <Route path="/booking/checkout/:id" element={<Checkout />} />
        <Route path="/booking/kyc/:id" element={<KYC />} />
        <Route path="/booking/signature/:id" element={<Signature />} />
        <Route path="/booking/payment/:id" element={<Payment />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/payment-detail" element={<PaymentDetail />} />

        {/* Settings & Support */}
        <Route path="/saved-listings" element={<SavedListings />} />
        <Route path="/settings/notifications" element={<NotificationSettings />} />
        <Route path="/settings/privacy" element={<PrivacySecurity />} />
        <Route path="/terms" element={<TermsPrivacy />} />
        <Route path="/support" element={<HelpSupport />} />
        <Route path="/settings/edit-profile" element={<EditProfile />} />
        <Route path="/safety-tips" element={<SafetyTips />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <AlertModal />
      <PWAInstallModal />
    </div>
  );
}
