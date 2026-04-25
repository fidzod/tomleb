import { error } from '@sveltejs/kit';
import { api } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const postId = parseInt(params.postId as string);
	const post = await api.getPost(postId);
	if (!post) error(404, 'Post not found.');

	const comments = await api.getComments(postId);

	return { post, comments };
};
