<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ui } from '$lib/state/ui.svelte';
	import { api } from '$lib/api';

	import Modal from '$lib/components/Modal.svelte';
	import Switch from '$lib/components/Switch.svelte';

	let closeModal = () => (ui.loginModalOpen = false);

	let authState: 'login' | 'register' = $state('login');

	type RegisterState =
		| { mode: 'create-account' }
		| { mode: 'create-profile'; email: string; password: string };
	let registerState: RegisterState = $state({ mode: 'create-account' });

	const switchAuthState = (newState: string) => {
		authState = newState === 'Log In' ? 'login' : 'register';
	};

	let email = $state('');
	let password = $state('');
	let username = $state('');
	let displayName = $state('');
	let error = $state('');

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		error = '';

		let resError;

		if (authState === 'login') {
			resError = await api.login(email, password);
		} else if (authState === 'register' && registerState.mode === 'create-account') {
			registerState = { mode: 'create-profile', email, password };
			return;
		} else if (authState === 'register' && registerState.mode === 'create-profile') {
			resError = await api.register(
				registerState.email,
				registerState.password,
				username,
				displayName
			);
		}

		if (resError) return (error = resError);

		closeModal();
		await invalidateAll();
	};
</script>

<Modal closeModal={() => ui.loginModalOpen = false}>
    <Switch
        optionA="Log In"
        optionB="Sign Up"
        onSwitched={(selection: string) => {
            switchAuthState(selection);
        }}
    />
    <span>
        {authState === 'login'
            ? 'Welcome back.'
            : registerState.mode === 'create-account'
                ? 'Welcome to tomleb.'
                : 'Create your account'}
    </span>
    <form onsubmit={handleSubmit}>
        {#if registerState.mode === 'create-profile'}
            <input type="text" placeholder="Username" bind:value={username} />
            <input type="text" placeholder="Display Name" bind:value={displayName} />
        {:else}
            <input type="text" placeholder="Email" bind:value={email} />
            <input type="password" placeholder="Password" bind:value={password} />
        {/if}
        {#if error}
            <span role="alert">{error}</span>
        {/if}
        <button type="submit"
            >{authState === 'login'
                ? 'Log In'
                : registerState.mode === 'create-account'
                    ? 'Register'
                    : 'Get Started'}</button
        >
    </form>
</Modal>
