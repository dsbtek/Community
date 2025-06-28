// Helper to get full API URL using REACT_APP_BACKEND_URL
export function getApiUrl(path: string): string {
    const base = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return base + path;
    return base + '/' + path;
}
