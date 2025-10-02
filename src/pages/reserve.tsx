import React, { useState } from 'react';
import SeatSelector from '../components/SeatSelector';

const Reserve: React.FC = () => {
    const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

    const handleSeatSelection = (seat: string) => {
        setSelectedSeat(seat);
    };

    const handleReservation = () => {
        if (selectedSeat) {
            alert(`Reservation confirmed for seat: ${selectedSeat}`);
        } else {
            alert('Please select a seat to reserve.');
        }
    };

    return (
        <div>
            <h1>Reserve Your Seat</h1>
            <SeatSelector onSeatSelect={handleSeatSelection} />
            <button onClick={handleReservation}>Confirm Reservation</button>
        </div>
    );
};

export default Reserve;