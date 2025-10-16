import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard'];
  const protectedApiPaths = ['/api/generate', '/api/delete', '/api/projects'];

  const { pathname } = req.nextUrl;

  // Check if the current path is protected
  const isProtectedPage = protectedPaths.some((path) => pathname.startsWith(path));
  const isProtectedApi = protectedApiPaths.some((path) => pathname.startsWith(path));

  // Redirect to login if trying to access protected route without session
  if (isProtectedPage && !session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Return 401 for protected API routes without session
  if (isProtectedApi && !session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return res;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/generate',
    '/api/delete',
    '/api/projects',
  ],
};
