import { Routes, Route } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';

import { Splash } from './pages/auth/Splash';
const Onboarding = lazy(() => import('./pages/auth/Onboarding').then(module => ({ default: module.Onboarding })));

const Login = lazy(() => import('./pages/auth/Login').then(module => ({ default: module.Login })));

const Register = lazy(() => import('./pages/auth/Register').then(module => ({ default: module.Register })));

const AuthChoice = lazy(() => import('./pages/auth/AuthChoice').then(module => ({ default: module.AuthChoice })));

const RoleSelection = lazy(() => import('./pages/auth/RoleSelection').then(module => ({ default: module.RoleSelection })));

const SchoolSelection = lazy(() => import('./pages/auth/SchoolSelection').then(module => ({ default: module.SchoolSelection })));

const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(module => ({ default: module.ForgotPassword })));

const OTP = lazy(() => import('./pages/auth/OTP').then(module => ({ default: module.OTP })));


const Discover = lazy(() => import('./pages/tabs/Discover').then(module => ({ default: module.Discover })));

const Roommates = lazy(() => import('./pages/tabs/Roommates').then(module => ({ default: module.Roommates })));

const MyApartments = lazy(() => import('./pages/tabs/MyApartments').then(module => ({ default: module.MyApartments })));

const ChatsList = lazy(() => import('./pages/tabs/ChatsList').then(module => ({ default: module.ChatsList })));

const Waitlist = lazy(() => import('./pages/settings/Waitlist').then(module => ({ default: module.Waitlist })));

const SafetyTips = lazy(() => import('./pages/common/SafetyTips').then(module => ({ default: module.SafetyTips })));

const Notifications = lazy(() => import('./pages/tabs/Notifications').then(module => ({ default: module.Notifications })));

const Profile = lazy(() => import('./pages/tabs/Profile').then(module => ({ default: module.Profile })));


const ListingDetail = lazy(() => import('./pages/details/ListingDetail').then(module => ({ default: module.ListingDetail })));

const AgentProfile = lazy(() => import('./pages/details/AgentProfile').then(module => ({ default: module.AgentProfile })));

const MatchProfile = lazy(() => import('./pages/details/MatchProfile').then(module => ({ default: module.MatchProfile })));

const ChatScreen = lazy(() => import('./pages/details/ChatScreen').then(module => ({ default: module.ChatScreen })));

const LifestyleSurvey = lazy(() => import('./pages/roommate/LifestyleSurvey').then(module => ({ default: module.LifestyleSurvey })));

const IncomingRequests = lazy(() => import('./pages/roommate/IncomingRequests').then(module => ({ default: module.IncomingRequests })));

const RoommateProfile = lazy(() => import('./pages/roommate/RoommateProfile').then(module => ({ default: module.RoommateProfile })));


const Checkout = lazy(() => import('./pages/booking/Checkout').then(module => ({ default: module.Checkout })));

const KYC = lazy(() => import('./pages/booking/KYC').then(module => ({ default: module.KYC })));

const Signature = lazy(() => import('./pages/booking/Signature').then(module => ({ default: module.Signature })));

const Payment = lazy(() => import('./pages/booking/Payment').then(module => ({ default: module.Payment })));

const PaymentCallback = lazy(() => import('./pages/booking/PaymentCallback').then(module => ({ default: module.PaymentCallback })));

const BookingDetail = lazy(() => import('./pages/booking/BookingDetail').then(module => ({ default: module.BookingDetail })));

const SharedBookingDetail = lazy(() => import('./pages/booking/SharedBookingDetail').then(module => ({ default: module.SharedBookingDetail })));

const PaymentHistory = lazy(() => import('./pages/booking/PaymentHistory').then(module => ({ default: module.PaymentHistory })));

const PaymentDetail = lazy(() => import('./pages/booking/PaymentDetail').then(module => ({ default: module.PaymentDetail })));


const SavedListings = lazy(() => import('./pages/settings/SavedListings').then(module => ({ default: module.SavedListings })));

const NotificationSettings = lazy(() => import('./pages/settings/NotificationSettings').then(module => ({ default: module.NotificationSettings })));

const PrivacySecurity = lazy(() => import('./pages/settings/PrivacySecurity').then(module => ({ default: module.PrivacySecurity })));

