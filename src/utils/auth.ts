import Cookies from "js-cookie";

const TOKEN_KEY = "token";

// matches Access_token_expiry_time on the backend, so the cookie disappears when the token expires
const TOKEN_LIFETIME_MINUTES = 30;

export const getToken = () => Cookies.get(TOKEN_KEY);

export const setToken = (token: string) =>
    Cookies.set(TOKEN_KEY, token, { expires: TOKEN_LIFETIME_MINUTES / (24 * 60) });

export const clearToken = () => Cookies.remove(TOKEN_KEY);
