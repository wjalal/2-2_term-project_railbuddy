import { writable } from 'svelte/store';

export const userName = writable();
export const userType = writable();
export const loading = writable();
export const contactList = writable();