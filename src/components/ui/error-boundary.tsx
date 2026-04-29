"use client"

import * as React from "react"
import { logger } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

function generateErrorId(): string {
    return `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

interface ErrorBoundaryProps {
    children: React.ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
    errorId?: string
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error, errorId: generateErrorId() }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        logger.error("ErrorBoundary caught an error", { error, errorInfo })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 text-center">
                    <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            We encountered an unexpected error. Our team has been notified.
                        </p>
                        {this.state.errorId && (
                            <p className="text-xs text-muted-foreground font-mono bg-gray-100 px-2 py-1 rounded">
                                Reference: {this.state.errorId}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            Reload Page
                        </Button>
                        <Button onClick={() => this.setState({ hasError: false })}>
                            Try Again
                        </Button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
