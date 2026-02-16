"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { MotionButton } from "@/components/ui/motion";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="p-6 rounded-2xl bg-critical-light border border-critical-light text-center">
                    <AlertTriangle className="w-8 h-8 text-critical mx-auto mb-2" />
                    <h3 className="text-critical-dark font-bold mb-1">Something went wrong</h3>
                    <p className="text-critical text-sm mb-4">We couldn&apos;t load this section.</p>
                    <MotionButton
                        onClick={() => this.setState({ hasError: false })}
                        className="text-xs bg-white border border-critical/20 text-critical px-3 py-1.5 rounded-lg font-bold hover:bg-critical-light transition-colors"
                    >
                        Try Again
                    </MotionButton>
                </div>
            );
        }

        return this.props.children;
    }
}
