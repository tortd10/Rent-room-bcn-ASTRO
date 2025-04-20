export type Flat = {
	flat_id: string;
	title: string;
	street?: string;
	available?: boolean;
  };
  
  export type Room = {
	id: number;
	slug: string;
	name: string;
	flat_id: string;
	available: boolean;
	status: 'available' | 'soon';
	imageSrc?: string;
	imageAlt?: string;
  };