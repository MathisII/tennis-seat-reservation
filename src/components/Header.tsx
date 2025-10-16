import React from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

const Header: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="glass border-b border-white/20 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl sm:text-3xl">🎾</span>
            <span className="text-xl sm:text-2xl font-bold text-white group-hover:text-white/90 transition-colors">
              Tennis Club
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-3 sm:gap-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    {/* User Email */}
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
                      <span className="text-sm text-white/90">{user.email}</span>
                    </div>

                    {/* Dashboard Link */}
                    <Link
                      href="/dashboard"
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white/10 text-white rounded-full font-semibold text-sm sm:text-base hover:bg-white/20 transition-all duration-200 border border-white/20"
                    >
                      Dashboard
                    </Link>

                    {/* Sign Out Button */}
                    <button
                      onClick={handleSignOut}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-semibold text-sm sm:text-base hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    {/* Sign In Link */}
                    <Link
                      href="/login"
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white/10 text-white rounded-full font-semibold text-sm sm:text-base hover:bg-white/20 transition-all duration-200 border border-white/20"
                    >
                      Sign In
                    </Link>

                    {/* Sign Up Button */}
                    <Link
                      href="/signup"
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold text-sm sm:text-base hover:-translate-y-0.5 hover:shadow-glow-lg transition-all duration-200"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Mobile User Email */}
        {user && (
          <div className="sm:hidden pb-3">
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 text-center">
              <span className="text-sm text-white/90 truncate">{user.email}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
