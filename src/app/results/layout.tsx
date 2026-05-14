import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Results | MedAssist',
    description: 'Review lab details, trends, and doctor-ready appointment questions.',
}

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
    return children
}
