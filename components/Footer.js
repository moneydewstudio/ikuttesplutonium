import { useRouter } from "next/router";
import Link from "next/link";

export default function Footer() {
  const router = useRouter();
  return (
    <footer className="text-black dark:text-gray-300 body-font">
      <div className="container flex flex-col items-center px-10 pb-8 mx-auto border-t border-purple-600 dark:border-purple-300 sm:flex-row">
        <Link href="/" className="flex items-center justify-center mt-3 text-xl font-medium title-font md:ml-3 md:justify-start">
  Ikuttes
        </Link>
        <span className="inline-flex justify-center mt-4 sm:ml-auto sm:mt-3 sm:justify-start">
          <a
            aria-label="mail"
            href="mailto:your_email@example.com?subject=Ikuttes Feedback"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </a>
          {/* Add or remove social media links as needed */}
          {/* Example: */}
          {/* <a
            aria-label="twitter"
            className="ml-3"
            href="https://twitter.com/YOUR_TWITTER_HANDLE"
          >
            <svg
              fill="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
            </svg>
          </a> */}
        </span>
      </div>
    </footer>
  );
}
