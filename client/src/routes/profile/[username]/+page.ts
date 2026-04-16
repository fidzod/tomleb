import { error } from '@sveltejs/kit';
import { api } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const username = params.username;
    const profile = await api.getProfile(username);
    if (!profile) error(404, 'User not found.');
    const userPosts = await api.getPosts(username);

    const me = await api.me(null);
    const ownsProfile = me ? me.username === username : false;

    return { profile, userPosts, ownsProfile };
};
