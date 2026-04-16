type User = {
	id: number;
	avatarUrl: string;
	username: string;
	displayName: string;
};

export interface Post {
	id: number;
	content: string;
	media: string[];
	timeAgo: string;
	user: User;
    likes: number;
    likedByMe: boolean;
}

export interface UserProfile {
    username: string;
    displayName: string;
    avatarUrl: string;
    bannerUrl: string;
    bio: string;
    location: string;
}
