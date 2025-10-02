import React, { useState } from 'react';

type SeatSelectorProps = {
    onSeatSelect: (seat: string) => void;
};

const SeatSelector: React.FC<SeatSelectorProps> = ({ onSeatSelect }) => {
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
    const availableSeats = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3']; // Example seat data

    const handleSeatSelect = (seat: string) => {
        setSelectedSeat(seat);
        onSeatSelect(seat); // Call the passed down function when a seat is selected
    };

    return (
        <div>
            <h2>Select Your Seat</h2>
            <div className="seat-grid">
                {availableSeats.map(seat => (
                    <button
                        key={seat}
                        className={`seat ${selectedSeat === seat ? 'selected' : ''}`}
                        onClick={() => handleSeatSelect(seat)}
                    >
                        {seat}
                    </button>
                ))}
            </div>
            {selectedSeat && <p>You have selected seat: {selectedSeat}</p>}
        </div>
    );
};

export default SeatSelector;