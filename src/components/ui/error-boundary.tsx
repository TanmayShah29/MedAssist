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
                <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 px-4 text-center">
                    <div className="rounded-full bg-red-50 p-3 ring-1 ring-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-display text-2xl text-[#1C1917]">Something went wrong</h2>
                        <p className="mx-auto max-w-sm text-sm leading-relaxed text-[#57534E]">
                            We encountered an unexpected error. Our team has been notified.
                        </p>
                        {this.state.errorId && (
                            <p className="inline-flex rounded-[8px] border border-[#E8E6DF] bg-[#F5F4EF] px-2 py-1 font-mono text-xs text-[#A8A29E]">
                                Reference: {this.state.errorId}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
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
