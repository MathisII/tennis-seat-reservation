import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import Replicate from 'replicate';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const image = data.get('image') as File;
    const prompt = data.get('prompt') as string;

    if (!image || !prompt) {
      return NextResponse.json(
        { error: 'Image and prompt are required' },
        { status: 400 }
      );
    }

    // Upload input image to Supabase
    const inputBuffer = Buffer.from(await image.arrayBuffer());
    const inputFileName = `${Date.now()}-${image.name}`;
    const { data: inputUpload, error: inputError } = await supabaseAdmin.storage
      .from(process.env.NEXT_PUBLIC_INPUT_BUCKET!)
      .upload(inputFileName, inputBuffer);

    if (inputError) {
      throw new Error('Error uploading input image: ' + inputError.message);
    }

    // Get the public URL of the uploaded image
    const { data: inputUrl } = supabaseAdmin.storage
      .from(process.env.NEXT_PUBLIC_INPUT_BUCKET!)
      .getPublicUrl(inputFileName);

    // Initialize Replicate
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!,
    });

    // Call Replicate API
    const output = await replicate.run('google/nano-banana', {
      input: {
        image: inputUrl.publicUrl,
        prompt: prompt,
      },
    });

    if (!output || typeof output !== 'string') {
      throw new Error('Invalid output from Replicate');
    }

    // Download the generated image
    const outputResponse = await fetch(output);
    const outputBuffer = Buffer.from(await outputResponse.arrayBuffer());

    // Upload output image to Supabase
    const outputFileName = `${Date.now()}-output.png`;
    const { data: outputUpload, error: outputError } = await supabaseAdmin.storage
      .from(process.env.NEXT_PUBLIC_OUTPUT_BUCKET!)
      .upload(outputFileName, outputBuffer);

    if (outputError) {
      throw new Error('Error uploading output image: ' + outputError.message);
    }

    // Get the public URL of the output image
    const { data: outputUrl } = supabaseAdmin.storage
      .from(process.env.NEXT_PUBLIC_OUTPUT_BUCKET!)
      .getPublicUrl(outputFileName);

    // Save project to database
    const { error: dbError } = await supabaseAdmin
      .from('projects')
      .insert({
        input_image_url: inputUrl.publicUrl,
        output_image_url: outputUrl.publicUrl,
        prompt,
        status: 'completed',
      });

    if (dbError) {
      throw new Error('Error saving to database: ' + dbError.message);
    }

    return NextResponse.json({ outputUrl: outputUrl.publicUrl });
  } catch (error) {
    console.error('Error in generate route:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}