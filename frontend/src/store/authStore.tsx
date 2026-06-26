
import {create} from "zustand";
import {persist} from "zustand/middleware";

const AUTH_TOKEN_KEY = "token";
const AUTH_REFRESH_TOKEN_KEY = "refreshToken";
const AUTH_EXPIRES_AT_KEY = "expiresAt";
const AUTH_USER_ID_KEY = "userId";

interface AuthResponse {
    token: string;
    refreshToken: string;
    expiresAt: string;
}

interface AuthStore{
    isLoggedIn: boolean;
    token: string | null;
    refreshToken: string | null;
    expiresAt: string | null;
    userId: number | null;
    login: (data: AuthResponse) => void;
    logout: () => void;
    syncAuthState: () =>void;
}

function extractUserIdFromToken(token: string): number | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1]));
        return payload.userId || payload.sub || null;
    } catch {
        return null;
    }
}

const useAuthStore = create(
    persist<AuthStore>(
        (set) => ({
            isLoggedIn:false,
            token: null,
            refreshToken: null,
            expiresAt: null,
            userId: null,
            login: (data: AuthResponse) =>{
                const userId = extractUserIdFromToken(data.token);
                localStorage.setItem(AUTH_TOKEN_KEY, data.token);
                localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, data.refreshToken);
                localStorage.setItem(AUTH_EXPIRES_AT_KEY, data.expiresAt);
                if (userId) localStorage.setItem(AUTH_USER_ID_KEY, String(userId));
                set({
                    isLoggedIn: true,
                    token: data.token,
                    refreshToken: data.refreshToken,
                    expiresAt: data.expiresAt,
                    userId
                });
            },
            logout: () =>{
                set({
                    isLoggedIn:false,
                    token: null,
                    refreshToken: null,
                    expiresAt: null,
                    userId: null
                });
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
                localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
                localStorage.removeItem(AUTH_USER_ID_KEY);
            },
            syncAuthState: () =>{
                const token = localStorage.getItem(AUTH_TOKEN_KEY);
                const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
                const expiresAt = localStorage.getItem(AUTH_EXPIRES_AT_KEY);
                const storedUserId = localStorage.getItem(AUTH_USER_ID_KEY);
                const userId = token ? extractUserIdFromToken(token) : (storedUserId ? parseInt(storedUserId, 10) : null);
                set({
                    isLoggedIn:Boolean(token),
                    token: token || null,
                    refreshToken: refreshToken || null,
                    expiresAt: expiresAt || null,
                    userId
                });
            },

        }),
        {
            name: "userLoginStatus",
        }
    )
);

export default useAuthStore;

