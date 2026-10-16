import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as Window & { Pusher?: typeof Pusher }).Pusher = Pusher;

export const echo = new Echo({
  broadcaster: 'reverb', // o 'pusher' depende sa ginagamit mo sa Laravel .env
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST ?? '127.0.0.1',
  wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
  enabledTransports: ['ws', 'wss'],
});