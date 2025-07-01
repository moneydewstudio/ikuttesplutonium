import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges and conditionally applies Tailwind CSS classes
 * Combines clsx and tailwind-merge for efficient class handling
 * 
 * @param {...string} inputs - CSS classes to be conditionally applied
 * @returns {string} - Merged and deduplicated class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
