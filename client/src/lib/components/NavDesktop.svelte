<script lang="ts">
	import {
		CircleUserRoundIcon,
		HouseIcon,
		SwatchBookIcon,
		SearchIcon,
		CommandIcon,
		InfoIcon,
		LogOutIcon
	} from '@lucide/svelte/icons';

	import { setLucideProps } from '@lucide/svelte';
	setLucideProps({ size: 14 });

	import { ui } from '$lib/state/ui.svelte.ts';

	let { user } = $props();

	import { invalidateAll, goto } from '$app/navigation';
	import { api } from '$lib/api';

	const handleLogout = async () => {
		await api.logout();
		await invalidateAll();
		goto('/');
	};
</script>

<nav>
	<span class="location">tomleb</span>

	<hr />

	<ul>
		{#if user}
			<li>
				<a href="/profile/{user.username}">
					<CircleUserRoundIcon /> Profile
				</a>
			</li>
		{:else}
			<li>
				<button onclick={() => (ui.loginModalOpen = true)}>
					<CircleUserRoundIcon /> Log In
				</button>
			</li>
		{/if}
		<li>
			<a href="/">
				<HouseIcon /> Home
			</a>
		</li>
		<li>
			<a href="#">
				<SwatchBookIcon /> Theme
			</a>
		</li>
		<li>
			<a href="/search">
				<SearchIcon /> Search
			</a>
		</li>
	</ul>

	<hr />

	<ul>
		<li>
			<a href="/">
				<CommandIcon /> Keyboard Shortcuts
			</a>
		</li>
		<li>
			<a href="/">
				<InfoIcon /> Help Center
			</a>
		</li>
		{#if user}
			<li class="logout">
				<button onclick={handleLogout}>
					<LogOutIcon /> Log Out
				</button>
			</li>
		{/if}
	</ul>
</nav>

<style>
	nav {
		padding: 20px;
		width: 100%;
		cursor: default;
	}

	hr {
		color: var(--grey);
		margin: 1em 0;
	}

	ul {
		display: flex;
		flex-direction: column;
		max-width: 100%;
		gap: 1em;
	}

	li {
		padding: 5px 10px;
		border-radius: 10px;
		position: relative;
	}

	li a {
		display: flex;
		align-items: center;
		gap: 0.5em;
		width: 100%;
	}

	li::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: linear-gradient(
			to right,
			rgb(from var(--fg) r g b / 0.2),
			rgb(from var(--fg) r g b / 0.2) 40%,
			rgb(from var(--fg) r g b / 0.01)
		);
		opacity: 0;
		transition: opacity 0.2s ease;
		z-index: -1;
	}

	li:hover {
		&::after {
			opacity: 1;
		}

		&.logout {
			color: var(--red);
		}
	}

	.location {
		width: fit-content;
		display: flex;
		align-items: center;
		gap: 10px;
		padding-left: 10px;
	}

	li button {
		all: unset;
		display: flex;
		align-items: center;
		gap: 0.5em;
		width: 100%;
		cursor: pointer;
	}
</style>
