import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Pricing from "../components/Pricing";
import { Hero } from "../components/ui/animated-hero";
import { Feature } from "../components/ui/feature-section-with-grid";

export default function Home() {
  return (
    <div className="bg-white dark:bg-black">
      <NextSeo
        title="Ikuttes - CPNS Exam Preparation"
        description="Ikuttes is your partner for CPNS exam preparation. Practice with realistic simulations, quizzes, and tests to achieve your dream of becoming a civil servant in Indonesia."
        canonical="https://ikuttes.vercel.app/"
        openGraph={{
          url: "https://ikuttes.vercel.app/",
          title: "Ikuttes - CPNS Exam Preparation",
          description: "Ikuttes is your partner for CPNS exam preparation. Practice with realistic simulations, quizzes, and tests to achieve your dream of becoming a civil servant in Indonesia.",
          site_name: "Ikuttes",
        }}
        twitter={{
          handle: "@YOUR_TWITTER_HANDLE", // Replace with your Twitter handle
          site: "https://ikuttes.vercel.app/",
          cardType: "summary_large_image",
        }}
      />
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Hero />
      <div id="features-section">
        <Feature />
      </div>
      <Pricing />
      <Footer />
    </div>
  );
}
