<script lang="ts">
	import { onMount } from 'svelte';
	import type { Session } from '@supabase/supabase-js';
	import { supabase } from '$lib/supabaseClient';

	let userEmail = $state('');
	let session = $state<Session | null>(null);
	let statusMessage = $state('');
	let isLoading = $state(false);

	async function signInWithEmail(event: SubmitEvent) {
		event.preventDefault();

		if (!userEmail.trim()) {
			statusMessage = 'Enter an email address first.';
			return;
		}

		isLoading = true;
		statusMessage = '';

		const redirectTo = `${window.location.origin}/app`;
		const { error } = await supabase.auth.signInWithOtp({
			email: userEmail.trim(),
			options: {
				shouldCreateUser: true,
				emailRedirectTo: redirectTo
			}
		});

		isLoading = false;
		statusMessage = error
			? error.message
			: 'Magic link sent. Check your email and use the link to finish signing in.';
	}

	async function signOut() {
		isLoading = true;
		statusMessage = '';

		const { error } = await supabase.auth.signOut();
		isLoading = false;
		statusMessage = error ? error.message : 'Signed out.';
	}

	onMount(() => {
		let active = true;
		let subscription: { unsubscribe: () => void } | undefined;

		(async () => {
			const url = new URL(window.location.href);
			const code = url.searchParams.get('code');

			if (code) {
				const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

				if (error) {
					statusMessage = error.message;
				} else {
					url.searchParams.delete('code');
					url.searchParams.delete('state');
					window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
					statusMessage = 'Signed in successfully.';
				}
			}

			const { data } = await supabase.auth.getSession();
			if (active) {
				session = data.session;
			}

			const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
				session = nextSession;
			});
			subscription = listener.subscription;
		})();

		return () => {
			active = false;
			subscription?.unsubscribe();
		};
	});
</script>

<div class="auth-panel">
	{#if session}
		<div class="auth-status">
			<div>
				<p class="eyebrow">Signed in</p>
				<p class="email">{session.user.email}</p>
			</div>
			<button type="button" onclick={signOut} disabled={isLoading}>Sign out</button>
		</div>
	{:else}
		<form class="auth-form" onsubmit={signInWithEmail}>
			<label>
				<span>Email</span>
				<input type="email" placeholder="Enter your email" bind:value={userEmail} />
			</label>
			<button type="submit" disabled={isLoading}>Send magic link</button>
		</form>
	{/if}

	{#if statusMessage}
		<p class="status">{statusMessage}</p>
	{/if}
</div>

<style lang="scss">
	.auth-panel {
		display: grid;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.08);
		background: rgba(255, 255, 255, 0.72);
		backdrop-filter: blur(12px);
	}

	.auth-form {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: end;
	}

	.auth-form label {
		display: grid;
		gap: 0.35rem;
	}

	.auth-form span,
	.eyebrow {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgba(0, 0, 0, 0.6);
	}

	.email {
		font-weight: 600;
	}

	.auth-form input {
		min-width: 0;
		padding: 0.8rem 0.9rem;
		border: 1px solid rgba(0, 0, 0, 0.14);
		border-radius: 0.85rem;
		background: white;
	}

	.auth-form button,
	.auth-status button {
		padding: 0.8rem 1rem;
		border: 0;
		border-radius: 0.85rem;
		background: #111827;
		color: white;
		font-weight: 600;
		cursor: pointer;
	}

	.auth-form button:disabled,
	.auth-status button:disabled {
		opacity: 0.7;
		cursor: wait;
	}

	.auth-status {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.status {
		margin: 0;
		font-size: 0.95rem;
		color: rgba(0, 0, 0, 0.72);
	}

	@media (max-width: 640px) {
		.auth-form {
			grid-template-columns: 1fr;
		}

		.auth-status {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
