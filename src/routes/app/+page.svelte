<script lang="ts">
	import { supabase } from '$lib/supabaseClient';

	let uploadedUrl = $state('');
	let uploading = $state(false);
	let uploadError = $state('');

	async function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) {
			return;
		}

		uploading = true;
		uploadError = '';
		uploadedUrl = '';

		const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

		const { data: userData, error: userErr } = await supabase.auth.getUser();
		if (userErr) {
			uploadError = userErr.message || 'Unable to determine user';
			uploading = false;
			return;
		}

		const userId = userData?.user?.id;
		if (!userId) {
			uploadError = 'User not authenticated';
			uploading = false;
			return;
		}

		const filePath = `${userId}/${safeFileName}`;

		const { error } = await supabase.storage.from('print_files').upload(filePath, file, {
			upsert: false
		});

		if (error) {
			uploadError = error.message;
			uploading = false;
			return;
		}

		const { data } = supabase.storage.from('print_files').getPublicUrl(filePath);
		uploadedUrl = data.publicUrl;
		uploading = false;
	}
</script>

<main class="page-wrapper">
	<input type="file" onchange={handleFileChange} />

	{#if uploading}
		<p>Uploading file...</p>
	{/if}

	{#if uploadError}
		<p class="error">{uploadError}</p>
	{/if}

	{#if uploadedUrl}
		<p>
			Link URL: <a href={uploadedUrl} target="_blank" rel="noreferrer">{uploadedUrl}</a>
		</p>
	{/if}
</main>

<style lang="scss">
	.page-wrapper {
		padding-top: 1.5rem;
		display: grid;
		gap: 1rem;
	}

	.error {
		color: #b42318;
	}
</style>
