import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Results | MedAssist',
    description: 'View your detailed lab reports and biomarker trends.',
}

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
    return children
}
