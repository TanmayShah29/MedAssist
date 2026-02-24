/**
 * Environment variable validation. Call at app/API entry points to fail fast
 * with a clear message if required vars are missing.
 */
const REQUIRED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'GROQ_API_KEY',
  'OCR_SPACE_API_KEY',
] as const;

export function validateEnv(): void {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Missing env: ${missing.join(', ')}. Set them in Vercel Environment Variables or .env.local.`
    );
  }
}
