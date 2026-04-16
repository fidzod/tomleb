import { api } from '$lib/api';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request }) => {
	return {
		user: await api.me(request.headers.get('cookie'))
	};
};
