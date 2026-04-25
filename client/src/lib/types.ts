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

type Reply = {
	id: number;
	content: string;
	createdAt: number;
	parentId: number;
	postId: number;
	replies: Reply[];
	timeAgo: number;
	replyingTo: {
		id: number;
		username: string;
	};
	user: User;
    likeCount: number;
    likedByMe: boolean;
	media: string[];
};

export interface Comment {
	id: number;
	content: string;
	createdAt: number;
	parentId: null | number;
	postId: number;
	replies: Reply[];
	user: User;
    likeCount: number;
    likedByMe: boolean;
	media: string[];
}
