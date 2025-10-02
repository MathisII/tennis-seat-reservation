import React from 'react';

const Home: React.FC = () => {
    return (
        <div>
            <h1>Welcome to the Tennis Match Reservation System</h1>
            <p>Reserve your seat for an exciting tennis match!</p>
            <a href="/reserve">Go to Reservation</a>
        </div>
    );
};

export default Home;