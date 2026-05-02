<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';

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

	const storeId = 'fde89974-1473-4445-bf25-68486496b328';
	let storeName = $state('');
	let printerName = $state('');

	// Get store name and printer name

	onMount(async () => {
		const { data: storeData, error: storeError } = await supabase
			.from('stores')
			.select('name')
			.eq('id', storeId)
			.single();

		if (storeError) {
			storeName = 'Unknown Store';
		} else {
			storeName = storeData.name;
		}

		// Fetch default printer using the store ID
		const { data: printerData, error: printerError } = await supabase
			.from('printers')
			.select('system_name')
			.eq('store_id', storeId)
			.eq('is_default', true)
			.single();

		if (printerError) {
			printerName = 'Unknown Printer';
		} else {
			printerName = printerData.system_name;
		}
	});
</script>

<main class="page-wrapper">
	<h2>Upload Your File to {storeName}</h2>
	<p>Default Printer: {printerName}</p>

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
