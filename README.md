# Tennis Seat Reservation & AI Image Editor

A comprehensive Next.js application combining tennis seat reservation with AI-powered image editing.

## Features

### 🎾 Tennis Seat Reservation
- Interactive seat selection interface
- Real-time seat availability
- Easy reservation confirmation

### 🎨 AI Image Editor
- Upload images for AI transformation
- Text-to-image editing with Replicate AI
- Image storage with Supabase
- Download generated images

## Tech Stack

- **Framework**: Next.js with TypeScript
- **AI Engine**: Replicate (google/nano-banana model)
- **Storage & Database**: Supabase
- **Styling**: Custom CSS with modern gradients

## Project Structure

```
tennis-seat-reservation
├── src
│   ├── app
│   │   └── api
│   │       └── generate
│   │           └── route.ts          # AI image generation API
│   ├── pages
│   │   ├── index.tsx                 # Main app with tabs
│   │   └── reserve.tsx               # Legacy reservation page
│   ├── components
│   │   ├── SeatSelector.tsx          # Seat selection component
│   │   └── ImageEditor.tsx           # Image editor component
│   ├── lib
│   │   └── supabase.ts               # Supabase client
│   ├── styles
│   │   └── globals.css               # Global CSS styles
│   └── types
│       └── index.ts                  # TypeScript interfaces
├── public
│   └── favicon.ico                   # Favicon for the website
├── .env.local                         # Environment variables (DO NOT COMMIT)
├── package.json                       # npm configuration file
├── tsconfig.json                      # TypeScript configuration file
└── README.md                          # Project documentation
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd tennis-seat-reservation
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

The `.env.local` file contains your Supabase and Replicate credentials:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `REPLICATE_API_TOKEN` - Replicate API token

**Important**: Make sure `.env.local` is in your `.gitignore` to protect your API keys!

### 4. Supabase Setup

Make sure you have the following in your Supabase project:

#### Storage Buckets:
- `input-images` - for uploaded images
- `output-images` - for AI-generated images

**Make both buckets public** so you can access the image URLs.

#### Database Table:
Create a table named `projects` with the following schema:

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  input_image_url TEXT,
  output_image_url TEXT,
  prompt TEXT,
  status TEXT
);
```

### 5. Run the application

```bash
npm run dev
```

### 6. Open your browser and navigate to:

```
http://localhost:3000
```

## Usage Guidelines

### Tennis Reservation Tab
1. Click on the "🎾 Tennis Reservation" tab
2. Select your desired seat from the grid
3. Click "Confirm Reservation"

### AI Image Editor Tab
1. Click on the "🎨 AI Image Editor" tab
2. Upload an image using the file selector
3. Enter a transformation prompt (e.g., "Make it look like a watercolor painting")
4. Click "Generate Image"
5. Wait for the AI to process your image
6. Download the generated result

## API Endpoints

### POST `/api/generate`
Generates an AI-transformed image based on an input image and prompt.

**Request Body** (FormData):
- `image`: Image file
- `prompt`: Transformation description

**Response**:
```json
{
  "success": true,
  "outputUrl": "https://...",
  "inputUrl": "https://...",
  "prompt": "..."
}
```

## Troubleshooting

### Images not uploading to Supabase
- Verify your storage buckets exist and are public
- Check that the bucket names match exactly: `input-images` and `output-images`
- Verify your service role key has proper permissions

### Replicate API errors
- Ensure your API token is valid
- Check that the model name is correct: `google/nano-banana`
- Be aware of Replicate's rate limits

### Database errors
- Verify the `projects` table exists with the correct schema
- Check UUID column is properly configured

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.