// Returns the full media URL for a given path, using the backend domain
export function getMediaUrl(path: string): string {
    if (!path) return '';
    // If already absolute (http/https), return as is
    if (/^https?:\/\//.test(path)) return path;
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const base = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    return `${base}${cleanPath}`;
}
