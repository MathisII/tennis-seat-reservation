import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import Replicate from 'replicate';
import multiparty from 'multiparty';
import fs from 'fs';
import path from 'path';

// Disable body parsing for multiparty
export const config = {
  api: {
    bodyParser: false,
  },
};

// Validate environment variables
function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'REPLICATE_API_TOKEN'
  ];
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }
}

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Validate HTTP method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }

  let tempFilePath: string | null = null;
  let userId: string | null = null;

  try {
    // Validate environment
    validateEnvironment();

    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.substring(7);

    // Create Supabase client with user's token for auth
    const authSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await authSupabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    userId = user.id;

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
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Image file is required' 
      });
    }

    if (!prompt) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Prompt is required' 
      });
    }

    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'Prompt must be a non-empty string' 
      });
    }

    tempFilePath = imageFile.path;

    // Read the uploaded file
    let imageBuffer: Buffer;
    try {
      imageBuffer = fs.readFileSync(imageFile.path);
    } catch (error) {
      return res.status(500).json({ 
        error: 'File read error',
        message: 'Failed to read uploaded file' 
      });
    }

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
      return res.status(500).json({ 
        error: 'Storage error',
        message: 'Failed to upload input image: ' + inputError.message 
      });
    }

    // Get the public URL of the uploaded image
    const { data: inputUrl } = supabase.storage
      .from('input-images')
      .getPublicUrl(inputFileName);

    console.log('Input image uploaded successfully');

    // Call Replicate API for image editing
    console.log('Starting image generation with Replicate...');
    
    let output: any;
    try {
      // Using Google Nano Banana for image transformation
      const input = {
        prompt: prompt.trim(),
        image_input: [inputUrl.publicUrl],
        aspect_ratio: "match_input_image",
        output_format: "jpg"
      };
      
      output = await replicate.run("google/nano-banana", { input });
    } catch (replicateError) {
      console.error('Replicate API error:', replicateError);
      return res.status(500).json({ 
        error: 'Generation error',
        message: replicateError instanceof Error ? replicateError.message : 'Failed to generate image'
      });
    }

    // Handle Replicate output (could be string, array, File object, or ReadableStream)
    let outputBuffer: Buffer;
    
    try {
      if (output && typeof output.url === 'function') {
        // Handle File object with url() method (Nano Banana format)
        const generatedImageUrl = output.url();
        console.log('Generated image URL:', generatedImageUrl);
        const outputResponse = await fetch(generatedImageUrl);
        const arrayBuffer = await outputResponse.arrayBuffer();
        outputBuffer = Buffer.from(arrayBuffer);
        
      } else if (output instanceof ReadableStream) {
        // Handle ReadableStream
        const reader = output.getReader();
        const chunks: Uint8Array[] = [];
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }
        outputBuffer = Buffer.from(combined);
        
      } else if (Array.isArray(output) && output.length > 0) {
        // Handle array of URLs
        const generatedImageUrl = output[0] as string;
        const outputResponse = await fetch(generatedImageUrl);
        const arrayBuffer = await outputResponse.arrayBuffer();
        outputBuffer = Buffer.from(arrayBuffer);
        
      } else if (typeof output === 'string') {
        // Handle single URL string
        const outputResponse = await fetch(output);
        const arrayBuffer = await outputResponse.arrayBuffer();
        outputBuffer = Buffer.from(arrayBuffer);
        
      } else {
        console.error('Unexpected output format:', output);
        throw new Error('Invalid output format from Replicate API');
      }
    } catch (outputError) {
      console.error('Output processing error:', outputError);
      return res.status(500).json({ 
        error: 'Processing error',
        message: 'Failed to process generated image'
      });
    }

    // Upload output image to Supabase
    const outputFileName = `${generateUUID()}.png`;
    const { error: outputError } = await supabase.storage
      .from('output-images')
      .upload(outputFileName, outputBuffer, {
        contentType: 'image/png',
      });

    if (outputError) {
      console.error('Output upload error:', outputError);
      return res.status(500).json({ 
        error: 'Storage error',
        message: 'Failed to upload output image: ' + outputError.message 
      });
    }

    // Get the public URL of the output image
    const { data: outputUrl } = supabase.storage
      .from('output-images')
      .getPublicUrl(outputFileName);

    console.log('Output image uploaded successfully');

    // Save project to database with user_id
    try {
      await supabase
        .from('projects')
        .insert({
          id: generateUUID(),
          user_id: userId,
          input_image_url: inputUrl.publicUrl,
          output_image_url: outputUrl.publicUrl,
          prompt: prompt.trim(),
          status: 'completed',
          created_at: new Date().toISOString(),
        });
    } catch (dbError) {
      console.warn('Database save failed (non-critical):', dbError);
    }

    // Return success response
    return res.status(200).json({ 
      success: true,
      outputUrl: outputUrl.publicUrl,
      inputUrl: inputUrl.publicUrl,
      prompt: prompt.trim()
    });
    
  } catch (error) {
    console.error('Unexpected error in generate route:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
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
