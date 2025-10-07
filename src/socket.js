import { io } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_BASE_API_URL;

// "undefined" means the URL will be computed from the `window.location` object
const URL = apiUrl;

export const socket = io(URL,{autoConnect : false});