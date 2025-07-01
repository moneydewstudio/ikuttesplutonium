import { auth, db } from '../../../utils/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract the session cookie
    const sessionCookie = req.cookies.__session;
    if (!sessionCookie) {
      console.log('No __session cookie found in request');
      return res.status(401).json({ error: 'No session cookie found' });
    }

    try {
      // Verify the session cookie
      console.log('Verifying session cookie...');
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
      const uid = decodedClaims.uid;
      console.log('Session cookie verified for user:', uid);

      try {
        // Update user's onboarding status in Firestore
        console.log('Updating onboarding status in Firestore for user:', uid);
        await db.collection('users').doc(uid).set({
          onboardingCompleted: true,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log('Successfully updated onboarding status in Firestore');

        try {
          // Update user's custom claims
          console.log('Updating custom claims for user:', uid);
          const userRecord = await auth.getUser(uid);
          const customClaims = userRecord.customClaims || {};
          
          await auth.setCustomUserClaims(uid, {
            ...customClaims,
            onboardingCompleted: true
          });
          console.log('Successfully updated custom claims');
          
          // Set cookies for client and middleware
          res.setHeader('Set-Cookie', [
            `onboardingCompleted=true; Path=/; HttpOnly=false; SameSite=Strict`,
            `onboardingCompletedStorage=true; Path=/; HttpOnly=false; SameSite=Strict`
          ]);
          
          return res.status(200).json({ success: true });
        } catch (customClaimsError) {
          console.error('Error updating custom claims:', customClaimsError);
          // Even if custom claims fail, we've updated Firestore, so set the cookie and consider it a success
          res.setHeader('Set-Cookie', [
            `onboardingCompleted=true; Path=/; HttpOnly=false; SameSite=Strict`,
            `onboardingCompletedStorage=true; Path=/; HttpOnly=false; SameSite=Strict`
          ]);
          
          return res.status(200).json({ 
            success: true, 
            warning: 'Firestore updated but custom claims update failed',
            error: customClaimsError.message
          });
        }
      } catch (firestoreError) {
        console.error('Error updating Firestore:', firestoreError);
        return res.status(500).json({ error: 'Failed to update onboarding status in Firestore' });
      }
    } catch (verifyError) {
      console.error('Error verifying session cookie:', verifyError);
      return res.status(401).json({ error: 'Invalid session cookie' });
    }
  } catch (error) {
    console.error('Onboarding API error:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
}
