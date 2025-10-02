export interface Seat {
    id: number;
    isAvailable: boolean;
    row: number;
    number: number;
}

export interface Reservation {
    seatId: number;
    userId: string;
    matchId: string;
    reservationTime: Date;
}