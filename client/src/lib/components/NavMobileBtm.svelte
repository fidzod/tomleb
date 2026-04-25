<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { api } from '$lib/api';

	import { ui } from '$lib/state/ui.svelte.ts';
	import { Plus, House, Search, Bell, User, CornerDownRight } from '@lucide/svelte/icons';
    let { user } = $props();

	const handleLogout = async () => {
		await api.logout();
		await invalidateAll();
		goto('/');
	};
</script>

<div class="mobile-nav-bottom">
	<a href="/"><House /></a>
    {#if user}
    <a href="/profile/{user.username}" title="profile">
        <img src="{user.avatarUrl}" alt="avatar">
    </a>
	<button class="primary post-button" onclick={() => (ui.newPostOpen = true)}
		><Plus size={18} /></button
	>
	<button class="notifications-btn"><Bell /></button>
	<button onclick={handleLogout}><CornerDownRight /></button>
    {:else}
	<button onclick={() => (ui.loginModalOpen = true)}><User /></button>
    {/if}
</div>

<style>
	.mobile-nav-bottom {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		padding: 0.2rem 20px;
		gap: 5px;
		background-color: var(--bg);
		border: 2px solid var(--grey);
		border-radius: 18px;
		box-shadow: 0 3px 20px rgb(from var(--green) r g b / 0.2);
		z-index: 3;
	}

	button:not(.post-button) {
		padding: 0.6rem 15px;
		border: none;
		&:hover {
			background-color: var(--grey);
		}
	}

    a {
        display: flex;
        padding: 0.6rem 15px;
	    border-radius: 25px;
		&:hover {
			background-color: var(--grey);
            box-shadow: 0 5px 10px #fff2 inset;
		}
        &:active {
            translate: 0 2px;
        }
    }

    a img {
        width: 2rem;
        border-radius: 50%;
		object-fit: cover;
    }

	button.post-button {
		padding: 6px;
		border-radius: 50%;
		margin: 0 10px;
	}

    button.notifications-btn {
        position: relative;

        &::before {
            content: '';
            position: absolute;
            top: 4px;
            right: 5px;
            width: 0.5rem;
            height: 0.5rem;
            background-color: var(--red);
            border-radius: 50%;
        }
    }
</style>
