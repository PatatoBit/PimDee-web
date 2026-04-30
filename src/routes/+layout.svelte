<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import Auth from '../components/Auth.svelte';
	import '../styles/global.scss';

	let { children } = $props();
</script>

<Auth />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
