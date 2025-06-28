import { AuthTokens } from '../types';
import { getApiUrl } from './getApiUrl';
import axiosInstance from './axiosInstance';

export class ApiError extends Error {
    constructor(message: string, public status: number, public data?: any) {
        super(message);
        this.name = 'ApiError';
    }
}

interface ApiRequestOptions {
    method?: string;
    headers?: HeadersInit;
    body?: any;
    tokens?: AuthTokens | null;
}

export const apiRequest = async <T>(
    url: string,
    options: ApiRequestOptions = {},
): Promise<T> => {
    const { method = 'GET', headers = {}, body, tokens } = options;

    const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(headers as Record<string, string>),
    };

    if (tokens?.access) {
        requestHeaders['Authorization'] = `Bearer ${tokens.access}`;
    }

    let axiosConfig: any = {
        url: getApiUrl(url),
        method,
        headers: requestHeaders,
    };

    if (body && method !== 'GET') {
        axiosConfig.data =
            body instanceof FormData ? body : JSON.stringify(body);
        if (body instanceof FormData) {
            delete axiosConfig.headers['Content-Type'];
        }
    }

    try {
        const response = await axiosInstance(axiosConfig);
        return response.data as T;
    } catch (error: any) {
        if (error.response) {
            const errorMessage =
                error.response.data?.detail ||
                error.response.data?.message ||
                `HTTP ${error.response.status}: ${error.response.statusText}`;
            throw new ApiError(
                errorMessage,
                error.response.status,
                error.response.data,
            );
        }
        throw new ApiError(
            'Network error. Please check your connection and try again.',
            0,
            error,
        );
    }
};

// Specific API functions
export const authApi = {
    login: (credentials: { email: string; password: string }) =>
        apiRequest<{ access: string; refresh: string }>('/api/auth/login/', {
            method: 'POST',
            body: credentials,
        }),

    register: (userData: any) =>
        apiRequest<{ message: string; user_id: number }>(
            '/api/auth/register/',
            {
                method: 'POST',
                body: userData,
            },
        ),

    refreshToken: (refreshToken: string) =>
        apiRequest<{ access: string; refresh: string }>(
            '/api/auth/token/refresh/',
            {
                method: 'POST',
                body: { refresh: refreshToken },
            },
        ),

    getProfile: (tokens: AuthTokens) =>
        apiRequest<any>('/api/auth/profile/', { tokens }),
};

export const groupsApi = {
    list: (tokens?: AuthTokens | null) =>
        apiRequest<{ message: string; groups: any[] }>('/api/groups/', {
            tokens,
        }),

    create: (groupData: any, tokens: AuthTokens) =>
        apiRequest<{ message: string; group: any }>('/api/groups/', {
            method: 'POST',
            body: groupData,
            tokens,
        }),

    join: (groupId: number, tokens: AuthTokens) =>
        apiRequest<{ message: string }>(`/api/groups/${groupId}/join/`, {
            method: 'POST',
            tokens,
        }),

    leave: (groupId: number, tokens: AuthTokens) =>
        apiRequest<{ message: string }>(`/api/groups/${groupId}/leave/`, {
            method: 'POST',
            tokens,
        }),
};

export const postsApi = {
    list: (
        tokens?: AuthTokens | null,
        filters?: { group_id?: number; author_id?: number },
    ) => {
        const params = new URLSearchParams();
        if (filters?.group_id)
            params.append('group_id', filters.group_id.toString());
        if (filters?.author_id)
            params.append('author_id', filters.author_id.toString());

        const url = `/api/posts/${
            params.toString() ? `?${params.toString()}` : ''
        }`;
        return apiRequest<{ message: string; posts: any[] }>(url, { tokens });
    },

    create: (postData: any, tokens: AuthTokens) =>
        apiRequest<{ message: string; post: any }>('/api/posts/', {
            method: 'POST',
            body: postData,
            tokens,
        }),

    like: (postId: number, tokens: AuthTokens) =>
        apiRequest<{ message: string; liked: boolean; likes_count: number }>(
            `/api/posts/${postId}/like/`,
            {
                method: 'POST',
                tokens,
            },
        ),

    getComments: (postId: number, tokens?: AuthTokens | null) =>
        apiRequest<{ message: string; comments: any[] }>(
            `/api/posts/${postId}/comments/`,
            { tokens },
        ),

    addComment: (postId: number, commentData: any, tokens: AuthTokens) =>
        apiRequest<{ message: string; comment: any }>(
            `/api/posts/${postId}/add_comment/`,
            {
                method: 'POST',
                body: commentData,
                tokens,
            },
        ),
};
