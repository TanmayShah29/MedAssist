/**
 * Environment variable validation. Call at app/API entry points to fail fast
 * with a clear message if required vars are missing.
 */
const REQUIRED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'GROQ_API_KEY',
  // OCR_SPACE_API_KEY is optional — pdf-parse handles digital PDFs without it.
  // OCR.space is only used as a fallback for scanned PDFs.
] as const;

const OPTIONAL = [
  'OCR_SPACE_API_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

export function validateEnv(): void {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required env vars: ${missing.join(', ')}. Set them in Vercel Environment Variables or .env.local.`
    );
  }

  // Warn about optional vars in dev so devs notice early, without hard-failing.
  if (process.env.NODE_ENV !== 'production') {
    const missingOptional = OPTIONAL.filter((k) => !process.env[k]);
    if (missingOptional.length > 0) {
      console.warn(
        `[env] Optional vars not set: ${missingOptional.join(', ')}. Some features may be degraded.`
      );
    }
  }
}
