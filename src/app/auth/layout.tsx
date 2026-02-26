import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Login & Sign Up | MedAssist',
    description: 'Access your MedAssist account to understand your lab results.',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return children
}
