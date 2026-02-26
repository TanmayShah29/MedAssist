import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Settings | MedAssist',
    description: 'Manage your account settings, data, and active subscriptions.',
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return children
}
