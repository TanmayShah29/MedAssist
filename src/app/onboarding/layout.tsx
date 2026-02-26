import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Onboarding | MedAssist',
    description: 'Answer a few questions to personalize your MedAssist experience.',
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return children
}
