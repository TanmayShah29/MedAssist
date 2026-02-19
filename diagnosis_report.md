# Diagnosis Report

The diagnosis script confirmed the following:

1.  **API Key**: Valid and present.
2.  **Available Models**: The key *only* has access to `gemini-2.0` series and some experimental models.
    -   `gemini-2.0-flash`: **AVAILABLE**
    -   `gemini-1.5-flash`: **NOT FOUND**
    -   `gemini-1.5-pro`: **NOT FOUND**
    -   `gemini-pro-vision`: **NOT FOUND**

## Root Cause
The `extractPdfText` function was trying `gemini-2.0-flash` (which might have failed for another reason, or maybe it didn't fail and I misread the logs? Wait, let's check the logs again. The diagnosis showed `gemini-2.0-flash` is available. If the code tried it first, it should have worked *unless* there was a payload error.
However, the fallback logic explicitly tries `gemini-1.5-flash` which definitely fails.

Wait, I need to check the *reproduction logs* to see why `gemini-2.0-flash` failed if it was tried first.
The reproduction script `reproduce-issue.ts` output is not yet visible because I didn't check the status of that command (ID `d5aa978a-03ce-4c78-a02a-08e6cee3a0d8`).

I must check the output of `reproduce-issue.ts` before finalizing the plan.

## Next Steps
1. Check `reproduce-issue.ts` output.
2. Update `src/lib/extractPdfText.ts` to strictly use the available models.
3. Verify again.
