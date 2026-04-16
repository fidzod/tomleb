<script lang="ts">
    let { children, closeModal } = $props();
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && closeModal()} />

<div class="blobs"></div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="backdrop" onclick={closeModal}>
	<div class="modal-wrapper">
		<div class="modal" onclick={(e) => e.stopPropagation()}>
        {@render children()}
        </div>
    </div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 3;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 1;
		transition: opacity 0.25s ease;

		@starting-style {
			opacity: 0;
		}
	}
	.modal-wrapper {
		padding: 3px;
		border-radius: 15px;
		background: linear-gradient(
			to bottom,
			rgb(from var(--green) r g b / 0.5),
			rgb(from var(--yellow) r g b / 0.5),
			rgb(from var(--green) r g b / 0.5),
			rgb(from var(--yellow) r g b / 0.5)
		);
        backdrop-filter: blur(1px);
		scale: 1;
		transition: scale 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

		@starting-style {
			scale: 0;
		}
	}
	.modal {
		min-width: 325px; /* temp */
		min-height: 350px;
		padding: 50px 20px;
		border-radius: 12px;
		background-color: rgb(from var(--bg) r g b / 0.8);
		box-shadow:
			0 0 10px rgb(from var(--green) r g b / 0.5) inset,
			0 0 10px rgb(from var(--green) r g b / 0.5);
		display: flex;
		flex-direction: column;
		gap: 20px;
		align-items: center;
	}
	.blobs::before {
		content: '';
		position: fixed;
		top: 20px;
		left: 50px;
		width: 60vw;
		height: 50vh;
		border-radius: 100%;
		background-color: rgb(from var(--green) r g b / 0.2);
		filter: blur(100px);
		z-index: 2;
	}
	.blobs::after {
		content: '';
		position: fixed;
		bottom: 20px;
		right: 50px;
		width: 60vw;
		height: 50vh;
		border-radius: 100%;
		background-color: rgb(from var(--yellow) r g b / 0.2);
		filter: blur(100px);
		z-index: 2;
	}

    :global(.modal input, .modal button) {
		background-color: rgb(from var(--bg) r g b / 0.4);
    }

    @media (max-width: 790px) {
        .modal {
            background: var(--bg);
            width: 100vw;
            height: 100vh;
            justify-content: center;
            scale: 1.1;
        }
    }
</style>
