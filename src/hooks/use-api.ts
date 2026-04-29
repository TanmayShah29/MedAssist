'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ApiError } from '@/lib/api-client';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: ApiError | null;
}

interface UseApiOptions {
    immediate?: boolean;
    retries?: number;
}

export function useApi<T>(
    fetchFn: () => Promise<T>,
    options: UseApiOptions = {}
) {
    const { immediate = true, retries = 3 } = options;
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: immediate,
        error: null,
    });
    const fetchRef = useRef(fetchFn);

    useEffect(() => {
        fetchRef.current = fetchFn;
    }, [fetchFn]);

    const execute = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        let lastError: Error | null = null;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const data = await fetchRef.current();
                setState({ data, loading: false, error: null });
                return data;
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
                }
            }
        }
        const apiError = lastError instanceof ApiError
            ? lastError
            : new ApiError(lastError?.message || 'Request failed', 0);
        setState({ data: null, loading: false, error: apiError });
        throw apiError;
    }, [retries]);

    useEffect(() => {
        if (immediate) {
            const timer = setTimeout(execute, 0);
            return () => clearTimeout(timer);
        }
    }, [immediate, execute]);

    return {
        ...state,
        execute,
        refetch: execute,
    };
}

interface UseMutationState<T> {
    data: T | null;
    loading: boolean;
    error: ApiError | null;
}

export function useMutation<TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    _options?: Partial<UseApiOptions>
) {
    const [state, setState] = useState<UseMutationState<TData>>({
        data: null,
        loading: false,
        error: null,
    });

    const mutate = useCallback(async (variables: TVariables) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const data = await mutationFn(variables);
            setState({ data, loading: false, error: null });
            return data;
        } catch (error) {
            const apiError = error instanceof ApiError
                ? error
                : new ApiError('Unknown error', 0);
            setState({ data: null, loading: false, error: apiError });
            throw apiError;
        }
    }, [mutationFn]);

    return {
        ...state,
        mutate,
        reset: () => setState({ data: null, loading: false, error: null }),
    };
}

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
}