const TermsPrivacy = lazy(() => import('./pages/settings/TermsPrivacy').then(module => ({ default: module.TermsPrivacy })));

const HelpSupport = lazy(() => import('./pages/settings/HelpSupport').then(module => ({ default: module.HelpSupport })));

const EditProfile = lazy(() => import('./pages/settings/EditProfile').then(module => ({ default: module.EditProfile })));

const DeleteAccount = lazy(() => import('./pages/settings/DeleteAccount').then(module => ({ default: module.DeleteAccount })));

import { AlertModal } from './components/common/AlertModal';
import { PWAInstallModal } from './components/common/PWAInstallModal';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { CallProvider } from './contexts/CallContext';
import { CallOverlay } from './components/call/CallOverlay';
import { socketService } from './api/socketService';
import { useAuthStore } from './stores/authStore';
import { authService } from './api/authService';

const NotFound = () => <div className="p-4 text-center">404 - Not Found</div>;

export default function App() {
  useEffect(() => {
    // Refresh the cached user from the server on launch so profile edits made elsewhere
    // (or fields the cached copy never had) are reflected instead of a stale localStorage blob.
    const { isAuthenticated, token, setUser } = useAuthStore.getState();
    if (!isAuthenticated || !token) return;
    authService.getProfile()
      .then((res) => { if (res?.success && res.data) setUser({ ...useAuthStore.getState().user, ...res.data } as any); })
      .catch(() => { /* offline or expired session, the API client handles 401s */ });
  }, []);

  /**
   * Hold a socket open for the whole session, not just while a chat screen is
   * mounted.
   *
   * `socketService.connect()` existed but nothing ever called it, so the socket
   * was never established: presence never registered (the user showed offline
   * to everyone), incoming calls could not arrive, and placing one failed with
   * "You appear to be offline".
   */
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useEffect(() => {
    if (!isAuthenticated) {
      socketService.disconnect();
      return;
    }
    socketService.connect();
    return () => { socketService.disconnect(); };
  }, [isAuthenticated]);

  return (
    <CallProvider>
      <div className="w-full min-h-screen bg-background flex flex-col md:max-w-md mx-auto shadow-2xl relative overflow-hidden">
        
        <Suspense fallback={<div className="flex-1 flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
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

          {/* Protected Routes - Only for Students and Individuals on PWA */}
          <Route element={<ProtectedRoute allowedRoles={['student', 'individual']} />}>
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
            <Route path="/roommate-profile" element={<RoommateProfile />} />
            <Route path="/lifestyle-survey" element={<LifestyleSurvey />} />
            <Route path="/chat/:id" element={<ChatScreen />} />

            {/* Booking & Checkout */}
            <Route path="/booking/:id" element={<BookingDetail />} />
            <Route path="/shared-booking/:id" element={<SharedBookingDetail />} />
            <Route path="/booking/checkout/:id" element={<Checkout />} />
            <Route path="/booking/kyc/:id" element={<KYC />} />
            <Route path="/booking/signature/:id" element={<Signature />} />
            <Route path="/booking/payment/:id" element={<Payment />} />
            {/* SECURITY-FIX (P-H5): Paystack callbackUrl target so real payments can be verified in-app */}
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            <Route path="/payment-detail" element={<PaymentDetail />} />

            {/* Settings & Support */}
            <Route path="/saved-listings" element={<SavedListings />} />
            <Route path="/settings/notifications" element={<NotificationSettings />} />
            <Route path="/settings/privacy" element={<PrivacySecurity />} />
            <Route path="/settings/delete-account" element={<DeleteAccount />} />
            <Route path="/terms" element={<TermsPrivacy />} />
            <Route path="/support" element={<HelpSupport />} />
            <Route path="/settings/edit-profile" element={<EditProfile />} />
            <Route path="/safety-tips" element={<SafetyTips />} />

            {/* Missing Parity Pages */}
            <Route path="/incoming-requests" element={<IncomingRequests />} />
            <Route path="/waitlist" element={<Waitlist />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        <AlertModal />
        <PWAInstallModal />
        {/* Above the router so a call survives navigation and can arrive on any screen. */}
        <CallOverlay />
      </div>
    </CallProvider>
  );
}
