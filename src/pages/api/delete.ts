import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get project ID from query
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.substring(7);

    // Create Supabase client with user's token
    const supabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // Fetch the project to get image URLs and verify ownership
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    // Extract filenames from URLs
    const extractFilename = (url: string, bucket: string): string | null => {
      try {
        const bucketPath = `/storage/v1/object/public/${bucket}/`;
        const index = url.indexOf(bucketPath);
        if (index === -1) return null;
        return url.substring(index + bucketPath.length);
      } catch {
        return null;
      }
    };

    const inputFilename = extractFilename(project.input_image_url, 'input-images');
    const outputFilename = extractFilename(project.output_image_url, 'output-images');

    // Delete images from storage using admin client
    const deletePromises = [];

    if (inputFilename) {
      deletePromises.push(
        supabaseAdmin.storage.from('input-images').remove([inputFilename])
      );
    }

    if (outputFilename) {
      deletePromises.push(
        supabaseAdmin.storage.from('output-images').remove([outputFilename])
      );
    }

    await Promise.all(deletePromises);

    // Delete project from database (RLS will verify user_id)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      return res.status(500).json({ error: 'Failed to delete project' });
    }

    return res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
