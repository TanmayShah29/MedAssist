"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
    onRetry?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ExtractionErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Extraction Error caught:", error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onRetry) {
            this.props.onRetry();
        }
        // We can also trigger a page reload or a specific callback
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            const isExtractionError = this.state.error?.name === "AIExtractionError";

            return (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-red-100 shadow-xl max-w-md mx-auto my-12">
                    <div className="p-4 bg-red-50 rounded-full">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-900">
                            {isExtractionError ? "Extraction Error" : "Something went wrong"}
                        </h2>
                        <p className="text-sm text-gray-600">
                            {this.state.error?.message || "We encountered an unexpected issue while analyzing your report."}
                        </p>
                    </div>

                    <Button
                        onClick={() => this.props.onRetry ? this.props.onRetry() : window.location.reload()}
                        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold flex items-center justify-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Try Again
                    </Button>

                    <p className="text-[10px] text-gray-400">
                        Internal Trace: {this.state.error?.name}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
