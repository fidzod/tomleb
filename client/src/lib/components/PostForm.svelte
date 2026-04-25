<script lang="ts">
	import { ImagePlusIcon, MapPinIcon, EarthIcon } from '@lucide/svelte/icons';

	import FilePreview from '$lib/components/FilePreview.svelte';

	import { api } from '$lib/api';
	import { invalidateAll } from '$app/navigation';
	import { ui } from '$lib/state/ui.svelte.ts';

	let textarea: HTMLTextAreaElement;
	let mediaInput: HTMLElement;

	let postContent = $state('');
	let postFiles = $state<File[]>([]);

	const handleInput = () => {
		textarea.style.height = 'auto';
		textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
	};

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		await api.createPost(postContent, postFiles);
		closeNewPost();
		invalidateAll();
	};

	const onFileChange = (e: Event) => {
		const input = e.target as HTMLInputElement;
		if (!input.files) return;
		const existing = new Set(postFiles.map((f) => f.name + f.size));
		postFiles = [
			...postFiles,
			...Array.from(input.files).filter((f) => !existing.has(f.name + f.size))
		];
		input.value = '';
	};

	const removeFile = (index: number) => {
		postFiles = postFiles.filter((_, i) => i !== index);
	};

	const closeNewPost = () => {
		ui.newPostOpen = false;
		postContent = '';
		postFiles = [];
	};
</script>

<div class="new-post">
	<form onsubmit={handleSubmit}>
		<textarea
			bind:this={textarea}
			bind:value={postContent}
			oninput={handleInput}
			placeholder="Share something..."
		></textarea>
		<input
			type="file"
			accept="image/*"
			multiple
			onchange={onFileChange}
			bind:this={mediaInput}
			class="hidden-input"
		/>
		{#if postFiles}
			<div class="row">
				{#each postFiles as file, index (file.name + index)}
					<FilePreview {file} onRemove={() => removeFile(index)} />
				{/each}
			</div>
		{/if}
		<div class="row">
			<button type="button" onclick={() => mediaInput.click()}><ImagePlusIcon /></button>
			<button><MapPinIcon /></button>
			<button><EarthIcon /></button>
			<button class="cancel" onclick={closeNewPost}>Cancel</button>
			<button class="primary post-btn" type="submit"><span>Post</span></button>
		</div>
	</form>
</div>

<style>
	.new-post {
		width: 100%;
		padding: 16px;
		background-color: rgb(from var(--fg) r g b / 0.066);
		border: 1px solid rgb(from var(--fg) r g b / 0.2);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		gap: 12px;

		scale: 1;
		transition: scale 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

		@starting-style {
			scale: 0;
		}
	}

	.row {
		width: 100%;
		gap: 14px;
	}

	button:not(.post-btn) {
		background: none;
		border: none;
		color: var(--fg);
		padding: 2px;

		&:hover {
			opacity: 0.8;
			box-shadow: none;
			text-shadow: 0 6px 10px #fffa;
		}
	}

	button.cancel {
		margin-left: auto;
	}
</style>
