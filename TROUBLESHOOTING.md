# 🔧 Troubleshooting Guide# Troubleshooting Guide - Image Generation Issues



## Common Issues and Solutions## Common Errors and Solutions



### 1. Image Generation Issues### "Failed to generate image"



#### Error: "Failed to generate image"This error can occur for several reasons. Let's troubleshoot step by step:



**Possible Causes:**#### 1. Check Supabase Buckets ✅

- Replicate API token is invalid or expired

- Rate limit exceededThe most common issue is missing or misconfigured storage buckets.

- Network issues

**Steps to verify:**

**Solutions:**1. Go to https://supabase.com/dashboard

2. Select your project: ngeuifvirwxbyerjdiqf

1. **Check your Replicate API token**:3. Click on "Storage" in the left sidebar

   - Go to https://replicate.com/account/api-tokens4. You should see TWO buckets:

   - Verify your token is active   - `input-images`

   - Make sure it's correctly set in `.env.local` as `REPLICATE_API_TOKEN`   - `output-images`



2. **Check rate limits**:**If buckets don't exist:**

   - Free tier has limited API calls1. Click "New bucket"

   - Wait or upgrade your plan2. Name: `input-images`, check "Public bucket", click "Create"

3. Repeat for `output-images`

3. **Restart the development server**:

   ```bash**If buckets exist but are private:**

   # Stop with Ctrl+C1. Click on the bucket name

   npm run dev2. Click "Settings" tab

   ```3. Toggle "Public bucket" to ON

4. Click "Save"

#### Error: "Image upload failed"

#### 2. Check Environment Variables ✅

**Solutions:**

- Check file size (max 10MB)Make sure `.env.local` contains all required variables:

- Verify file is a valid image format (jpg, png, webp)

- Check Supabase storage buckets are configured```bash

NEXT_PUBLIC_SUPABASE_URL=https://ngeuifvirwxbyerjdiqf.supabase.co

### 2. Authentication Issues

#### Error: "Email address is invalid"

**Cause:** Using blocked domains like `example.com` or `test.com`

**Solution:** Use real email domains:- Stop the dev server (Ctrl+C)

```- Restart with `npm run dev`

✅ yourname@gmail.com

✅ user@outlook.com#### 3. Verify Replicate API Token ✅

✅ demo@yahoo.com

```1. Go to https://replicate.com/account/api-tokens

2. Verify your token is active (should be in `.env.local` as `REPLICATE_API_TOKEN`)

See `QUICK_FIX.md` for details.3. Check you haven't exceeded rate limits



#### Error: "Unauthorized"**Note:** The free tier has limited API calls. If you've used up your quota, you'll need to wait or upgrade.



**Solutions:****⚠️ Important**: Never commit your API token to Git. Keep it only in `.env.local`.

1. Make sure you're logged in

2. Check Supabase configuration in `.env.local`#### 4. Check the Database Table ✅

3. Verify authentication is enabled in Supabase Dashboard

Run this SQL in your Supabase SQL Editor:

### 3. Database Issues

```sql

#### Error: "Failed to save project"-- Check if table exists

SELECT * FROM projects LIMIT 1;

**Solutions:**

-- If error, create the table:

1. **Check Supabase connection**:CREATE TABLE IF NOT EXISTS projects (

   ```bash  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

   node test-supabase.js  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

   ```  input_image_url TEXT NOT NULL,

  output_image_url TEXT,

2. **Verify table exists**:  prompt TEXT NOT NULL,

   - Go to Supabase Dashboard → Table Editor  status TEXT DEFAULT 'pending'

   - Check `projects` table exists);

   - Run `supabase-setup.sql` if needed```



3. **Check RLS policies**:#### 5. Model Availability 🔍

   - Authentication → Policies

   - Verify users can insert/select their own projectsThe original prompt mentioned using `google/nano-banana`, but this model might not be available or might be renamed.



### 4. Build/Compilation Errors**Current implementation uses:** `stability-ai/stable-diffusion`



#### Error: "Module not found"This model generates images from text prompts only (not image-to-image transformation).



**Solution:****To use image-to-image transformation:**

```bashYou can try models like:

# Reinstall dependencies- `stability-ai/stable-diffusion-img2img`

rm -rf node_modules package-lock.json- `timoth ybrooks/instruct-pix2pix`

npm install

```## Debugging Steps



#### Error: "Tailwind CSS not working"### View Console Logs



**Solution:**1. Open your browser's Developer Tools (F12)

```bash2. Go to the "Console" tab

