import type { PageLoad } from "./$types";
import { api } from '$lib/api';

export const load: PageLoad = async () => {
    const posts = await api.getPosts();
    return { posts };
};
