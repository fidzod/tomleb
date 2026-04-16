import { error } from '@sveltejs/kit';
import { api } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, params }) => {
    const username = params.username;
    const profile = await api.getProfile(username);
    if (!profile) error(404, 'User not found.');
    const userPosts = await api.getPosts(username);

    const me = await api.me(request.headers.get('cookie'));
    const ownsProfile = me ? me.username === username : false;

    return { profile, userPosts, ownsProfile };
};
