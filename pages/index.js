import Head from "next/head";
import Link from "next/link";
import { NextSeo } from "next-seo";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Features from "../components/Features";
import Pricing from "../components/Pricing";

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
          images: [
            {
              url: "/public/ikuttes.jpeg", // Replace with your actual image URL
            },
          ],
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
      <section className="relative">
        <div className="px-4 pt-10 mx-auto max-w-7xl md:pt-16">
          <div className="w-full pb-5 mx-auto text-center md:w-11/12">
            <h1 className="mb-3 text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-6xl">
              Ace Your CPNS Exam with
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r dark:bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 dark:from-pink-500 dark:via-purple-400 dark:to-indigo-500">
                Ikuttes
              </span>
            </h1>
            <p className="max-w-xl pt-5 mx-auto text-lg text-gray-600 dark:text-gray-400 md:text-lg">
              Your comprehensive platform for CPNS exam preparation. Practice with realistic simulations, short quizzes, and insightful personality tests.
            </p>
            <div className="mt-6 text-center md:ml-6">
              <a
                className="inline-flex items-center px-5 py-3 text-sm font-medium text-gray-300 transition duration-300 bg-black rounded hover:bg-gray-800 dark:hover:bg-gray-200 dark:text-gray-700 dark:bg-white"
                aria-label="learn more"
                rel="noreferrer"
                href="https://github.com/YOUR_GITHUB_USERNAME/ikuttes"
              >
                <span className="flex justify-center">GitHub Link</span>
              </a>
              <br className="sm:hidden" />
              {/* Removed Demo Link */}
            </div>
          </div>
          <div className="relative w-full py-10 mx-auto text-center md:py-32 md:my-12 md:w-10/12">
            <div className="relative z-10">
              <a
                target="_blank"
                rel="noreferrer"
                href="#"
              >
                <img
                  className="transition duration-700 shadow-xl rounded-xl ring-1 ring-black ring-opacity-5 hover:transform hover:scale-105"
                  src="/images/placeholder.webp"
                  alt="Ikuttes"
                />
              </a>
            </div>
            <p className="z-10 my-8 text-sm font-medium text-gray-500">
              Prepare for your future with Ikuttes.
            </p>
          </div>
        </div>
        {/* <div
          style={{ backgroundImage: "url(/images/blur.png)" }}
          className="absolute inset-0 w-full h-full bg-bottom bg-no-repeat bg-cover -z-1"
        /> */}
      </section>
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
}
