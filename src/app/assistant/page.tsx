export default function AssistantPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-8 text-center">
            <div className="max-w-md space-y-4">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-blue-400">
                    AI Assistant Upgrade
                </h1>
                <p className="text-muted-foreground">
                    The Insight Engine is being upgraded with the new UI components.
                    Rate limiting logic remains active in the backend.
                </p>
            </div>
        </div>
    );
}
