import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Login & Sign Up | MedAssist',
    description: 'Access your MedAssist account and prepare for your next doctor visit.',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return children
}
