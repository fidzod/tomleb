<script lang="ts">
	import { onMount } from 'svelte';

	import { XIcon } from '@lucide/svelte/icons';

	let { file, onRemove } = $props();

	let preview = $state(' ');
	const reader = new FileReader();
	reader.onload = (e) => {
		preview = (e.target?.result as string) || '';
	};

	onMount(() => {
		reader.readAsDataURL(file);
	});
</script>

{#if preview}
	<button type="button" class="remove-btn" onclick={onRemove} title="remove-preview">
		<div class="close"><XIcon size={15} /></div>
		<div class="img" style={`background-image: url('${preview}');`}></div>
	</button>
{/if}

<style>
	.img {
		width: 50px;
		height: 50px;
		background-size: cover;
		border: 2px solid var(--fg);
		border-radius: 10px;
	}

	button {
		padding: 0;
		background: none;
		border: none;
		position: relative;
	}

	button:hover {
		animation: teeter 0.6s ease-in-out infinite;
		transform-origin: center;
		.close {
			display: flex;
		}
	}

	button .close {
		color: var(--bg);
		background-color: var(--bright);
		border-radius: 50%;
		padding: 1px;
		position: absolute;
		top: -6px;
		right: -6px;
		justify-content: center;
		align-items: center;
		display: none;
	}

	@keyframes teeter {
		0% {
			transform: rotate(0deg);
		}
		25% {
			transform: rotate(-8deg);
		}
		75% {
			transform: rotate(8deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}
</style>
