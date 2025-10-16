import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import multiparty from 'multiparty';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Disable body parsing for multiparty
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simple UUID generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Sanitize filename
function sanitizeFilename(filename: string): string {
  return path
    .basename(filename)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempFilePath: string | null = null;

  try {
    // Verify authentication
    const authSupabase = createPagesServerClient({ req, res });
    const {
      data: { session },
    } = await authSupabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Parse form data
    const form = new multiparty.Form();
    
    const parseForm = (): Promise<{ fields: any; files: any }> => {
      return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });
    };

    const { fields, files } = await parseForm();

    // Validate inputs
    const imageFile = files.image?.[0];
    const prompt = fields.prompt?.[0];

    if (!imageFile) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    tempFilePath = imageFile.path;

    // Read the uploaded file
    const imageBuffer = fs.readFileSync(imageFile.path);
    const sanitizedFilename = sanitizeFilename(imageFile.originalFilename);
    const inputFileName = `${generateUUID()}-${sanitizedFilename}`;

    // Upload input image to Supabase
    const { error: inputError } = await supabase.storage
      .from('input-images')
      .upload(inputFileName, imageBuffer, {
        contentType: imageFile.headers['content-type'] || 'image/jpeg',
      });

    if (inputError) {
      console.error('Input upload error:', inputError);
      return res.status(500).json({ error: 'Failed to upload input image: ' + inputError.message });
    }

    // Get the public URL of the uploaded image
    const { data: inputUrl } = supabase.storage
      .from('input-images')
      .getPublicUrl(inputFileName);

    // Create project with pending payment
    const projectId = generateUUID();
    const { error: dbError } = await supabase
      .from('projects')
      .insert({
        id: projectId,
        user_id: session.user.id,
        input_image_url: inputUrl.publicUrl,
        output_image_url: null,
        prompt: prompt.trim(),
        status: 'pending_payment',
        payment_status: 'pending',
        payment_amount: 2.00,
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Failed to create project: ' + dbError.message });
    }

    return res.status(200).json({ 
      success: true,
      projectId,
      inputUrl: inputUrl.publicUrl,
    });
    
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    // Clean up temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temp file:', cleanupError);
      }
    }
  }
}
