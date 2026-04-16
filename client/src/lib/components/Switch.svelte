<script lang="ts">
	let { optionA, optionB, onSwitched } = $props();
	let value = $state('');
</script>

<div class="switch">
	<div class="pill" class:right={value === optionB}>
		<div class="inner"></div>
	</div>
	<button onclick={() => onSwitched((value = optionA))}>{optionA}</button>
	<button onclick={() => onSwitched((value = optionB))}>{optionB}</button>
</div>

<style>
	.switch {
		position: relative;
		margin: 0 auto;
		width: 200px;
		padding: 3px;
		background-color: rgb(from var(--bg) r g b / 0.4);
		border: 1px solid var(--grey);
		border-radius: 20px;
		display: flex;
	}

	.pill {
		position: absolute;
		width: 50%;
		height: 100%;
		border-radius: 18px;
		top: 0;
		left: 0;
		transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		border: 4px solid var(--graden);
		background: linear-gradient(to top, var(--green), var(--yellow));
	}

	.pill .inner {
		position: relative;
		border-radius: inherit;
		width: calc(100% - 4px);
		height: calc(100% - 4px);
	}

	.pill .inner::before {
		content: '';
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 2px;
		border-radius: inherit;
		background: linear-gradient(to bottom, var(--green), var(--yellow), var(--green));
		background-size: 100% 200%;
		background-position: 50% 0%;
		box-shadow: 0 0 15px white inset;
		transition: ease 0.2s box-shadow;
	}

	.pill.right {
		transform: translateX(100%);
	}

	button {
		position: relative;
		z-index: 1;
		width: 50%;
		cursor: pointer;
		padding: 5px;
		font-size: 14px;
		border-radius: 20px;
		border: none;
		background: none;
		color: var(--fg);
		mix-blend-mode: difference;
	}

	button:hover {
		box-shadow: none;
	}
</style>
