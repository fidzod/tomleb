<script lang="ts">
    import { api } from '$lib/api.ts';

	import Gallery from '$lib/components/Gallery.svelte';

	import { setLucideProps } from '@lucide/svelte';
	import { HeartIcon, RepeatIcon, MessageCircleIcon, EyeIcon } from '@lucide/svelte/icons';

	setLucideProps({ size: 16 });

	let { post } = $props();

	let likedByMe = $state(post.likedByMe);
	let likeCount = $state(post.likeCount);

	const likeButtonClick = async () => {
        const res = !likedByMe
            ? await api.addLike(post.id)
            : await api.deleteLike(post.id);
        likedByMe = res.likedByMe !== undefined ? res.likedByMe : likedByMe;
        likeCount = res.likeCount !== undefined ? res.likeCount : likeCount;
    };
</script>

<div class="post">
	<div class="row post-user">
		<a href="/profile/{post.user.username}">
			<img src={post.user.avatarUrl} alt="user avatar" class="avatar" />
		</a>
		<div class="details">
			<div class="row">
				<a href="/profile/{post.user.username}">
					<span class="display-name">{post.user.displayName}</span>
					<span class="username">@{post.user.username}</span>
				</a>
			</div>
			<span class="posted-time">{post.timeAgo}</span>
		</div>
	</div>

	<div class="post-content" class:hasContent={post.content.length > 0}>
		{#if post.media.length > 0}
			{#if post.media.length > 1}
				<Gallery images={post.media} />
			{:else}
				<img src={post.media[0]} alt="user media" class="media-single" />
			{/if}
		{/if}
		<span class="content">{post.content}</span>
	</div>

	<div class="post-interactions">
		<button id="like-btn" class:liked={likedByMe} onclick={likeButtonClick}
			><HeartIcon /> {likeCount}</button
		>
		<button id="inter-repost"><RepeatIcon /></button>
		<button id="inter-comments"><MessageCircleIcon /></button>
		<button id="inter-views"><EyeIcon /></button>
	</div>
</div>

<style>
	:root {
		--like-btn-pink: #f383b7;
	}

	.post {
		width: 100%;
		padding: 9px 16px 16px;
		background-color: rgb(from var(--fg) r g b / 0.066);
		border: 1px solid rgb(from var(--fg) r g b / 0.2);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.post-user {
		gap: 12px;
	}
	.details {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}
	.details .row {
		gap: 5px;
	}
	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
	}
	a:has(.avatar) {
		margin-top: 7px;
	}
	.posted-time,
	.username {
		font-size: 0.8em;
		opacity: 0.8;
	}

	.media-single {
		width: 100%;
		border-radius: 10px;
	}

	:global(.hasContent .gallery) {
		margin-bottom: 12px;
	}

	.post-interactions {
		display: flex;
		gap: 18px;
	}

	.post-interactions button {
		background: none;
		border: none;
		padding: 2px;
		display: flex;
		align-items: center;
        box-shadow: none;
	}

	#like-btn:hover {
		color: var(--like-btn-pink);
	}

	#like-btn.liked {
		color: var(--like-btn-pink);
		:global(.lucide) {
			fill: var(--like-btn-pink);
		}

		&:hover {
			:global(.lucide) {
				fill: none;
			}
		}
	}
</style>
