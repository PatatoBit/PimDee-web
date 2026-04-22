export interface StoreProps {
	id: number;
	name: string;
	location: string;
	profile_url: string;
	status: string;
	distance: number;
}

export const stores = [
	{
		id: 1,
		name: 'ร้านถ่ายเอกสารศิลปกรรม 3',
		location: 'อาคารศิลปกรรม 3, โรงอาหารอักษร จุฬาฯ',
		profile_url: 'https://placehold.co/400',
		status: 'open',
		distance: 2.5
	},
	{
		id: 2,
		name: 'ร้าน B',
		location: 'เชียงใหม่',
		profile_url: 'https://placehold.co/400',
		status: 'closed',
		distance: 5.0
	},
	{
		id: 3,
		name: 'ร้าน C',
		location: 'ภูเก็ต',
		profile_url: 'https://placehold.co/400',
		status: 'open',
		distance: 1.2
	}
];
