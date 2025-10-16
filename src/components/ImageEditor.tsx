import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

type ImageEditorProps = {};

const ImageEditor: React.FC<ImageEditorProps> = () => {
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file');
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError('Image size must be less than 10MB');
                return;
            }

            setSelectedFile(file);
            setError(null);
            setSuccess(null);
            
            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            
            // Reset previous results
            setGeneratedImage(null);
        }
    }, []);

    const handleGenerate = async () => {
        // Check if user is authenticated
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        if (!selectedFile) {
            setError('Please select an image first');
            return;
        }

        if (!prompt.trim()) {
            setError('Please enter a transformation prompt');
            return;
        }

        if (prompt.trim().length < 3) {
            setError('Prompt must be at least 3 characters');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        setGeneratedImage(null);

        try {
            // Get the user's session token
            const { data: { session } } = await (await import('../lib/supabase')).supabase.auth.getSession();
            
            if (!session) {
                throw new Error('You must be logged in to generate images');
            }

            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('prompt', prompt);

            const response = await fetch('/api/create-project', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to create project');
            }

            setSuccess('Projet créé! Redirection vers le paiement...');
            
            // Redirect to checkout
            const checkoutResponse = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ projectId: data.projectId }),
            });

            const checkoutData = await checkoutResponse.json();

            if (!checkoutResponse.ok) {
                throw new Error(checkoutData.error || 'Failed to create checkout session');
            }

            // Redirect to Stripe Checkout
            window.location.href = checkoutData.url;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMsg);
            console.error('Generation error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setPrompt('');
        setGeneratedImage(null);
        setError(null);
        setSuccess(null);
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    🎨 AI Image Editor
                </h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Transform your images with Google's Nano Banana AI. Upload an image and describe the style or changes you want to apply.
                </p>
            </div>

            {/* Step 1: Upload Section */}
            <div className="bg-gradient-to-br from-white/90 to-white/70 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 border-2 border-indigo-100/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl">1️⃣</span>
                    <span>Upload Image</span>
                </h2>
                
                <div className="mb-5 sm:mb-6">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        id="file-input"
                        className="hidden"
                        disabled={loading}
                    />
                    <label 
                        htmlFor="file-input" 
                        className="inline-flex items-center justify-center gap-3 px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full cursor-pointer font-bold text-base sm:text-lg shadow-lg hover:-translate-y-1 hover:scale-105 hover:shadow-glow-lg transition-all duration-200 relative overflow-hidden group"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>
                        <span className="relative">
                            {selectedFile ? `✓ ${selectedFile.name}` : '+ Choose Image'}
                        </span>
                    </label>
                </div>

                {previewUrl && (
                    <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-indigo-100 shadow-md">
                        <h3 className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
                            <span className="text-base sm:text-lg">📸</span>
                            Original Image
                        </h3>
                        <div className="rounded-lg overflow-hidden shadow-lg">
                            <img 
                                src={previewUrl} 
                                alt="Preview" 
                                className="w-full max-w-2xl mx-auto h-auto block bg-gray-100 hover:scale-[1.02] transition-transform duration-300"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Step 2: Prompt Section */}
            {selectedFile && (
                <div className="bg-gradient-to-br from-white/90 to-white/70 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 border-2 border-indigo-100/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl">2️⃣</span>
                        <span>Describe Transformation</span>
                    </h2>
                    
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="E.g., 'Make it in the style of Van Gogh', 'Convert to anime style', 'Make it photorealistic', 'Add dramatic lighting', 'Make it look like a vintage photograph'"
                        rows={4}
                        className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-indigo-200/60 rounded-xl text-base sm:text-lg resize-vertical transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-200/40 focus:border-indigo-500 bg-white text-gray-900 leading-relaxed min-h-[120px]"
                        disabled={loading}
                    />

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-5 sm:mt-6">
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !selectedFile || !prompt.trim()}
                            className={`flex-1 px-6 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-lg transition-all duration-200 relative overflow-hidden group ${
                                loading || !selectedFile || !prompt.trim()
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:-translate-y-1 hover:scale-105 hover:shadow-glow-lg'
                            }`}
                        >
                            {!(loading || !selectedFile || !prompt.trim()) && (
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>
                            )}
                            <span className="relative">
                                {loading ? '⏳ Generating...' : '✨ Generate Image'}
                            </span>
                        </button>

                        <button
                            onClick={handleReset}
                            disabled={loading}
                            className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-full text-base sm:text-lg font-semibold hover:border-gray-400 hover:text-gray-900 hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Start Over
                        </button>
                    </div>

                    {error && (
                        <div className="mt-5 sm:mt-6 p-4 sm:p-5 bg-gradient-to-r from-red-50 to-red-50/60 border-2 border-red-200 rounded-xl flex items-center gap-3 animate-shake">
                            <span className="text-xl sm:text-2xl flex-shrink-0">⚠️</span>
                            <p className="text-sm sm:text-base text-red-700 font-medium">{error}</p>
                        </div>
                    )}
                    
                    {success && (
                        <div className="mt-5 sm:mt-6 p-4 sm:p-5 bg-gradient-to-r from-emerald-50 to-emerald-50/60 border-2 border-emerald-200 rounded-xl flex items-center gap-3 animate-bounce-in">
                            <span className="text-xl sm:text-2xl font-bold text-emerald-600 flex-shrink-0">✓</span>
                            <p className="text-sm sm:text-base text-emerald-700 font-medium">{success}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 rounded-2xl p-10 sm:p-16 text-center border-2 border-dashed border-indigo-200/60 mb-6 sm:mb-8">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-5 sm:mb-6 border-4 border-indigo-200 border-t-indigo-600 border-r-purple-600 rounded-full animate-spin"></div>
                    <p className="text-base sm:text-lg text-gray-700 font-medium animate-pulse">
                        Transforming your image with AI... This may take 20-30 seconds.
                    </p>
                </div>
            )}

            {/* Step 3: Result Section */}
            {generatedImage && (
                <div className="bg-gradient-to-br from-white/90 to-white/70 rounded-2xl p-6 sm:p-8 border-2 border-indigo-100/60 shadow-lg hover:shadow-xl transition-all duration-300">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl">3️⃣</span>
                        <span>Your Result</span>
                    </h2>
                    
                    <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-indigo-100 shadow-md mb-5 sm:mb-6">
                        <div className="rounded-lg overflow-hidden shadow-lg">
                            <img 
                                src={generatedImage} 
                                alt="Generated" 
                                className="w-full max-w-2xl mx-auto h-auto block hover:scale-[1.02] transition-transform duration-300"
                            />
                        </div>
                    </div>
                    
                    <a
                        href={generatedImage}
                        download="generated-image.png"
                        className="inline-flex items-center justify-center gap-3 px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full font-bold text-base sm:text-lg shadow-lg hover:-translate-y-1 hover:scale-105 hover:shadow-glow-lg transition-all duration-200 relative overflow-hidden group"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>
                        <span className="relative">⬇️ Download Image</span>
                    </a>
                </div>
            )}

            {/* Auth Modal */}
            <AuthModal 
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                message="Sign in to transform images with AI"
            />
        </div>
    );
};

export default ImageEditor;
