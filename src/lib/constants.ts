/**
 * Shared constants used across frontend and backend.
 * Centralised here to prevent drift between client validation and server enforcement.
 */

/** Maximum file size for uploaded lab report PDFs (bytes). */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/** Maximum number of report uploads per user per hour. */
export const MAX_UPLOADS_PER_HOUR = 5;

/** Maximum number of symptoms a user can submit in a single AI request. */
export const MAX_SYMPTOMS_PER_REQUEST = 20;

/** Maximum number of AI chat messages per user per minute. */
export const MAX_MESSAGES_PER_MINUTE = 10;

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

export const SYMPTOM_OPTIONS = [
    { label: "Fatigue", category: "energy" },
    { label: "Headache", category: "neurological" },
    { label: "Shortness of breath", category: "respiratory" },
    { label: "Chest pain", category: "cardiovascular" },
    { label: "Dizziness", category: "neurological" },
    { label: "Nausea", category: "digestive" },
    { label: "Joint pain", category: "musculoskeletal" },
    { label: "Muscle weakness", category: "musculoskeletal" },
    { label: "Brain fog", category: "neurological" },
    { label: "Insomnia", category: "sleep" },
    { label: "Weight changes", category: "metabolic" },
    { label: "Fever", category: "systemic" },
    { label: "Palpitations", category: "cardiovascular" },
    { label: "Swelling", category: "circulatory" },
    { label: "Vision changes", category: "sensory" },
    { label: "Appetite loss", category: "digestive" },
    { label: "Hair loss", category: "systemic" },
    { label: "Frequent urination", category: "urinary" },
    { label: "Cold intolerance", category: "metabolic" },
    { label: "Dry skin", category: "dermatological" },
];