# Reinstall Tailwind3. Try generating an image

npm install -D @tailwindcss/postcss4. Look for error messages in red

npm run dev

```### View Network Requests



### 5. Deployment Issues1. Open Developer Tools (F12)

2. Go to the "Network" tab

#### Vercel Deployment Fails3. Click "Generate Image"

4. Look for the `/api/generate` request

**Solutions:**5. Click on it to see the response



1. **Add environment variables in Vercel**:Common responses:

   - Go to Project Settings → Environment Variables- `400`: Missing image or prompt

   - Add all variables from `.env.local`:- `500`: Server error (check terminal logs)

     - `NEXT_PUBLIC_SUPABASE_URL`- `401`: Authentication error with Supabase or Replicate

     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

     - `SUPABASE_SERVICE_ROLE_KEY`### Check Terminal Output

     - `REPLICATE_API_TOKEN`

When you click "Generate Image", watch the terminal where `npm run dev` is running.

2. **Check build logs** for specific errors

You should see console.log messages like:

3. **Verify Node.js version** matches your local version```

Input image uploaded: https://...

## Environment Variables ChecklistCalling Replicate API with prompt: ...

Generated image URL: https://...

Make sure `.env.local` contains:Output image uploaded: https://...

```

```bash

# SupabaseIf you see an error, it will show the details there.

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key## Specific Error Messages

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

### "Error uploading input image"

# Replicate- **Cause:** Supabase bucket doesn't exist or is not accessible

REPLICATE_API_TOKEN=your-replicate-token- **Solution:** Create `input-images` bucket and make it public

```

### "Error uploading output image"

⚠️ **Never commit `.env.local` to Git!**- **Cause:** Output bucket doesn't exist or is not accessible

- **Solution:** Create `output-images` bucket and make it public

## Testing Checklist

### "Invalid output from Replicate"

Before reporting an issue, try:- **Cause:** Replicate model returned unexpected format

- **Solution:** Model might be unavailable. Check Replicate status

- [ ] Restart development server

- [ ] Clear browser cache (Ctrl+Shift+R)### "Unauthorized" or "403 Forbidden"

- [ ] Check browser console for errors (F12)- **Cause:** Invalid API tokens

- [ ] Verify all environment variables are set- **Solution:** Verify your tokens in `.env.local`

- [ ] Test with a different browser

- [ ] Check Supabase Dashboard for errors### "Rate limit exceeded"

- **Cause:** Too many API calls to Replicate

## Getting Help- **Solution:** Wait or upgrade your Replicate plan



1. Check the documentation files:## Testing Checklist

   - `README.md` - Project overview

   - `AUTHENTICATION_GUIDE.md` - Auth setupBefore using the image generator:

   - `QUICK_FIX.md` - Email validation issues

   - `SUPABASE_CHECKLIST.md` - Database configuration- [ ] Supabase `input-images` bucket exists and is public

- [ ] Supabase `output-images` bucket exists and is public

2. Run diagnostic scripts:- [ ] `projects` table exists in database

   ```bash- [ ] All environment variables are set in `.env.local`

   node test-email-validation.js- [ ] Dev server restarted after changing `.env.local`

   node test-supabase.js- [ ] Replicate API token is valid

   ```- [ ] You haven't exceeded Replicate rate limits



3. Check browser console and terminal for error messages## Still Having Issues?



## Security Notes1. **Check browser console** for client-side errors

2. **Check terminal** for server-side errors

- Never share your API tokens publicly3. **Verify all credentials** are correct

- Keep `.env.local` in `.gitignore`4. **Try a simple prompt** like "a beautiful sunset"

- Rotate tokens if accidentally exposed5. **Use a small image** (< 1MB)

- Use environment variables for all secrets

## Working Example

## Still Having Issues?

Once everything is set up correctly:

If none of these solutions work:

1. Upload a small JPG/PNG file

1. Open browser DevTools (F12)2. Enter prompt: "a beautiful landscape"

2. Check Console tab for JavaScript errors3. Click "Generate Image"

3. Check Network tab for failed requests4. Wait 30-60 seconds

4. Copy the error message and search for it in:5. See your generated image!

   - Next.js documentation

   - Supabase documentationThe app will:

   - Replicate documentation- Upload your image to `input-images`

- Send the prompt to Replicate
- Generate an image
- Store it in `output-images`
- Save record in `projects` table
- Display the result
