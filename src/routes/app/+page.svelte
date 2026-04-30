<script lang="ts">
	import { supabase } from '$lib/supabaseClient';

	let uploadedUrl = $state('');
	let filePath = $state('');
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

		filePath = `${userId}/${safeFileName}`;

		const { error } = await supabase.storage.from('print_files').upload(filePath, file, {
			upsert: true
		});

		if (error) {
			uploadError = error.message;
			uploading = false;
			return;
		}

		uploading = false;
	}

	async function handleSubmission(event: Event) {
		event.preventDefault();

		if (!filePath) {
			uploadError = 'Please upload a file before submitting.';
			return;
		}

		// Insert into print_jobs table
		const { data, error } = await supabase
			.from('print_jobs')
			.insert({
				file_path: filePath,
				status: 'pending'
			})
			.select()
			.single();

		if (error) {
			uploadError = error.message || 'Failed to create print job.';
			return;
		}

		// Redirect to payment page with the new print job ID
		const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
			'create-checkout',
			{
				method: 'POST',
				body: JSON.stringify({
					jobId: data.id,
					filePath: filePath,
					isColor: false,
					merchantId: 'acct_1TRpgzJIiOyBdYrv'
				})
			}
		);

		if (checkoutError) {
			uploadError = checkoutError.message || 'Failed to create checkout session.';
			return;
		}

		// Redirect to the Stripe checkout page
		window.location.href = checkoutData.url;
	}
</script>

<main class="page-wrapper">
	<input type="file" onchange={handleFileChange} accept="image/*, .pdf" />

	{#if uploading}
		<p>Uploading file...</p>
	{/if}

	{#if uploadError}
		<p class="error">{uploadError}</p>
	{/if}

	{#if filePath}
		<p>
			File Path: {filePath}
		</p>
	{/if}

	<button disabled={uploading || !filePath} onclick={handleSubmission}>Pay</button>
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
