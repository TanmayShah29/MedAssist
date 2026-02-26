import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Assistant | MedAssist',
    description: 'Ask questions about your lab results and get AI-powered insights.',
}

export default function AssistantLayout({ children }: { children: React.ReactNode }) {
    return children
}
