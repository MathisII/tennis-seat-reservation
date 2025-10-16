import React, { useState } from 'react';

type SeatSelectorProps = {
    onSeatSelect: (seat: string) => void;
};

const SeatSelector: React.FC<SeatSelectorProps> = ({ onSeatSelect }) => {
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
    
    // More realistic tennis court seating arrangement
    const rows = {
        'A': ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'],
        'B': ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'],
        'C': ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'],
    };

    const handleSeatSelect = (seat: string) => {
        setSelectedSeat(seat);
        onSeatSelect(seat);
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Seating Area */}
            <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 rounded-2xl p-6 sm:p-8 border-2 border-dashed border-indigo-200/60 mb-6">
                <div className="flex flex-col gap-4 sm:gap-6">
                    {Object.entries(rows).map(([rowName, seats], index) => (
                        <div 
                            key={rowName} 
                            className="flex items-center gap-3 sm:gap-4 animate-fade-in"
                            style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                        >
                            {/* Row Label */}
                            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-700 text-white font-bold text-lg sm:text-xl rounded-full shadow-lg">
                                {rowName}
                            </div>
                            
                            {/* Seats Grid */}
                            <div className="flex flex-wrap gap-2 sm:gap-2.5 flex-1">
                                {seats.map(seat => (
                                    <button
                                        key={seat}
                                        className={`
                                            group relative px-4 sm:px-5 py-3 sm:py-4 min-w-[56px] sm:min-w-[68px] 
                                            rounded-xl font-bold text-sm sm:text-base
                                            transition-all duration-200 
                                            shadow-md hover:shadow-xl
                                            ${selectedSeat === seat
                                                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white scale-110 shadow-glow animate-pulse-glow'
                                                : 'bg-white text-gray-700 border-2 border-indigo-200/40 hover:border-indigo-500 hover:-translate-y-1 hover:scale-105'
                                            }
                                        `}
                                        onClick={() => handleSeatSelect(seat)}
                                        aria-label={`Seat ${seat}`}
                                    >
                                        {/* Hover Effect Overlay */}
                                        {selectedSeat !== seat && (
                                            <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-400/0 to-purple-400/0 group-hover:from-indigo-400/20 group-hover:to-purple-400/20 transition-all duration-300"></span>
                                        )}
                                        
                                        {/* Seat Number */}
                                        <span className="relative z-10">
                                            {seat.substring(1)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Selection Info */}
            {selectedSeat && (
                <div className="bg-gradient-to-r from-emerald-50 via-cyan-50 to-emerald-50 border-2 border-emerald-200/60 rounded-2xl p-4 sm:p-6 animate-bounce-in shadow-lg">
                    <p className="text-base sm:text-lg text-gray-800 font-medium text-center flex items-center justify-center gap-2 sm:gap-3">
                        <span className="text-emerald-600 text-xl sm:text-2xl font-bold">✓</span>
                        <span>Selected seat:</span>
                        <strong className="text-indigo-600 text-lg sm:text-2xl px-2 sm:px-3 py-0.5 sm:py-1 bg-white rounded-lg shadow-md">
                            {selectedSeat}
                        </strong>
                    </p>
                </div>
            )}

            {/* Legend */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white border-2 border-indigo-200 rounded-lg shadow-sm"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg shadow-md"></div>
                    <span>Selected</span>
                </div>
            </div>
        </div>
    );
};

export default SeatSelector;