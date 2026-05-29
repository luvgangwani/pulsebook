/**
 * Utility functions for frontend development.
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names and merges Tailwind CSS classes efficiently.
 * Resolves conflicts where the last class takes precedence.
 * @param inputs - Array of class names, objects, or arrays.
 * @returns A single string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
