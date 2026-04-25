<script lang="ts">
	import { api } from '$lib/api.ts';

	import Comment from '$lib/components/Comment.svelte';
	import ReplyForm from '$lib/components/ReplyForm.svelte';
	import Gallery from '$lib/components/Gallery.svelte';

	import { setLucideProps } from '@lucide/svelte';
	import { HeartIcon, MessageCircleIcon, EyeIcon, CornerLeftUpIcon } from '@lucide/svelte/icons';

	setLucideProps({ size: 16 });

	let { comment, isReplyLevel = false, isReplyToReply = false } = $props();

	let repliesOpen = $state(false);

	let likedByMe = $state(comment.likedByMe);
	let likeCount = $state(comment.likeCount);

	// Flatten all nested replies into a single list
	function flattenReplies(replies: any[]): any[] {
		const result: any[] = [];
		for (const reply of replies) {
			result.push(reply);
			if (reply.replies?.length) {
				result.push(...flattenReplies(reply.replies));
			}
		}
		return result;
	}

	const flatReplies = $derived(comment.replies?.length ? flattenReplies(comment.replies) : []);

	const totalRepliesCount = $derived(flatReplies.length || comment.repliesCount);

	const likeButtonClick = async () => {
		const res = !likedByMe
			? await api.likeComment(comment.id)
			: await api.unlikeComment(comment.id);
		likedByMe = res.likedByMe !== undefined ? res.likedByMe : likedByMe;
		likeCount = res.likeCount !== undefined ? res.likeCount : likeCount;
	};

	const handleCommentClick = () => {
		if (isReplyLevel) replyFormOpen = !replyFormOpen;
		else repliesOpen = !repliesOpen;
	};

	let replyFormOpen = $state(false);
</script>

<div class="comment" class:reply={isReplyLevel} class:repliesOpen>
	<a href="/profile/{comment.user.username}" title="User Profile" class="avatar">
		<img src={comment.user.avatarUrl} alt="User avatar" />
	</a>
	<div class="details-and-content">
		<div class="details">
				<span class="display-name">{comment.user.displayName}</span>
				<span class="username">@{comment.user.username}</span>
				<span class="timeago">{comment.timeAgo}</span>
        </div>
		<div class="content" class:hasContent={comment.content.length > 0}>
            {#if isReplyToReply && comment.replyingTo}
                <span class="replyingTo" class:hasMedia={comment.media.length > 0}>
                    <CornerLeftUpIcon size={8} />
                    {comment.replyingTo.username}
                </span>
            {/if}
			{#if comment.media.length > 1}
				<Gallery images={comment.media} />
			{:else if comment.media.length > 0}
				<img src={comment.media[0]} alt="user media" class="media-single" />
			{/if}
			{comment.content}
		</div>
		<div class="row interactions">
			<button class="icon-btn like-btn" class:liked={likedByMe} onclick={likeButtonClick}>
				<HeartIcon />
				{likeCount}
			</button>
			<button class="icon-btn comment-btn" onclick={handleCommentClick}>
				<MessageCircleIcon />
				{totalRepliesCount}
			</button>
			<button class="icon-btn">
				<EyeIcon />
			</button>
		</div>

		{#if isReplyLevel && replyFormOpen}
			<div class="inline-reply-form">
				<ReplyForm parentId={comment.id} />
			</div>
		{/if}
	</div>
</div>

{#if !isReplyLevel && repliesOpen}
	<div class="replies">
		<div class="comment reply">
			<ReplyForm parentId={comment.id} />
		</div>
		{#each flatReplies as reply}
			<Comment comment={reply} isReplyLevel={true} isReplyToReply={reply.parentId !== comment.id} />
		{/each}
	</div>
{/if}

<style>
	.comment {
		--avatar-size: 60px;
		display: flex;
		flex-direction: row;
		gap: 1rem;
		padding: 0 1rem 1rem;
		margin-bottom: 0.5rem;
	}

	.comment.reply {
		margin-left: 45px;
		border-left: 2px solid rgb(from var(--fg) r g b / 0.2);
		margin-bottom: 0;
		padding-left: 30px;
	}

	/* Vertical line drawn down the left side of the comment when replies are open */
	.comment.repliesOpen {
		position: relative;
	}

	.comment.repliesOpen::before {
		content: '';
		position: absolute;
		border-left: 2px solid rgb(from var(--fg) r g b / 0.2);
		top: calc(var(--avatar-size) + 1rem);
		left: calc(var(--avatar-size) / 2 + 0.95rem);
		height: calc(100% - var(--avatar-size) - 0.5rem); /* extend into the replies gap */
		width: 0;
	}

	/* Last reply: replace straight line with a curve into the content */
	.comment.reply:last-child {
		margin-bottom: 1.5rem;
		padding-bottom: 0;
		border-left: none;
		position: relative;
	}

	.comment.reply:last-child::before {
		content: '';
		position: absolute;
		border-left: 2px solid rgb(from var(--fg) r g b / 0.2);
		border-bottom: 2px solid rgb(from var(--fg) r g b / 0.2);
		border-bottom-left-radius: 10px;
		height: 30px;
		width: 10px;
		top: 0;
		left: 0;
	}

	.avatar {
		height: fit-content;
	}

	.avatar img {
		width: var(--avatar-size);
		height: var(--avatar-size);
		border-radius: 50%;
		object-fit: cover;
	}

	.details-and-content {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.details {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.3rem;
	}

	.replyingTo {
		display: inline-flex;
		align-items: center;
		gap: 3px;
        vertical-align: top;
        margin-right: 0.3rem;
        width: fit-content;
		border-radius: 10px;
		color: var(--fg);
        opacity: 0.8;
	}
    .replyingTo.hasMedia {
        margin-bottom: 1rem;
    }

	.username,
	.timeago
    {
		font-size: 0.8em;
		opacity: 0.8;
	}

	.timeago {
		margin-left: 0.2rem;
	}

	.content {
		font-size: 0.9rem;
	}

	.media-single {
		width: 100%;
		border-radius: 10px;
		margin-bottom: 12px;
	}

	:global(.hasContent .gallery) {
		margin-bottom: 12px;
	}

	.interactions {
		display: flex;
		gap: 18px;
		margin-top: 0.5rem;
	}

	.icon-btn {
		background: none;
		border: none;
		box-shadow: none;
		padding: 2px;
		display: flex;
		align-items: center;
		gap: 5px;
		cursor: pointer;
	}

	.inline-reply-form {
		margin-top: 0.5rem;
	}
</style>
