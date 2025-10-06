import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = 'https://sync2play-api.my.id';

export const socket = io(URL,{autoConnect : false});