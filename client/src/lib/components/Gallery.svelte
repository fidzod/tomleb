<script lang="ts">
	let { images } = $props();

	import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte/icons';

	let postMediaGallery: HTMLElement;
	let atStart = $state(true);
	let atEnd = $state(false);

	let currentIndex = $state(0);

	function onScroll() {
		const { scrollLeft, scrollWidth, clientWidth } = postMediaGallery;
		atStart = scrollLeft <= 0;
		atEnd = scrollLeft + clientWidth >= scrollWidth - 1;

		const item = postMediaGallery.firstElementChild as HTMLElement;
		const gap = parseFloat(getComputedStyle(postMediaGallery).gap);
		currentIndex = Math.round(scrollLeft / (item.offsetWidth + gap));
	}

	const scrollBy = (direction: 1 | -1) => {
		const item = postMediaGallery.firstElementChild as HTMLElement;
		const gap = parseFloat(getComputedStyle(postMediaGallery).gap);
		postMediaGallery.scrollBy({
			left: direction * (item.offsetWidth + gap),
			behavior: 'smooth'
		});
	};
</script>

<div class="gallery-wrapper">
	<div class="gallery" bind:this={postMediaGallery} onscroll={onScroll}>
		{#each images as mediaUrl}
			<div class="gallery-item" style="background-image: url('{mediaUrl}')"></div>
		{/each}
	</div>
	<button class="scroll-left" class:hidden={atStart} onclick={() => scrollBy(-1)}
		><ChevronLeftIcon /></button
	>
	<button class="scroll-right" class:hidden={atEnd} onclick={() => scrollBy(1)}
		><ChevronRightIcon /></button
	>
	<div class="dots">
		{#each images as _, i}
			<div class="dot" class:active={i === currentIndex}></div>
		{/each}
	</div>
</div>

<style>
	.gallery-wrapper {
		position: relative;

		button {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			background-color: #2a2a2a50;
			border: none;
			padding: 10px;
			border-radius: 50%;
			filter: brightness(1);
			transition:
				filter 0.3s ease,
				opacity 0.2s;
			opacity: 0;
		}
		button:hover {
			filter: brightness(5);
		}
		button.scroll-left {
			left: 10px;
		}
		button.scroll-right {
			right: 10px;
		}
		&:hover button:not(.hidden) {
			opacity: 1;
		}
		&:hover .dots {
			opacity: 1;
		}
		button.hidden {
			pointer-events: none;
		}
	}

	.gallery {
		display: flex;
		gap: 5px;
		overflow-x: scroll;
		scroll-snap-type: x mandatory;
		border-radius: 10px;
		scrollbar-width: none;

		.gallery-item {
			width: calc(100% - 40px);
			flex-shrink: 0;
			height: 250px;
			background-size: cover;
			background-position: center;
			scroll-snap-align: center;
		}
	}

	.dots {
		position: absolute;
		bottom: 10px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 6px;
		align-items: center;
		justify-content: center;
		background-color: #2a2a2a50;
		padding: 6px 10px;
		width: fit-content;
		border-radius: 10px;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background-color: var(--fg);
		opacity: 0.3;
		transition: opacity 0.3s;
	}

	.dot.active {
		opacity: 1;
	}

	@media (hover: none) {
		.gallery-wrapper .dots {
			opacity: 1;
		}
		.gallery-wrapper button {
			pointer-events: none;
		}
	}
</style>
