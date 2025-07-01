import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import WelcomeStep from './WelcomeStep';
import ProfileStep from './ProfileStep';
import GoalSettingStep from './GoalSettingStep';
import QuizPreferencesStep from './QuizPreferencesStep';
import CompletionStep from './CompletionStep';
import { updateUserProfile } from '../../utils/userProfile';

const OnboardingFlow = () => {
  const router = useRouter();
  const { currentUser, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState({
    displayName: currentUser?.displayName || '',
    education: {
      level: '',
      major: '',
      institution: '',
      graduationYear: '',
      gpa: ''
    },
    targetProvinces: [],
    targetExam: 'SKD', // Default to SKD
    targetScore: {
      twk: 85,
      tiu: 80,
      tkp: 155,
      total: 320
    },
    studyPreferences: {
      dailyGoal: 30, // Minutes per day
      focusAreas: []
    },
    onboardingCompleted: false
  });

  const steps = [
    { id: 'welcome', component: WelcomeStep },
    { id: 'profile', component: ProfileStep },
    { id: 'goals', component: GoalSettingStep },
    { id: 'preferences', component: QuizPreferencesStep },
    { id: 'completion', component: CompletionStep }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      // Scroll to top when moving to next step
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Scroll to top when moving to previous step
      window.scrollTo(0, 0);
    }
  };

  const handleUpdateProfile = (updates) => {
    setUserProfile({ ...userProfile, ...updates });
  };

  const handleComplete = async () => {
    // Create an explicitly marked complete profile with all collected data
    const completeProfile = {
      ...userProfile,
      onboardingCompleted: true,
      updatedAt: new Date()
    };
    
    console.log('Completing onboarding with profile:', completeProfile);
    
    try {
      // First directly update the state - this helps with immediate UI feedback
      setUserProfile(completeProfile);
      
      // Save to Firestore as before - this keeps our data layer consistent
      await updateUserProfile(currentUser.uid, completeProfile);
      
      // Now use the Auth Context to update the onboarding status in Firebase Auth custom claims
      // This is what the middleware will check - pass the complete profile
      const success = await completeOnboarding(completeProfile);
      
      if (success) {
        console.log('Successfully completed onboarding, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.error('Failed to update onboarding status in Auth');
        alert('Terjadi kendala saat menyelesaikan onboarding. Akan dicoba lagi.');
        
        // Still try to redirect to dashboard after a delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('Error during onboarding completion:', error);
      
      // In case of error, still try to save to localStorage directly
      try {
        const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
        userProfiles[currentUser.uid] = completeProfile;
        localStorage.setItem('userProfiles', JSON.stringify(userProfiles));
        
        // Show user a notification that data is saved locally
        alert('Profil Anda telah disimpan secara lokal. Akan disinkronkan ke server saat koneksi tersedia.');
        
        // Still try to redirect after error
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
        alert('Terjadi kesalahan saat menyimpan profil. Silakan coba lagi.');
      }
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`h-2 flex-1 rounded-full mx-1 ${
                index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="text-right text-sm text-gray-500 mt-2">
          Langkah {currentStep + 1} dari {steps.length}
        </div>
      </div>

      <CurrentStepComponent
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        onNext={handleNext}
        onBack={handleBack}
        onComplete={handleComplete}
        isLastStep={currentStep === steps.length - 1}
      />
    </div>
  );
};

export default OnboardingFlow;
