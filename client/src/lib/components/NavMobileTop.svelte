<script lang="ts">
	import { ui } from '$lib/state/ui.svelte.ts';
</script>

<div class="mobile-nav-top nav-mobile">
	<span class="highlight title">{ ui.pageName || "tomleb" }</span>
</div>

<style>
	.mobile-nav-top {
		position: fixed;
		width: 100vw;
		height: var(--mobile-nav-top-height);
		background-color: var(--bg);
		border-bottom: 1px solid var(--grey);
		display: flex;
		align-items: center;
		padding: 0 20px;
		justify-content: center;
		z-index: 3;
		top: 0;
	}
</style>
