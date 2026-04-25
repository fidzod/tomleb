<script lang="ts">
	import Feed from '$lib/components/Feed.svelte';

	let { data } = $props();
</script>

<Feed posts={data.posts} />
