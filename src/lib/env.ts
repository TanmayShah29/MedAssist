/**
 * Environment variable validation. Call at app/API entry points to fail fast
 * with a clear message if required vars are missing.
 *
 * REQUIRED — app will throw on startup if any of these are absent:
 *   NEXT_PUBLIC_SUPABASE_URL       — Supabase project URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  — Supabase public anon key
 *   SUPABASE_SERVICE_ROLE_KEY      — Service role key (bypasses RLS for saves)
 *   GROQ_API_KEY                   — Groq API key for Llama 3.3 AI analysis
 *
 * OPTIONAL — features degrade gracefully if absent:
 *   OCR_SPACE_API_KEY              — Fallback OCR for scanned/image-based PDFs.
 *                                    Without this, only digital PDFs are supported.
 */
const REQUIRED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GROQ_API_KEY',
] as const;

const OPTIONAL = [
  'OCR_SPACE_API_KEY',
] as const;

export function validateEnv(): void {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}.\n` +
      `Set them in Vercel Environment Variables or your .env.local file.\n` +
      `See .env.example for the full list.`
    );
  }

  // Warn about optional vars in development so they're caught early.
  if (process.env.NODE_ENV !== 'production') {
    const missingOptional = OPTIONAL.filter((k) => !process.env[k]);
    if (missingOptional.length > 0) {
      console.warn(
        `[env] Optional vars not set: ${missingOptional.join(', ')}. ` +
        `Scanned/image-based PDFs will not be supported without OCR_SPACE_API_KEY.`
      );
    }
  }
}
