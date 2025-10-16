import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import ImageEditor from '../components/ImageEditor';

interface Project {
  id: string;
  input_image_url: string;
  output_image_url: string | null;
  prompt: string;
  status: string;
  payment_status: string;
  created_at: string;
}

const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Check for successful payment
  useEffect(() => {
    const sessionId = router.query.session_id as string;
    if (sessionId) {
      // Payment successful, refresh projects
      fetchProjects();
      // Remove session_id from URL
      router.replace('/dashboard', undefined, { shallow: true });
    }
  }, [router.query.session_id]);

  // Protect the page
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch user's projects
  const fetchProjects = useCallback(async () => {
    if (!user) return;

    try {
      // Get the user's session token
      const { data: { session } } = await (await import('../lib/supabase')).supabase.auth.getSession();
      
      if (!session) return;

      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  // Delete project
  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    setDeletingId(projectId);

    try {
      // Get the user's session token
      const { data: { session } } = await (await import('../lib/supabase')).supabase.auth.getSession();
      
      if (!session) {
        alert('You must be logged in to delete projects');
        return;
      }

      const response = await fetch(`/api/delete?id=${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to delete project'}`);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle payment for a project
  const handlePayment = async (projectId: string) => {
    try {
      const { data: { session } } = await (await import('../lib/supabase')).supabase.auth.getSession();
      
      if (!session) {
        alert('You must be logged in');
        return;
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to create checkout session'}`);
        return;
      }

      const { url } = await response.json();
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to create checkout session');
    }
  };

  // Trigger generation after payment
  const handleGenerate = async (projectId: string) => {
    setProcessingId(projectId);

    try {
      const { data: { session } } = await (await import('../lib/supabase')).supabase.auth.getSession();
      
      if (!session) {
        alert('You must be logged in');
        return;
      }

      const response = await fetch('/api/process-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to generate image'}`);
        setProcessingId(null);
        return;
      }

      // Refresh projects to show generated image
      await fetchProjects();
      setProcessingId(null);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image');
      setProcessingId(null);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard - Tennis Club</title>
        <meta name="description" content="Manage your AI-generated images" />
      </Head>

      <div className="min-h-screen py-8 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-white to-indigo-100 bg-clip-text text-transparent">
              Welcome Back!
            </h1>
            <p className="text-lg sm:text-xl text-white/90">
              Create and manage your AI-transformed images
            </p>
          </div>

          {/* Image Editor Section */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-white/30 mb-8 sm:mb-12">
            <ImageEditor />
          </div>

          {/* My Projects Section */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-white/30">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              My Projects
            </h2>

            {loadingProjects ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-600">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-xl text-gray-600 mb-2">No projects yet</p>
                <p className="text-gray-500">Create your first AI-transformed image above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl border-2 border-indigo-100 p-4 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                  >
                    {/* Images Comparison */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Original</p>
                        <img
                          src={project.input_image_url}
                          alt="Original"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Generated</p>
                        {project.output_image_url ? (
                          <img
                            src={project.output_image_url}
                            alt="Generated"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-400">En attente</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Prompt */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Prompt</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{project.prompt}</p>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-3">
                      {project.payment_status === 'pending' && (
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          ⏳ Paiement requis
                        </span>
                      )}
                      {project.payment_status === 'paid' && !project.output_image_url && (
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          {processingId === project.id ? '🔄 Génération...' : '✓ Payé - Prêt'}
                        </span>
                      )}
                      {project.output_image_url && (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          ✓ Complété
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <p className="text-xs text-gray-400 mb-3">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {project.payment_status === 'pending' && (
                        <button
                          onClick={() => handlePayment(project.id)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                        >
                          Payer 2€
                        </button>
                      )}
                      {project.payment_status === 'paid' && !project.output_image_url && (
                        <button
                          onClick={() => handleGenerate(project.id)}
                          disabled={processingId === project.id}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          {processingId === project.id ? 'Génération...' : 'Générer'}
                        </button>
                      )}
                      {project.output_image_url && (
                        <a
                          href={project.output_image_url}
                          download
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all text-center"
                        >
                          Download
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={deletingId === project.id}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
                      >
                        {deletingId === project.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
