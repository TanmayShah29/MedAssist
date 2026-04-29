export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    details?: unknown;
}

export interface ApiError {
    success: false;
    error: string;
    code?: string;
    details?: unknown;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

export interface RateLimitInfo {
    remaining: number;
    resetAt: Date;
    retryAfter?: number;
}

export interface UploadProgress {
    stage: 'uploading' | 'processing' | 'analyzing' | 'saving' | 'complete';
    progress: number;
    message: string;
}

export interface BiomarkerTrendsResponse {
    trends: Array<{
        date: string;
        value: number;
        unit: string;
    }>;
}

export interface AnalysisResponse {
    analysis: string;
    extractedText?: string;
}

export interface SupplementsResponse {
    supplements: Array<{
        id: number;
        name: string;
        start_date: string;
    }>;
}