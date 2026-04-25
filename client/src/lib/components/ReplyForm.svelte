<script lang="ts">
	import { ImagePlusIcon, MapPinIcon, EarthIcon, ForwardIcon } from '@lucide/svelte/icons';

	import FilePreview from '$lib/components/FilePreview.svelte';

	import { api } from '$lib/api';
	import { invalidateAll } from '$app/navigation';

	let { parentId } = $props();

	let textarea: HTMLTextAreaElement;
	let mediaInput: HTMLElement;

	let content = $state('');
	let files = $state<File[]>([]);

	const handleInput = () => {
		textarea.style.height = 'auto';
		textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
	};

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		await api.createReply(parentId, content, files);
		content = '';
		files = [];
		invalidateAll();
	};

	const onFileChange = (e: Event) => {
		const input = e.target as HTMLInputElement;
		if (!input.files) return;
		const existing = new Set(files.map((f) => f.name + f.size));
		files = [...files, ...Array.from(input.files).filter((f) => !existing.has(f.name + f.size))];
		input.value = '';
	};

	const removeFile = (index: number) => {
		files = files.filter((_, i) => i !== index);
	};
</script>

<div class="new-post">
	<form onsubmit={handleSubmit}>
		<textarea bind:this={textarea} bind:value={content} oninput={handleInput} placeholder="Reply..."
		></textarea>
		<input
			type="file"
			accept="image/*"
			multiple
			onchange={onFileChange}
			bind:this={mediaInput}
			class="hidden-input"
		/>
		{#if files}
			<div class="row">
				{#each files as file, index (file.name + index)}
					<FilePreview {file} onRemove={() => removeFile(index)} />
				{/each}
			</div>
		{/if}
		<div class="row">
			<button type="button" onclick={() => mediaInput.click()}><ImagePlusIcon /></button>
			<button><MapPinIcon /></button>
			<button><EarthIcon /></button>
			<button class="primary post-btn" type="submit">
				<ForwardIcon size={14} /> <span>Reply</span>
			</button>
		</div>
	</form>
</div>

<style>
	.new-post {
		width: 100%;
		padding: 0 0 0 0;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 1rem;
	}

	textarea {
		min-height: 50px;
		height: 50px;
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

	button.post-btn {
		margin-left: auto;
	}
</style>
