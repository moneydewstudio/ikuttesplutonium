import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Use dynamic imports with ssr: false to ensure client-side only rendering
const EPPSInstructions = dynamic(() => import('../components/epps/EPPSInstructions'), { ssr: false });
const EPPSQuestions = dynamic(() => import('../components/epps/EPPSQuestions'), { ssr: false });
const EPPSResults = dynamic(() => import('../components/epps/EPPSResults'), { ssr: false });
const EPPSDashboard = dynamic(() => import('../components/epps/EPPSDashboard'), { ssr: false });

// Sample data for preview
import questionsData from '../data/epps/questions.json';

export default function EPPSPreview() {
  const [activeComponent, setActiveComponent] = useState('instructions');
  
  // Sample data for the results preview
  const sampleResults = {
    testId: 'epps_preview',
    startTime: Date.now() - 3600000, // 1 hour ago
    endTime: Date.now(),
    answers: [],
    dimensionScores: {
      'Achievement': 12,
      'Deference': 5,
      'Order': 10,
      'Exhibition': 8,
      'Autonomy': 13,
      'Affiliation': 7,
      'Intraception': 9,
      'Succorance': 4,
      'Dominance': 11,
      'Abasement': 6,
      'Nurturance': 8,
      'Change': 14,
      'Endurance': 9,
      'Heterosexuality': 7,
      'Aggression': 6
    },
    interpretations: {
      'Achievement': 'high',
      'Deference': 'low',
      'Order': 'medium',
      'Exhibition': 'medium',
      'Autonomy': 'high',
      'Affiliation': 'medium',
      'Intraception': 'medium',
      'Succorance': 'low',
      'Dominance': 'high',
      'Abasement': 'medium',
      'Nurturance': 'medium',
      'Change': 'high',
      'Endurance': 'medium',
      'Heterosexuality': 'medium',
      'Aggression': 'medium'
    },
    batch: {
      current: 5,
      total: 5,
      questionsPerBatch: 45
    }
  };
  
  // Sample data for questions preview
  const sampleQuestions = questionsData.questions.slice(0, 5);
  const sampleAnswers = {
    1: 'A',
    2: 'B'
  };
  
  return (
    <>
      <Head>
        <title>EPPS Preview | Ikuttes</title>
        <meta name="description" content="Preview of EPPS components" />
      </Head>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-black">
          <h1 className="text-2xl font-bold mb-6">EPPS Component Preview</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveComponent('instructions')}
              className={`px-4 py-2 rounded-md ${
                activeComponent === 'instructions' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Instructions
            </button>
            
            <button
              onClick={() => setActiveComponent('questions')}
              className={`px-4 py-2 rounded-md ${
                activeComponent === 'questions' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Questions
            </button>
            
            <button
              onClick={() => setActiveComponent('results')}
              className={`px-4 py-2 rounded-md ${
                activeComponent === 'results' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Results
            </button>
            
            <button
              onClick={() => setActiveComponent('dashboard')}
              className={`px-4 py-2 rounded-md ${
                activeComponent === 'dashboard' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Dashboard
            </button>
          </div>
          
          <div className="mb-6">
            <Link href="/epps" className="text-blue-600 hover:text-blue-800 font-medium">
              Go to Full EPPS Test →
            </Link>
          </div>
        </div>
        
        {activeComponent === 'instructions' && (
          <EPPSInstructions onStart={() => setActiveComponent('questions')} />
        )}
        
        {activeComponent === 'questions' && (
          <EPPSQuestions 
            questions={sampleQuestions}
            answers={sampleAnswers}
            onAnswer={(id, label) => console.log(`Question ${id}: ${label}`)}
            currentQuestion={1}
          />
        )}
        
        {activeComponent === 'results' && (
          <EPPSResults results={sampleResults} />
        )}
        
        {activeComponent === 'dashboard' && (
          <EPPSDashboard />
        )}
      </div>
    </>
  );
}
