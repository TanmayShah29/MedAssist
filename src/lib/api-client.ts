import { toast } from 'sonner';

export class ApiError extends Error {
    constructor(
        public message: string,
        public status: number,
        public code?: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    showErrorToast?: boolean;
    showLoadingToast?: boolean;
}

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;

export async function apiClient<T>(
    url: string,
    options: RequestOptions = {}
): Promise<T> {
    const {
        method = 'GET',
        body,
        headers = {},
        timeout = DEFAULT_TIMEOUT,
        retries = DEFAULT_RETRIES,
        retryDelay = DEFAULT_RETRY_DELAY,
        showErrorToast = true,
        showLoadingToast = false,
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let lastError: Error | null = null;
    let loadingId: string | number | null = null;

    if (showLoadingToast) {
        loadingId = toast.loading('Loading...', { duration: Infinity });
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
                body: body ? JSON.stringify(body) : undefined,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const contentType = response.headers.get('content-type');
            let data: unknown;

            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorData = typeof data === 'object' ? data : { error: data };
                const errorMessage = (errorData as { error?: string })?.error || `Request failed with status ${response.status}`;
                const errorCode = (errorData as { code?: string })?.code;

                if (response.status === 401) {
                    window.location.href = '/auth?mode=login&reason=session_expired';
                    throw new ApiError('Session expired', 401, 'SESSION_EXPIRED');
                }

                if (response.status === 429) {
                    const retryAfter = response.headers.get('Retry-After');
                    throw new ApiError('Too many requests. Please wait.', 429, 'RATE_LIMIT', { retryAfter });
                }

                if (showErrorToast) {
                    toast.error(errorMessage);
                }

                throw new ApiError(errorMessage, response.status, errorCode, errorData);
            }

            if (loadingId) {
                toast.dismiss(loadingId);
            }

            return data as T;
        } catch (error) {
            lastError = error as Error;

            if (error instanceof ApiError) {
                if (loadingId) {
                    toast.dismiss(loadingId);
                }
                throw error;
            }

            if (error instanceof DOMException && error.name === 'AbortError') {
                if (loadingId) {
                    toast.dismiss(loadingId);
                }
                const timeoutError = new ApiError('Request timed out', 408, 'TIMEOUT');
                if (showErrorToast) {
                    toast.error('Request timed out. Please try again.');
                }
                throw timeoutError;
            }

            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
                continue;
            }

            if (loadingId) {
                toast.dismiss(loadingId);
            }

            if (showErrorToast) {
                toast.error(lastError?.message || 'An unexpected error occurred');
            }

            throw new ApiError(lastError?.message || 'Network error', 0, 'NETWORK_ERROR');
        }
    }

    throw lastError || new ApiError('Unknown error', 0);
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

export function getErrorMessage(error: unknown): string {
    if (isApiError(error)) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
}