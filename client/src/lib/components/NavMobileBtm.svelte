<script lang="ts">
	import { ui } from '$lib/state/ui.svelte.ts';
	import { Plus, House, Search, Bell, User, Menu } from '@lucide/svelte/icons';
</script>

<div class="mobile-nav-bottom">
	<button><House /></button>
	<button><User /></button>
	<button class="primary post-button" onclick={() => (ui.newPostOpen = true)}
		><Plus size={18} /></button
	>
	<button><Bell /></button>
	<button><Menu /></button>
</div>

<style>
	.mobile-nav-bottom {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		padding: 0.2rem 20px;
		gap: 5px;
		background-color: var(--bg);
		border: 2px solid var(--grey);
		border-radius: 18px;
		box-shadow: 0 3px 20px rgb(from var(--green) r g b / 0.2);
		z-index: 3;

		button:not(.post-button) {
			padding: 0.6rem 15px;
			border: none;
			&:hover {
				background-color: var(--grey);
			}
		}
	}

	button.post-button {
		padding: 6px;
		border-radius: 50%;
		margin: 0 7.5px;
	}
</style>
