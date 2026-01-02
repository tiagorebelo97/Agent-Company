import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3001';

export const socket = io(API_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
});

export default socket;
