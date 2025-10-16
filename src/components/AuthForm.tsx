import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

type AuthMode = 'login' | 'signup';

interface AuthFormProps {
  initialMode?: AuthMode;
}

const AuthForm: React.FC<AuthFormProps> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showEmailTip, setShowEmailTip] = useState(false);

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const checkEmailDomain = (email: string): void => {
    const blockedDomains = ['example.com', 'test.com', 'localhost'];
    const domain = email.split('@')[1];
    
    if (domain && blockedDomains.includes(domain.toLowerCase())) {
      setShowEmailTip(true);
    } else {
      setShowEmailTip(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    checkEmailDomain(newEmail);
  };

  const suggestEmail = () => {
    const username = email.split('@')[0];
    const timestamp = Date.now().toString().slice(-6);
    return `${username}-${timestamp}@gmail.com`;
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message || 'Failed to sign in');
        } else {
          setSuccess('Successfully signed in!');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message || 'Failed to sign up');
        } else {
          setSuccess('Account created! Please check your email to confirm your account.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tabs */}
      <div className="glass rounded-3xl p-2 mb-6 shadow-lg border border-white/20">
        <div className="flex gap-2">
          <button
            className={`flex-1 px-6 py-3 rounded-2xl font-semibold text-base transition-all duration-200 ${
              mode === 'login'
                ? 'bg-gradient-to-br from-white/25 to-white/15 text-white border-2 border-white/30 shadow-lg'
                : 'bg-transparent text-white/80 border-2 border-transparent hover:bg-white/10'
            }`}
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccess(null);
            }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`flex-1 px-6 py-3 rounded-2xl font-semibold text-base transition-all duration-200 ${
              mode === 'signup'
                ? 'bg-gradient-to-br from-white/25 to-white/15 text-white border-2 border-white/30 shadow-lg'
                : 'bg-transparent text-white/80 border-2 border-transparent hover:bg-white/10'
            }`}
            onClick={() => {
              setMode('signup');
              setError(null);
              setSuccess(null);
            }}
            type="button"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full px-4 py-3 border-2 border-indigo-200/60 rounded-xl text-base transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-200/40 focus:border-indigo-500 bg-white text-gray-900"
              placeholder="yourname@gmail.com"
              required
              disabled={loading}
            />
            
            {/* Email Domain Warning */}
            {showEmailTip && mode === 'signup' && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <span className="text-amber-600 text-lg flex-shrink-0">⚠️</span>
                <div className="text-sm">
                  <p className="text-amber-800 font-medium mb-1">
                    This domain may not work
                  </p>
                  <p className="text-amber-700 mb-2">
                    Try using a real email domain like Gmail or Outlook.
                  </p>
                  <button
                    type="button"
                    onClick={() => setEmail(suggestEmail())}
                    className="text-indigo-600 font-semibold hover:text-indigo-700 underline"
                  >
                    Use: {suggestEmail()}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-indigo-200/60 rounded-xl text-base transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-200/40 focus:border-indigo-500 bg-white text-gray-900"
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {/* Confirm Password (signup only) */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-indigo-200/60 rounded-xl text-base transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-200/40 focus:border-indigo-500 bg-white text-gray-900"
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-red-50/60 border-2 border-red-200 rounded-xl flex items-center gap-3 animate-shake">
              <span className="text-xl flex-shrink-0">⚠️</span>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-50/60 border-2 border-emerald-200 rounded-xl flex items-center gap-3 animate-bounce-in">
              <span className="text-xl font-bold text-emerald-600 flex-shrink-0">✓</span>
              <p className="text-sm text-emerald-700 font-medium">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-6 py-4 rounded-full text-lg font-bold shadow-lg transition-all duration-200 ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:-translate-y-1 hover:scale-105 hover:shadow-glow-lg'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccess(null);
                }}
                className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
