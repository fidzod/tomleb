import { timeAgo } from '$lib/timeago';
import type { Post, UserProfile } from '$lib/types';

const BASE_URL = typeof window === 'undefined' ? 'http://localhost:3000' : '/api';

const apiCall = async (path: string, options: RequestInit = {}): Promise<Response> =>
    fetch(`${BASE_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
            ...options.headers
        }
    });

export const api = {
    me: async (cookie: string | null) => {
        const res = await apiCall('/auth/me', {
            headers: { cookie: cookie ?? '' }
        });
        if (res.status === 401) return null;
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        return data.user;
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

        return data.posts
            .map((p: any) => ({
                ...p,
                media: p.media.map((url: string) => `${BASE_URL}${url}`),
                timeAgo: timeAgo(p.postedAt),
                user: {
                    ...p.user,
                    avatarUrl: p.user.avatarUrl ? `${BASE_URL}${p.user.avatarUrl}` : null
                }
            }))
            .toSorted((a: any, b: any) => b.postedAt - a.postedAt);
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
                : null,
        };
    },

    updateBanner: async (file: File) => {
        const formData = new FormData();
        formData.append("banner", file);

        await apiCall('/profile/upload-banner', {
            method: "POST",
            body: formData,
        });
    },

    updateAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append("avatar", file);

        await apiCall('/profile/upload-avatar', {
            method: "POST",
            body: formData,
        });
    },

    updateProfile: async (updates: {
        profileBio: string | undefined, profileLocation: string | undefined
    }) =>
        await apiCall('/profile/update', {
            method: 'POST',
            body: JSON.stringify(updates)
        }),
};
