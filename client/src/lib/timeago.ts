export const timeAgo = (timestamp: number): string => {
	const now = Date.now();
	const secondsAgo = Math.floor((now - timestamp) / 1000);
	const intervals: { [key: string]: number } = {
		year: 31536000,
		month: 2592000,
		week: 604800,
		day: 86400,
		hour: 3600,
		minute: 60,
		second: 1
	};
	for (const [name, seconds] of Object.entries(intervals)) {
		const interval = Math.floor(secondsAgo / seconds);
		if (interval >= 1) {
			return `${interval} ${name}${interval > 1 ? 's' : ''} ago`;
		}
	}
	return 'just now';
};
