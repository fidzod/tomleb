<!--
		<EditableField
			isOwner={data.ownsProfile}
			dbContent={data.profile.profileLocation ?? ''}
			dbField="profileLocation"
			emptyLabel="location"
		><MapPinIcon size={14} /></EditableField>
-->
<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { api } from '$lib/api';
	import { PencilIcon } from '@lucide/svelte/icons';

	let { children, isOwner, dbContent, dbField, emptyLabel } = $props();

	let editing = $state(false);
	let currentContent = $state(dbContent);
	let originalContent = dbContent;
	const handleBlur = async () => {
		editing = false;
		if (currentContent === originalContent) return;
		await api.updateProfile({ [dbField]: currentContent });
		originalContent = currentContent;
		invalidateAll();
	};
	const resetBio = () => {
		currentContent = originalContent;
		editing = false;
	};
</script>

{#if !isOwner}
	{#if dbContent.trim() !== ''}
		<div class="field">
			<div class="row">
				{@render children()}
				{dbContent}
			</div>
		</div>
	{/if}
{:else}
	<div class="field-container">
		{#if !editing}
			<div class="field editable">
				<div class="row">
					{@render children()}
					{dbContent.trim() === '' ? `No ${emptyLabel}` : dbContent}
				</div>
			</div>
			<button
				class="edit-button"
				onclick={() => {
					editing = true;
				}}><PencilIcon /></button
			>
		{:else}
			<div class="row">
				{@render children()}
				<div
					class="field editable editing"
					contenteditable="plaintext-only"
					bind:innerText={currentContent}
					onblur={handleBlur}
					autofocus
					onkeydown={(e) => e.key === 'Escape' && resetBio()}
				></div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.field-container {
		position: relative;
		width: fit-content;
	}
	.field-container:hover {
		.edit-button {
			opacity: 1;
		}
		.field {
			filter: blur(1px);
		}
		.field.editing {
			filter: none;
		}
	}
	.edit-button {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		opacity: 0;
	}
	.field {
		cursor: default;
	}
	.field.editing:focus {
		outline: none;
		border: 1px solid var(--grey);
		border-radius: 10px;
		padding: 10px;
		cursor: text;
	}
	.row {
		gap: 0.5rem;
	}
</style>
