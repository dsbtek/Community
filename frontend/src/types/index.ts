// User types
export interface User {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    date_joined: string;
    avatar?: string | null; // Add avatar URL (optional)
    avatar_url?: string | null; // Add avatar_url (optional)
}

export interface UserRegistration {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthTokens {
    access: string;
    refresh: string;
}

// Group types
export interface Group {
    id: number;
    name: string;
    description: string;
    creator?: User;
    members_count?: number;
    created_at: string;
    updated_at?: string;
    is_member?: boolean;
}

export interface GroupCreate {
    name: string;
    description: string;
}

// Post types
export interface Post {
    id: number;
    title: string;
    content: string;
    author: string | User;
    group: string | Group;
    likes_count: number;
    comments_count: number;
    created_at: string;
    updated_at?: string;
    is_liked?: boolean;
    image_url?: string;
    image?: string; // Add image field for uploaded image
}

export interface PostCreate {
    title: string;
    content: string;
    group_id: number;
    image_url?: string;
}

// API Response types
export interface ApiResponse<T> {
    message?: string;
    data?: T;
    error?: string;
}

export interface GroupsResponse {
    message: string;
    groups: Group[];
}

export interface PostsResponse {
    message: string;
    posts: Post[];
    filters?: {
        group_id?: string;
        author_id?: string;
    };
}

// Authentication context types
export interface AuthContextType {
    user: User | null;
    tokens: AuthTokens | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (userData: UserRegistration) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

// Component prop types
export interface LoadingSpinnerProps {
    message?: string;
}

export interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}
