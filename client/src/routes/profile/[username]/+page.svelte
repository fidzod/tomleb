<script lang="ts">
	import Feed from '$lib/components/Feed.svelte';
	import EditableField from '$lib/components/profile/EditableField.svelte';
	import Avatar from '$lib/components/profile/Avatar.svelte';
	import Banner from '$lib/components/profile/Banner.svelte';

	import { MapPinIcon } from '@lucide/svelte/icons';
	import { ui } from '$lib/state/ui.svelte.js';

	let { data } = $props();

    ui.pageName = data.ownsProfile ? "Your Profile" : `${data.profile.displayName}'s Profile`;

</script>

<Banner isOwner={data.ownsProfile} bannerUrl={data.profile.bannerUrl} />

<div class="container">
	<div class="row">
		<Avatar isOwner={data.ownsProfile} avatarUrl={data.profile.avatarUrl} />
		<div class="usernames">
			<span>{data.profile.displayName}</span>
			<span>@{data.profile.username}</span>
		</div>
	</div>
	<div class="column">
		<EditableField
			isOwner={data.ownsProfile}
			dbContent={data.profile.bio ?? ''}
			dbField="bio"
			emptyLabel="bio"><div></div></EditableField
		>
		<EditableField
			isOwner={data.ownsProfile}
			dbContent={data.profile.location ?? ''}
			dbField="location"
			emptyLabel="location"
			><div style="margin-left: 8px"><MapPinIcon size={14} /></div></EditableField
		>
	</div>
</div>

<Feed
	posts={data.userPosts}
	hideNewPost={!data.ownsProfile}
	title={data.ownsProfile ? 'Your Feed' : `${data.profile.displayName}'s Feed`}
/>

<style>
	:root {
		--banner-height: 150px;
	}
	.container {
		width: calc(100% - 40px);
		margin: calc(var(--banner-height) / 2) 20px 0;
		display: flex;
		gap: 1rem;
		flex-direction: column;
		margin-bottom: 2rem;
	}
	.row {
		gap: 1rem;
		align-items: flex-start;
	}
	.column {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.usernames {
		height: fit-content;
		margin-top: 1.5rem;
		padding: 0.3rem 1rem;
		background-color: var(--grey);
		border-radius: 10px;
	}
</style>
