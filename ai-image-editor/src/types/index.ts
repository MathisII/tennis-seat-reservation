export interface Project {
  id: string;
  created_at: string;
  input_image_url: string;
  output_image_url: string;
  prompt: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface GenerateResponse {
  success: boolean;
  error?: string;
  outputUrl?: string;
}

export interface UploadResponse {
  path: string;
  url: string;
}