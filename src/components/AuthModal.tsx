import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, message = 'Please sign in to continue' }) => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);

  if (!isOpen) return null;

  const handleSignIn = () => {
    router.push('/login');
    onClose();
  };

  const handleSignUp = () => {
    router.push('/signup');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in border-2 border-indigo-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleSignIn}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>
            <span className="relative">Sign In</span>
          </button>

          <button
            onClick={handleSignUp}
            className="w-full px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-200 rounded-xl font-semibold text-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
          >
            Create Account
          </button>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
