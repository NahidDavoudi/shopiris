/**
 * app.config.js — infrastructure settings (constant across stores)
 */
export default {
  app: {
    name: 'IRIS',
    locale: 'en-US',
  },

  api: {
    baseUrl: 'https://api.shopiris.ir/api/v1',
    timeout: 30000,
    retries: 1,
    retryDelay: 600,
    autoRefresh: true,
  },

  storage: {
    token: 'gb_token',
    refreshToken: 'gb_refresh',
    role: 'gb_role',
    user: 'gb_user',
    guestCart: 'gb_guest_cart',
  },

  messages: {
    network: 'Connection error. Check your internet connection.',
    timeout: 'The request timed out. Please try again.',
    parse: 'The server response could not be processed.',
    unknown: 'An unknown error occurred.',
    unauthorized: 'Your session has expired. Please log in again.',
    forbidden: 'You are not allowed to perform this action.',
    notFound: 'The requested item was not found.',
    validation: 'Please check the entered information.',
    rateLimit: 'Too many requests. Please wait a moment.',
    server: 'Internal server error. Try again later.',
  },

  fallback: {
    products: [],
    categories: [],
    settings: null,
    cart: { items: [], total: 0 },
  },

  hooks: {
    onUnauthorized: null,
    onError: null,
  },
};
