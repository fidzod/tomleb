<script lang="ts">
	import Post from '$lib/components/Post.svelte';
	import Comment from '$lib/components/Comment.svelte';
	import CommentForm from '$lib/components/CommentForm.svelte';
	import { ui } from '$lib/state/ui.svelte.js';

	let { data } = $props();

	let post = $derived(data.post);
	let comments = $derived(data.comments);

    ui.pageName = "Comments";
</script>

<Post {post} openBottom={true} />

<div class="comments">
	<CommentForm postId={post.id} />

	{#each comments! as comment}
		{#if comment.parentId === null}
			<Comment {comment} />
		{/if}
	{/each}
</div>

<style>
	.comments {
		width: 100%;
		background-color: rgb(from var(--fg) r g b / 0.066);
		border: 1px solid rgb(from var(--fg) r g b / 0.2);
		border-bottom-left-radius: 10px;
		border-bottom-right-radius: 10px;
		padding-top: 1rem;
	}
</style>
