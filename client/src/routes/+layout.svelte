<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import NavDesktop from '$lib/components/NavDesktop.svelte';
	import NavMobileTop from '$lib/components/NavMobileTop.svelte';
	import NavMobileBtm from '$lib/components/NavMobileBtm.svelte';
	import LoginModal from '$lib/components/LoginModal.svelte';

	import { ui } from '$lib/state/ui.svelte.ts';
	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if ui.loginModalOpen}
	<LoginModal />
{/if}

<div class="nav-mobile"><NavMobileTop /></div>
<div class="nav-mobile"><NavMobileBtm /></div>

<div class="container">
	<div class="nav-desktop">
		<NavDesktop user={data.user} />
	</div>
	<main>
		{@render children()}
	</main>
</div>

<style>
	:root {
		--desktop-nav-width: 240px;
		--main-width: 550px;
		--mobile-nav-top-height: 60px;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
		display: flex;
		gap: 10px;
	}

	.nav-desktop {
		width: var(--desktop-nav-width);
		flex-shrink: 0;
	}

	.nav-mobile {
		display: none;
	}

	main {
		flex-grow: 1;
		padding: 10px;
		position: relative;
		max-width: var(--main-width);
		margin: 0 auto;
	}

	@media (max-width: 790px) {
		.container {
			display: block;
			padding: 20px 0 80px;
		}

		.nav-desktop {
			display: none;
		}

		.nav-mobile {
			display: block;
		}
	}
</style>
