import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../api/authService';
import { useAuthStore } from '../../stores/authStore';
import { MobileHeader } from '../../components/layout/MobileHeader';

export function Register() {
  const navigate = useNavigate();
  const setUser = useAuthStore(state => state.setUser);
  const setTokens = useAuthStore(state => state.setTokens);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.register({ 
        fullName: `${firstName} ${lastName}`.trim(), 
        email, 
        phone: '', // Mock or add phone field later
        password,
        role: 'student' // Default role for PWA registration
      });
      if (response.success) {
        setUser(response.user as any);
        setTokens(response.accessToken, response.refreshToken);
        navigate('/discover', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const response = await authService.googleLogin({ token: tokenResponse.access_token });
        if (response.success) {
          setUser(response.user as any);
          setTokens(response.accessToken, response.refreshToken);
          navigate('/discover', { replace: true });
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Google registration failed.');
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google Login Failed', error);
      setError('Google login failed.');
    }
  });

  return (
    <div className="flex flex-col h-screen bg-background max-w-md mx-auto">
      <MobileHeader title="Create Account" />
      
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-textPrimary">Join iléSure</h2>
          <p className="text-textSecondary mt-2">Create an account to continue.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-status-error/10 text-status-error text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4 mb-6">
          <div className="flex gap-4">
            <Input 
              label="First Name" 
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input 
              label="Last Name" 
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="johndoe@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" fullWidth loading={loading} className="mt-2">
            Create Account
          </Button>
        </form>

        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-borderLight" />
          </div>
          <span className="relative bg-background px-4 text-xs font-medium text-textSecondary uppercase tracking-widest">
            Or continue with
          </span>
        </div>

        <Button 
          type="button" 
          variant="outline" 
          fullWidth 
          onClick={() => loginWithGoogle()}
          disabled={loading}
          leftIcon={
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          }
        >
          Google
        </Button>

        <p className="text-center text-sm text-textSecondary mt-8">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-btn-primary">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
