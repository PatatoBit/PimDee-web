<script lang="ts">
	import StorePreview from '../components/StorePreview.svelte';
	import { stores } from '../lib/dummy';
</script>

<div class="page-wrapper">
	<div class="topper">
		<h2>ร้านทั้งหมด</h2>
	</div>

	<div class="stores">
		{#each stores as store (store.name)}
			<StorePreview
				id={store.id}
				name={store.name}
				location={store.location}
				profile_url={store.profile_url}
				status={store.status}
				distance={store.distance}
			/>
		{/each}
	</div>
</div>

<style lang="scss">
	.page-wrapper {
		padding-top: 1.5rem;
	}

	.topper {
		margin-bottom: 1rem;
	}

	.stores {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
