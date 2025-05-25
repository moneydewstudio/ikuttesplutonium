import React from 'react';
import Head from 'next/head';
import { HeroDemo } from '@/components/ui/hero-demo';

export default function AnimatedHeroDemo() {
  return (
    <>
      <Head>
        <title>Animated Hero Demo | Ikuttes</title>
        <meta name="description" content="Demo page for the animated hero component" />
      </Head>
      
      <main>
        <HeroDemo />
        
        <div className="container mx-auto py-8 px-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">About This Component</h2>
            <p className="mb-4">
              This animated hero component uses Framer Motion to create engaging text animations.
              It cycles through different adjectives with a spring animation effect, creating an
              eye-catching landing page element.
            </p>
            <h3 className="text-xl font-semibold mb-2">Features:</h3>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Animated text transitions with Framer Motion</li>
              <li>Responsive design for all screen sizes</li>
              <li>Customizable adjective list</li>
              <li>Call-to-action buttons with Lucide icons</li>
            </ul>
            <h3 className="text-xl font-semibold mb-2">Integration Notes:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Adjust the color scheme in the component to match your brand</li>
              <li>Modify the adjective list and timing in the component's state</li>
              <li>Update the paragraph text to match your product's value proposition</li>
              <li>Configure the button actions to link to relevant pages</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
