import { timeAgo } from '$lib/timeago';
import type { Post, UserProfile, Comment } from '$lib/types';

const BASE_URL = 'http://localhost:3000';

const apiCall = async (path: string, options: RequestInit = {}): Promise<Response> =>
    fetch(`${BASE_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
            ...options.headers
        }
    });

const genericUpdate = async <T extends Record<string, any>>(
    endpoint: string,
    updates: Partial<T>
) => {
    const formData = new FormData();
    Object.entries(updates).forEach(([field, value]) => {
        formData.append(field, value);
    });
    await apiCall(endpoint, { method: 'PATCH', body: formData });
};

export const api = {
    me: async (cookie: string | null) => {
        const res = await apiCall('/auth/me', {
            headers: { cookie: cookie ?? '' }
        });
        if (res.status === 401) return null;
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        return {
            ...data.user,
            avatarUrl: data.user.avatarUrl ? `${BASE_URL}${data.user.avatarUrl}` : null
        };
    },

    login: async (email: string, password: string) => {
        const res = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        return data.error as string | undefined;
    },

    register: async (email: string, password: string, username: string, displayName: string) => {
        const res = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, username, displayName })
        });
        const data = await res.json();
        return data.error as string | undefined;
    },

    logout: async () => await apiCall('/auth/logout', { method: 'POST' }),

    getPosts: async (user: string | null = null): Promise<Post[] | null> => {
        const res = await apiCall(user === null ? '/posts' : `/posts?user=${user}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();

        console.log(data);

        return data.posts.map((p: any) => ({
            ...p,
            media: p.media.map((url: string) => `${BASE_URL}${url}`),
            timeAgo: timeAgo(p.postedAt),
            user: {
                ...p.user,
                avatarUrl: p.user.avatarUrl ? `${BASE_URL}${p.user.avatarUrl}` : null
            }
        }));
    },

    getPost: async (postId: number): Promise<Post | null> => {
        const res = await apiCall(`/posts?postId=${postId}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        const post = data.posts[0];

        return {
            ...post,
            media: post.media.map((url: string) => `${BASE_URL}${url}`),
            timeAgo: timeAgo(post.postedAt),
            user: {
                ...post.user,
                avatarUrl: post.user.avatarUrl ? `${BASE_URL}${post.user.avatarUrl}` : null
            }
        };
    },

    createPost: async (content: string, media: File[]) => {
        const formData = new FormData();
        formData.append('content', content);
        for (const file of media) formData.append('media', file);
        await apiCall('/posts', {
            method: 'POST',
            body: formData
        });
    },

    getComments: async (postId: number): Promise<Comment[] | null> => {
        const res = await apiCall(`/posts/${postId}/comments`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        const formatComment = (c: any) => ({
            ...c,
            timeAgo: timeAgo(c.createdAt),
            repliesCount: c.replies.length,
            replies: c.replies.map(formatComment),
            media: c.media.map((url: string) => `${BASE_URL}${url}`),
            user: {
                ...c.user,
                avatarUrl: c.user.avatarUrl ? `${BASE_URL}${c.user.avatarUrl}` : null
            }
        });
        return data.comments.map(formatComment);
    },

    createComment: async (postId: number, content: string, media: File[]) => {
        const formData = new FormData();
        formData.append('content', content);
        for (const file of media) formData.append('media', file);
        await apiCall(`/posts/${postId}/comments`, {
            method: 'POST',
            body: formData
        });
    },

    createReply: async (parentId: number | null, content: string, media: File[]) => {
        const formData = new FormData();
        formData.append('content', content);
        for (const file of media) formData.append('media', file);
        await apiCall(`/comments/${parentId}/replies`, {
            method: 'POST',
            body: formData
        });
    },

    getProfile: async (username: string): Promise<UserProfile | null> => {
        const res = await apiCall(`/profile/${username}`);
        if (!res) return null;
        const data = await res.json();
        return {
            ...data.profile,
            avatarUrl: data.profile.avatarUrl
                ? `${BASE_URL}${data.profile.avatarUrl}`
                : null,
            bannerUrl: data.profile.bannerUrl
                ? `${BASE_URL}${data.profile.bannerUrl}`
                : null
        };
    },

    updateUser: async (
        updates: Partial<{
            username: string;
            displayName: string;
            avatar: File;
        }>
    ) => genericUpdate('/user', updates),

    updateProfile: async (
        updates: Partial<{
            username: string;
            displayName: string;
            avatar: File;
        }>
    ) => genericUpdate('/profile', updates),

    addLike: async (
        postId: number
    ): Promise<{
        likeCount: number;
        likedByMe: boolean;
    }> => {
        const res = await apiCall(`/posts/${postId}/like`, { method: 'POST' });
        return await res.json();
    },

    deleteLike: async (
        postId: number
    ): Promise<{
        likeCount: number;
        likedByMe: boolean;
    }> => {
        const res = await apiCall(`/posts/${postId}/like`, { method: 'DELETE' });
        return await res.json();
    },

    likeComment: async (
        commentId: number
    ): Promise<{
        likeCount: number;
        likedByMe: boolean;
    }> => {
        const res = await apiCall(`/comments/${commentId}/like`, { method: 'POST' });
        return await res.json();
    },

    unlikeComment: async (
        commentId: number
    ): Promise<{
        likeCount: number;
        likedByMe: boolean;
    }> => {
        const res = await apiCall(`/comments/${commentId}/like`, { method: 'DELETE' });
        return await res.json();
    }
};
