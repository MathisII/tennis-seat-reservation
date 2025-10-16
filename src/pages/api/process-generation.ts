import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import Replicate from 'replicate';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const authSupabase = createPagesServerClient({ req, res });
    const {
      data: { session },
    } = await authSupabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID requis' });
    }

    // Get project and verify ownership + payment
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    // CRITICAL: Verify payment status
    if (project.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Paiement requis pour générer l\'image' });
    }

    // Check if already generated
    if (project.output_image_url) {
      return res.status(400).json({ error: 'Image déjà générée pour ce projet' });
    }

    // Update status to processing
    await supabase
      .from('projects')
      .update({ status: 'processing' })
      .eq('id', projectId);

    // Call Replicate API for image editing
    console.log('Starting image generation with Replicate...');
    
    let output: any;
    try {
      const input = {
        prompt: project.prompt,
        image_input: [project.input_image_url],
        aspect_ratio: "match_input_image",
        output_format: "jpg"
      };
      
      output = await replicate.run("google/nano-banana", { input });
    } catch (replicateError) {
      console.error('Replicate API error:', replicateError);
      await supabase
        .from('projects')
        .update({ status: 'failed' })
        .eq('id', projectId);
      
      return res.status(500).json({ 
        error: 'Generation error',
        message: replicateError instanceof Error ? replicateError.message : 'Failed to generate image'
      });
    }

    // Handle Replicate output
    let outputBuffer: Buffer;
    
    try {
      if (output && typeof output.url === 'function') {
        const generatedImageUrl = output.url();
        console.log('Generated image URL:', generatedImageUrl);
        const outputResponse = await fetch(generatedImageUrl);
        const arrayBuffer = await outputResponse.arrayBuffer();
        outputBuffer = Buffer.from(arrayBuffer);
      } else if (Array.isArray(output) && output.length > 0) {
        const generatedImageUrl = output[0] as string;
        const outputResponse = await fetch(generatedImageUrl);
        const arrayBuffer = await outputResponse.arrayBuffer();
        outputBuffer = Buffer.from(arrayBuffer);
      } else if (typeof output === 'string') {
        const outputResponse = await fetch(output);
        const arrayBuffer = await outputResponse.arrayBuffer();
        outputBuffer = Buffer.from(arrayBuffer);
      } else {
        throw new Error('Invalid output format from Replicate API');
      }
    } catch (outputError) {
      console.error('Output processing error:', outputError);
      await supabase
        .from('projects')
        .update({ status: 'failed' })
        .eq('id', projectId);
      
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
      await supabase
        .from('projects')
        .update({ status: 'failed' })
        .eq('id', projectId);
      
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

    // Update project with output image
    await supabase
      .from('projects')
      .update({
        output_image_url: outputUrl.publicUrl,
        status: 'completed',
      })
      .eq('id', projectId);

    return res.status(200).json({ 
      success: true,
      outputUrl: outputUrl.publicUrl,
    });
    
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: error.message });
  }
}
