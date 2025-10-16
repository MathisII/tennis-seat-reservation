import React from 'react';
import Head from 'next/head';
import AuthForm from '../components/AuthForm';
import Link from 'next/link';

const SignupPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Sign Up - Tennis Club</title>
        <meta name="description" content="Create your Tennis Club account" />
      </Head>

      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <AuthForm initialMode="signup" />
          
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
