# Quick Start Guide

## ✅ What's Been Set Up

1. **Two-Tab Interface** - Your main page now has tabs for:
   - 🎾 Tennis Seat Reservation
   - 🎨 AI Image Editor

2. **Environment Variables** - `.env.local` configured with:
   - Supabase credentials
   - Replicate API token

3. **Components Created**:
   - `ImageEditor.tsx` - Full AI image editing interface
   - Updated `index.tsx` - Tabbed layout combining both features

4. **API Route** - `/api/generate` handles:
   - Image upload to Supabase
   - Replicate AI processing
   - Result storage and retrieval

5. **Modern Styling** - Beautiful gradient design with responsive layout

## 🚀 Next Steps

### 1. Set Up Supabase (CRITICAL)

Open your Supabase dashboard and run the SQL in `supabase-setup.sql`:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Copy and paste the contents of `supabase-setup.sql`
5. Click "Run"

### 2. Create Storage Buckets

In your Supabase dashboard:

1. Go to **Storage** section
2. Click **New Bucket**
3. Create bucket named: `input-images`
   - Check **Public bucket**
4. Create another bucket named: `output-images`
   - Check **Public bucket**

### 3. Run the Application

```bash
npm run dev
```

Open http://localhost:3000

## 🎨 How to Use

### Tennis Reservation
1. Click "🎾 Tennis Reservation" tab
2. Click on any seat (A1, A2, B1, etc.)
3. Click "Confirm Reservation"

### AI Image Editor
1. Click "🎨 AI Image Editor" tab
2. Click "Choose an image" to upload a photo
3. Enter a prompt like:
   - "Make it look like a watercolor painting"
   - "Turn it into a cartoon"
   - "Add a beautiful sunset"
4. Click "Generate Image"
5. Wait for processing (30-60 seconds)
6. Download your transformed image!

## 📝 Important Notes

- **First Time Setup**: Make sure to complete the Supabase setup steps above
- **API Limits**: Replicate has rate limits on their free tier
- **Image Sizes**: Keep uploaded images under 5MB for best performance
- **Security**: Never commit `.env.local` to git (already in .gitignore)

## 🔧 Troubleshooting

### "Failed to upload image"
- Check that both storage buckets exist in Supabase
- Verify buckets are set to **public**
- Check bucket names are exactly: `input-images` and `output-images`

### "Failed to generate image"
- Verify your Replicate API token is valid
- Check you haven't exceeded rate limits
- Try with a smaller image

### Database errors
- Run the `supabase-setup.sql` script
- Check the `projects` table exists
- Verify RLS policies are enabled

## 📚 Files Overview

- `src/pages/index.tsx` - Main page with tabs
- `src/components/ImageEditor.tsx` - AI image editor UI
- `src/components/SeatSelector.tsx` - Seat selection UI
- `src/app/api/generate/route.ts` - API for image generation
- `src/lib/supabase.ts` - Supabase client setup
- `src/styles/globals.css` - All styling
- `.env.local` - Environment variables (protected)

## 🎉 Ready to Go!

Your tennis reservation system is now enhanced with AI image editing capabilities! Both features are accessible from the beautiful tabbed interface.

Enjoy your new platform! 🚀
