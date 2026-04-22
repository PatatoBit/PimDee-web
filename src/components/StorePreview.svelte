<script lang="ts">
	import type { StoreProps } from '$lib/dummy';

	let { id, name, location, profile_url, status, distance }: StoreProps = $props();
</script>

<a href={`/stores/${id}`} class="store-link">
	<div class="store-preview">
		<div class="profile-preview">
			<img src={profile_url} alt="Profile" class="profile-image" />
		</div>

		<div class="info">
			<h3 class="name truncate">{name}</h3>
			<p class="location truncate">{location}</p>
			<p class="status">{status}</p>
			<p>{distance} km</p>
		</div>
	</div>
</a>

<style lang="scss">
	.store-preview {
		display: flex;
		flex-direction: row;
		width: 100%;
		height: 10rem;
		gap: 1rem;
	}

	.profile-preview {
		height: 100%;
		aspect-ratio: 1/1;
		overflow: hidden;
		flex: 0 0 auto;

		border-radius: 0.3rem;
	}

	.profile-image {
		display: block;
		width: 100%;
		height: 100%;

		flex: 0 0 auto;
		object-fit: cover;
	}

	.info {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-width: 0;
		height: 100%;
		gap: 0.5rem;
	}
</style>
