<script lang="ts">
	let { data } = $props();
	const store = $derived(data.store);
</script>

<div class="page-wrapper">
	<div class="topper">
		<a href="/" class="back-link">&larr; กลับไปรายการร้าน</a>
	</div>

	<div class="banner">
		<img src={store.profile_url} alt="Profile" class="store-profile-image" />
	</div>

	<h2 class="store-name">{store.name}</h2>
	<p class="store-location">{store.location}</p>

	<div class="tags">
		<div class="tag">
			<p class="store-status">{store.status}</p>
		</div>

		<div class="tag">
			<p class="store-distance">{store.distance} km</p>
		</div>
	</div>

	<div class="map">
		<p>Map placeholder</p>
	</div>
</div>

<nav>
	<!-- File dropper -->
</nav>

<style lang="scss">
	.page-wrapper {
		position: relative;
	}

	.topper {
		position: absolute;
		top: 20px;
		left: 40px;
	}

	.banner {
		width: 100%;
		height: 200px;
		overflow: hidden;
		margin-bottom: 1rem;
	}

	.store-profile-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	nav {
		position: absolute;
		top: 20px;
		left: 40px;
	}

	.tags {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;

		.tag {
			background-color: #e0e0e0;
			padding: 0.25rem 0.5rem;
			border-radius: 4px;
			font-size: 0.875rem;
		}
	}

	.map {
		margin-top: 1.5rem;
		height: 200px;
		background-color: #7aaace;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
