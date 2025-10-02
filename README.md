# Tennis Seat Reservation System

This project is a web application for reserving seats for tennis matches. It allows users to view available seats and make reservations easily.

## Project Structure

```
tennis-seat-reservation
├── src
│   ├── pages
│   │   ├── index.tsx        # Homepage of the application
│   │   └── reserve.tsx      # Reservation page for selecting seats
│   ├── components
│   │   └── SeatSelector.tsx  # Component for seat selection
│   ├── styles
│   │   └── globals.css       # Global CSS styles
│   └── types
│       └── index.ts          # TypeScript interfaces
├── public
│   └── favicon.ico           # Favicon for the website
├── package.json              # npm configuration file
├── tsconfig.json             # TypeScript configuration file
└── README.md                 # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd tennis-seat-reservation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   npm run dev
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## Usage Guidelines

- Navigate to the homepage to view an overview of the reservation system.
- Click on the "Reserve" link to go to the reservation page where you can select your desired seat.
- Follow the prompts to confirm your reservation.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.