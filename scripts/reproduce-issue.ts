import { extractPdfText } from '../src/lib/extractPdfText';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
    console.log("--- Reproduction Test ---");
    // Minimal valid PDF base64 (empty PDF page)
    const minimalPdf = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmogICUgY29udGVudHMKPDwKICAvVHlwZSAvUGFnZXwKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqICAlIHBhZ2UgMQo8PAogIC9UeXBlIC9QYWdlCiAgL1BhcmVudCAyIDAgUgo+PgplbmRvYmoKCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDYwIDAwMDAwIG4gCjAwMDAwMDAxNTcgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDQKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMjEwCiUlRU9GCg==";

    try {
        console.log("Calling extractPdfText with minimal PDF...");
        const text = await extractPdfText(minimalPdf);
        console.log("Success! Extracted text:", text);
    } catch (error) {
        console.error("Test failed (Expected). Logs should be above.");
    }
}

test();
