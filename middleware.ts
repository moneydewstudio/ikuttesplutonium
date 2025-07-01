import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/reset-password',
  '/api/auth/session',
  '/_next',
  '/favicon.ico',
];

// Define onboarding paths
const ONBOARDING_PATHS = [
  '/onboarding',
  '/api/auth/onboarding',
];

// Define paths that require onboarding to be completed
const PROTECTED_PATHS = [
  '/dashboard',
  '/profile',
  '/tryout',
  '/pendek',
  '/history'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
  
  // Check if the path is an onboarding path
  const isOnboardingPath = ONBOARDING_PATHS.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
  
  // Get the authentication cookie
  const authCookie = request.cookies.get('auth');
  const isAuthenticated = authCookie?.value === 'true';
  
  // Get the onboarding status from Firestore cookie
  // This cookie is set when the user profile is updated in Firestore
  const onboardingCookie = request.cookies.get('onboardingCompleted');
  // Also check the fallback localStorage cookie that might be set by client
  const onboardingStorageCookie = request.cookies.get('onboardingCompletedStorage');
  const hasCompletedOnboarding = onboardingCookie?.value === 'true' || onboardingStorageCookie?.value === 'true';
  
  // Enhanced debugging on cookie state
  console.log(`Middleware: Path=${pathname}, Auth=${isAuthenticated}, OnboardingCompleted=${hasCompletedOnboarding}`);
  
  // Logic for redirecting based on auth status and path
  if (!isAuthenticated && !isPublicPath) {
    console.log(`Middleware: Redirecting unauthenticated user to login from ${pathname}`);
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (isAuthenticated && !hasCompletedOnboarding && !isOnboardingPath && !isPublicPath) {
    console.log(`Middleware: User needs to complete onboarding, redirecting from ${pathname} to /onboarding`);
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }
  
  if (isAuthenticated && hasCompletedOnboarding && isOnboardingPath) {
    console.log(`Middleware: User already completed onboarding, redirecting from ${pathname} to /dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (isAuthenticated && pathname === '/login') {
    console.log(`Middleware: User already authenticated, redirecting from login to /dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Additional check for protected paths
  if (isAuthenticated && 
      PROTECTED_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`)) && 
      !hasCompletedOnboarding) {
    console.log(`Middleware: User needs to complete onboarding for protected path ${pathname}`);
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }
    
  // All checks passed, proceed with the request
  return NextResponse.next();
}

// Configure middleware to run only on matching paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
