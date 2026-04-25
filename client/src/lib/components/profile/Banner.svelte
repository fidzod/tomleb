<script lang="ts">
	import { PencilIcon } from '@lucide/svelte/icons';

	import { invalidateAll } from '$app/navigation';
	import { api } from '$lib/api';

	let { isOwner, bannerUrl } = $props();

	let bannerFileInput: HTMLInputElement;
	let bannerCacheKey = $state(Date.now());
	let updateBanner = async () => {
		const file = bannerFileInput.files?.[0];
		if (!file) return;
		await api.updateProfile({ banner: file });
		bannerCacheKey = Date.now();
		await invalidateAll();
	};
</script>

{#if bannerUrl}
	<div class="banner" style="background-image: url('{`${bannerUrl}?v=${bannerCacheKey}`}')"></div>
{:else}
	<div class="banner"></div>
{/if}

{#if isOwner}
	<input type="file" class="hidden-input" bind:this={bannerFileInput} onchange={updateBanner} />
	<button class="edit-banner edit-button" onclick={() => bannerFileInput.click()}
		><PencilIcon size={14} /></button
	>
{/if}

<style>
	.banner {
		width: 100%;
		height: var(--banner-height);
		position: absolute;
		top: 0;
		left: 0;
		background-size: cover;
		border-radius: 10px;
		background-color: var(--grey);
		z-index: -1;
	}

	.edit-banner {
		position: absolute;
		right: 5px;
		top: 110px;
		opacity: 1;
		&:hover {
			opacity: 0.8;
		}
	}

	@media (max-width: 790px) {
		.edit-banner {
			top: 5px;
		}
	}
</style>
