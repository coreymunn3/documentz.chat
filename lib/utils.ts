import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formattedSourceText(input: string) {
  return input
    .replace(/\n+/g, "") // replaces multiple consec new lines with single space
    .replace(/(\w) - (\w)/g, "$1$2") // join hyphenated words
    .replace(/\s+/g, " "); // replace multiple consecutive spaces with single space
}
