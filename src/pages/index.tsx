import React, { useState } from 'react';
import { useRouter } from 'next/router';
import SeatSelector from '../components/SeatSelector';
import ImageEditor from '../components/ImageEditor';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'reservation' | 'image-editor';

const Home: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('reservation');
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
    const [reservationConfirmed, setReservationConfirmed] = useState<boolean>(false);

    const handleSeatSelection = (seat: string) => {
        setSelectedSeat(seat);
        setReservationConfirmed(false);
    };

    const handleReservation = () => {
        if (selectedSeat) {
            setReservationConfirmed(true);
            // Here you could add API call to save reservation
            setTimeout(() => {
                setReservationConfirmed(false);
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen relative">
            {/* Hero Header */}
            <header className="text-center mb-12 sm:mb-16 pt-12 sm:pt-20 px-4 sm:px-6 animate-fade-in-down">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                        <span className="inline-block bg-gradient-to-br from-white via-white to-indigo-100 bg-clip-text text-transparent drop-shadow-2xl">
                            🎾 Tennis Club
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-light tracking-wide mb-8">
                        Reserve your seat or create AI-powered images
                    </p>

                    {/* CTA Buttons */}
                    {!user && (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                            <button
                                onClick={() => router.push('/signup')}
                                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-xl hover:-translate-y-1 hover:scale-105 hover:shadow-glow-lg transition-all duration-200 relative overflow-hidden group"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>
                                <span className="relative">🚀 Get Started</span>
                            </button>
                            <button
                                onClick={() => router.push('/login')}
                                className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 rounded-full font-semibold text-lg hover:bg-white/30 hover:-translate-y-1 transition-all duration-200 shadow-lg"
                            >
                                Sign In
                            </button>
                        </div>
                    )}

                    {user && (
                        <div className="mt-8">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full font-bold text-lg shadow-xl hover:-translate-y-1 hover:scale-105 hover:shadow-glow-lg transition-all duration-200 relative overflow-hidden group"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>
                                <span className="relative">📊 Go to Dashboard</span>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
                {/* Modern Tabs with Glassmorphism */}
                <div className="glass rounded-3xl p-2 sm:p-2.5 mb-8 sm:mb-10 shadow-2xl border border-white/20 animate-slide-up" style={{animationDelay: '0.2s'}}>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <button
                            className={`flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-200 relative overflow-hidden group ${
                                activeTab === 'reservation'
                                    ? 'bg-gradient-to-br from-white/25 to-white/15 text-white border-2 border-white/30 shadow-lg scale-[1.02]'
                                    : 'bg-transparent text-white/80 border-2 border-transparent hover:bg-white/10 hover:text-white hover:-translate-y-0.5'
                            }`}
                            onClick={() => setActiveTab('reservation')}
                            aria-pressed={activeTab === 'reservation'}
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>
                            <span className="relative">🎾 Seat Reservation</span>
                        </button>
                        <button
                            className={`flex-1 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-200 relative overflow-hidden group ${
                                activeTab === 'image-editor'
                                    ? 'bg-gradient-to-br from-white/25 to-white/15 text-white border-2 border-white/30 shadow-lg scale-[1.02]'
                                    : 'bg-transparent text-white/80 border-2 border-transparent hover:bg-white/10 hover:text-white hover:-translate-y-0.5'
                            }`}
                            onClick={() => setActiveTab('image-editor')}
                            aria-pressed={activeTab === 'image-editor'}
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>
                            <span className="relative">🎨 Image Editor</span>
                        </button>
                    </div>
                </div>

                {/* Tab Content with Glass Effect */}
                <div 
                    className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-white/30 min-h-[600px] animate-scale-in"
                    style={{animationDelay: '0.3s'}}
                >
                    {activeTab === 'reservation' ? (
                        <div className="text-center">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Reserve Your Seat
                            </h2>
                            
                            <SeatSelector onSeatSelect={handleSeatSelection} />
                            
                            <button 
                                onClick={handleReservation} 
                                className={`mt-8 sm:mt-10 px-8 sm:px-12 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-xl transition-all duration-200 relative overflow-hidden group ${
                                    !selectedSeat 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
                                        : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:-translate-y-1 hover:scale-105 hover:shadow-glow-lg'
                                }`}
                                disabled={!selectedSeat}
                            >
                                {!selectedSeat && (
                                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>
                                )}
                                <span className="relative">
                                    {reservationConfirmed ? '✓ Reservation Confirmed!' : 'Confirm Reservation'}
                                </span>
                            </button>
                            
                            {reservationConfirmed && selectedSeat && (
                                <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-gradient-to-r from-emerald-50 to-cyan-50 border-2 border-emerald-200 rounded-2xl animate-bounce-in">
                                    <p className="text-base sm:text-lg text-gray-800 font-medium flex items-center justify-center gap-3">
                                        <span className="text-xl sm:text-2xl">✓</span>
                                        Your reservation for seat <strong className="text-indigo-600 text-lg sm:text-xl mx-1">{selectedSeat}</strong> has been confirmed!
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <ImageEditor />
                    )}
                </div>
            </div>

            {/* Modern Footer */}
            <footer className="text-center py-8 sm:py-10 px-4 animate-fade-in" style={{animationDelay: '0.5s'}}>
                <p className="text-white/70 text-sm sm:text-base">
                    © 2025 Tennis Club. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default Home;