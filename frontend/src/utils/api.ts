import { AuthTokens } from '../types';

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

    const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
    };

    if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            let errorData;

            try {
                errorData = await response.json();
                errorMessage =
                    errorData.detail || errorData.message || errorMessage;
            } catch {
                // If response is not JSON, use the status text
            }

            throw new ApiError(errorMessage, response.status, errorData);
        }

        // Handle empty responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return {} as T;
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Network or other errors
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
