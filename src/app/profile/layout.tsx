import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Profile | MedAssist',
    description: 'Manage your MedAssist profile and health data.',
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return children
}
