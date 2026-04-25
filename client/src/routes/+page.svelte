<script lang="ts">
	import Feed from '$lib/components/Feed.svelte';
	import { ui } from '$lib/state/ui.svelte.js';

	let { data } = $props();

    ui.pageName = "Home";
</script>

<Feed posts={data.posts} />
