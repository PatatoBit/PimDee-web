<script lang="ts">
	import StorePreview from '../components/StorePreview.svelte';

	let stores = [
		{
			name: 'ร้านถ่ายเอกสารศิลปกรรม 3',
			location: 'อาคารศิลปกรรม 3, โรงอาหารอักษร จุฬาฯ',
			profile_url: 'https://placehold.co/400',
			status: 'open',
			distance: 2.5
		},
		{
			name: 'ร้าน B',
			location: 'เชียงใหม่',
			profile_url: 'https://placehold.co/400',
			status: 'closed',
			distance: 5.0
		},
		{
			name: 'ร้าน C',
			location: 'ภูเก็ต',
			profile_url: 'https://placehold.co/400',
			status: 'open',
			distance: 1.2
		}
	];
</script>

<div class="page-wrapper">
	<div class="topper">
		<h2>ร้านทั้งหมด</h2>
	</div>

	<div class="stores">
		{#each stores as store (store.name)}
			<StorePreview
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
	.topper {
		margin-bottom: 1rem;
	}

	.stores {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
