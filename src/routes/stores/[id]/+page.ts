import { error } from '@sveltejs/kit';
import { stores } from '$lib/dummy';

export function load({ params }) {
	const id = Number(params.id);

	if (!Number.isInteger(id)) {
		throw error(404, 'Store not found');
	}

	const store = stores.find((item) => item.id === id);

	if (!store) {
		throw error(404, 'Store not found');
	}

	return { store };
}
