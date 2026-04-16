<script lang="ts">
	import DefaultAvatar from '$lib/assets/default_avatar.jpg';
	import { PencilIcon } from '@lucide/svelte/icons';

	import { invalidateAll } from '$app/navigation';
	import { api } from '$lib/api';

    let { isOwner, avatarUrl } = $props();

	let avatarFileInput: HTMLInputElement;
	let avatarCacheKey = $state(Date.now());
	let updateAvatar = async () => {
		const file = avatarFileInput.files?.[0];
		if (!file) return;
		await api.updateUser({avatar: file});
		avatarCacheKey = Date.now();
		await invalidateAll();
	};
</script>

<div class="avatar-container" class:editable={isOwner}>
	<img
		src={avatarUrl ? `${avatarUrl}?v=${avatarCacheKey}` : DefaultAvatar}
		alt="avatar"
		class="avatar"
	/>
	{#if isOwner}
		<input type="file" class="hidden-input" bind:this={avatarFileInput} onchange={updateAvatar} />
		<button class="edit-button" onclick={() => avatarFileInput.click()}
			><PencilIcon size={14} /></button
		>
	{/if}
</div>

<style>
	img.avatar {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid var(--bg);
	}

	.avatar-container {
		position: relative;

		.edit-button {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			opacity: 0;

			&:hover {
				opacity: 90%;
			}
		}

		img {
			transition: filter 0.2s ease;
		}
		&.editable:hover img {
			filter: blur(1px);
		}
		&:hover button {
			opacity: 80%;
		}
	}
</style>
