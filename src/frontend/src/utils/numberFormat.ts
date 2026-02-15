// Parse user input to number, handling empty/invalid input
export function parseNumber(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

// Format number to exactly 3 decimal places
export function formatNumber(value: number): string {
  return value.toFixed(3);
}

// Check if a string is a valid intermediate decimal input (allows typing)
export function isValidIntermediateInput(value: string): boolean {
  // Allow empty, single dot, numbers with trailing dot, etc.
  if (value === '' || value === '.' || value === '-' || value === '-.') {
    return true;
  }
  // Allow valid number patterns including incomplete decimals
  return /^-?\d*\.?\d*$/.test(value);
}

// Normalize and round input to 3 decimals on commit
// Handles empty strings, whole numbers, and decimal inputs
export function normalizeToThreeDecimals(value: string): number {
  // Handle empty string as 0
  if (value === '' || value === '.' || value === '-' || value === '-.') {
    return 0;
  }
  
  const parsed = parseFloat(value);
  if (isNaN(parsed) || !isFinite(parsed)) {
    return 0;
  }
  
  // Round to 3 decimal places
  // This ensures "56" becomes 56.000, "56.1" becomes 56.100, etc.
  return Math.round(parsed * 1000) / 1000;
}
