import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Prep Assistant | MedAssist',
    description: 'Ask follow-up questions and prepare for your next doctor visit.',
}

export default function AssistantLayout({ children }: { children: React.ReactNode }) {
    return children
}
