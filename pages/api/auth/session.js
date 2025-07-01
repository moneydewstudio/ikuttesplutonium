import { auth } from '../../../utils/firebase-admin';

// Session cookie expiration (14 days)
const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 14;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { idToken, action } = req.body;

  try {
    // Handle logout
    if (action === 'logout') {
      res.setHeader(
        'Set-Cookie',
        `__session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
      );
      return res.status(200).json({ success: true });
    }

    // Handle login
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }

    // Create a session cookie from the Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Check if we need to add custom claims for onboarding status
    const userRecord = await auth.getUser(decodedToken.uid);
    const customClaims = userRecord.customClaims || {};
    
    // If there's an onboardingCompleted value in the request, update it
    if (req.body.hasOwnProperty('onboardingCompleted')) {
      await auth.setCustomUserClaims(decodedToken.uid, {
        ...customClaims,
        onboardingCompleted: !!req.body.onboardingCompleted
      });
    }
    
    // Create session cookie
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRATION_SECONDS * 1000 // milliseconds
    });

    // Set the HTTP-only session cookie for authentication
    const cookies = [
      `__session=${sessionCookie}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_EXPIRATION_SECONDS}`,
      // Also set a client-readable cookie for middleware
      `auth=true; Path=/; HttpOnly=false; SameSite=Strict; Max-Age=${SESSION_EXPIRATION_SECONDS}`
    ];
    
    // If we have onboarding information from Firestore, set that cookie too
    const hasCompletedOnboarding = customClaims.onboardingCompleted === true;
    if (hasCompletedOnboarding) {
      cookies.push(
        `onboardingCompleted=true; Path=/; HttpOnly=false; SameSite=Strict; Max-Age=${SESSION_EXPIRATION_SECONDS}`,
        `onboardingCompletedStorage=true; Path=/; HttpOnly=false; SameSite=Strict; Max-Age=${SESSION_EXPIRATION_SECONDS}`
      );
    }
    
    // Set all cookies
    res.setHeader('Set-Cookie', cookies);
    
    // Include onboarding status in response
    return res.status(200).json({ 
      success: true,
      onboardingCompleted: hasCompletedOnboarding
    });
  } catch (error) {
    console.error('Session API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
