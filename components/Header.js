import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { auth } from "../utils/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";

export default function Header() {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { currentUser } = useAuth(); // Get user from context
  const router = useRouter();

  // Handle logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to login page after successful logout
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <header className="w-full sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="flex flex-col flex-wrap max-w-5xl p-2.5 mx-auto md:flex-row items-center">
        <div className="flex flex-row items-center justify-between p-2 md:p-1 w-full md:w-auto">
          <Link href="/" className="text-2xl font-bold text-gray-900 transition duration-300 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400">
            IKUTTES
          </Link>
          <button
            className="px-3 py-1 text-gray-700 outline-none dark:text-gray-300 md:hidden focus:outline-none"
            type="button"
            aria-label="Toggle Menu"
            onClick={() => setNavbarOpen(!navbarOpen)}
          >
            {/* Hamburger Icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
        <div
          className={
            `md:flex flex-grow items-center w-full md:w-auto ${
              navbarOpen ? " flex flex-col mt-4 md:mt-0" : " hidden"
            }`
          }
        >
          {/* Navigation Links */} 
          <nav className="flex flex-col items-center justify-center pt-1 pl-2 ml-1 space-y-4 md:space-y-0 md:space-x-8 md:flex-row md:mx-auto md:pl-14 text-base">
             {currentUser ? (
              <>
                <Link href="/dashboard" className="text-gray-700 transition duration-300 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Dashboard
                </Link>
                <Link href="/profil" className="text-gray-700 transition duration-300 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Profil
                </Link>
                <Link href="/leaderboard" className="text-gray-700 transition duration-300 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Papan Peringkat
                </Link>
              </>
            ) : (
               <Link href="/#features" className="text-gray-700 transition duration-300 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Fitur
               </Link>
             )}
          </nav>
          
          {/* Theme Toggle & Auth Buttons */}
          <div className="flex items-center mt-4 md:mt-0">
            <button
              aria-label="Toggle Dark Mode"
              type="button"
              className="w-10 h-10 p-2 mr-4 bg-gray-200 rounded-full dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {/* Dark Mode Icon */}
              {mounted && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-800 dark:text-gray-200"
                >
                  {theme === "dark" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  ) : (
                     <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
                    />
                  )}
                </svg>
              )}
            </button>

            {/* Auth Buttons */} 
            {currentUser ? (
              <button 
                onClick={handleLogout} // Call handleLogout function
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" legacyBehavior className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md dark:text-gray-300 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Masuk
                </Link>
                <Link href="/register" legacyBehavior className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
