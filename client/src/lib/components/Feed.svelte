<script lang="ts">
	import { ui } from '$lib/state/ui.svelte.ts';
	import { onMount } from 'svelte';

	import { PlusIcon } from '@lucide/svelte/icons';

	import PostForm from '$lib/components/PostForm.svelte';
	import Post from '$lib/components/Post.svelte';

	onMount(() => (ui.newPostOpen = false));

	let { posts, hideNewPost = false, title = null } = $props();
</script>

<div class="row header">
	<span>{title || 'Recent Posts'}</span>
	{#if !hideNewPost}
		<button class="primary post-button" onclick={() => (ui.newPostOpen = true)}>
			<PlusIcon size={14} /> <span>New Post</span>
		</button>
	{/if}
</div>

<div class="feed">
	{#if ui.newPostOpen}
		<PostForm />
	{/if}

	{#each posts as post}
		<Post {post} />
	{/each}
</div>

<style>
	.row.header {
		width: 100%;
		margin: 0.3rem 0 2rem;
		gap: 10px;

		.post-button {
			margin-left: auto;
		}
	}

	.feed {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (max-width: 790px) {
		.row.header {
			display: none;
		}
	}
</style>
