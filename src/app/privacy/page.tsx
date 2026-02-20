export default function PrivacyPage() {
    return (
        <div style={{
            maxWidth: 680,
            margin: '0 auto',
            padding: '48px 24px',
            background: '#FAFAF7',
            minHeight: '100vh'
        }}>
            <h1 style={{
                fontFamily: 'Instrument Serif',
                fontSize: 36,
                color: '#1C1917',
                margin: '0 0 8px 0'
            }}>
                Privacy Policy
            </h1>
            <p style={{ color: '#A8A29E', fontSize: 13, margin: '0 0 40px 0' }}>
                Last updated: February 2026
            </p>

            {[
                {
                    title: 'Data we collect',
                    content: 'Email address (required for account), first name, last name, age, sex, blood type (provided during onboarding), symptoms you report, biomarker values extracted from your lab reports, and your chat messages with the AI assistant.'
                },
                {
                    title: 'Data we do NOT collect',
                    content: 'We do not store your original PDF files. We do not collect payment information. We do not collect device information or browsing history. We do not sell your data to anyone.'
                },
                {
                    title: 'How your data is stored',
                    content: 'Your data is stored in Supabase (PostgreSQL database) hosted on servers in the United States. All data is encrypted in transit (HTTPS) and at rest. Row-level security ensures only you can access your records.'
                },
                {
                    title: 'Third party services',
                    content: 'We use OCR.space to extract text from your PDF (the PDF content is sent to their servers for processing). We use Groq AI to interpret biomarker values (extracted text is sent to their servers). We use Vercel to host the application. None of these services receive your personal information beyond what is necessary to process your request.'
                },
                {
                    title: 'Your rights',
                    content: 'You can export all your health data as a CSV from Settings at any time. You can delete your account and all data permanently from Settings. You can update your profile information from the Profile page at any time.'
                },
                {
                    title: 'Contact',
                    content: 'For any privacy concerns, contact us directly. We are a small team and will respond personally.'
                }
            ].map(section => (
                <div key={section.title} style={{ marginBottom: 32 }}>
                    <h2 style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: '#1C1917',
                        margin: '0 0 8px 0'
                    }}>
                        {section.title}
                    </h2>
                    <p style={{
                        fontSize: 15,
                        color: '#57534E',
                        lineHeight: 1.7,
                        margin: 0
                    }}>
                        {section.content}
                    </p>
                </div>
            ))}
        </div>
    )
}
