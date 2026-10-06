import { cn as mergeClasses } from "cn";

/** Combines conditional class names and resolves conflicting Tailwind utilities. */
export function cn(...inputs: Parameters<typeof mergeClasses>) {
  return mergeClasses(...inputs);
}
