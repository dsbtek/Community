// Utility to get relative time (e.g., '2 hours ago')
export function timeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const intervals: [number, string][] = [
        [60, 'minute'],
        [3600, 'hour'],
        [86400, 'day'],
        [2592000, 'month'],
        [31536000, 'year'],
    ];
    let counter = seconds;
    let unit = 'second';
    for (const [secs, name] of intervals) {
        if (counter < secs) break;
        counter = Math.floor(seconds / secs);
        unit = name;
    }
    return `${counter} ${unit}${counter !== 1 ? 's' : ''} ago`;
}
