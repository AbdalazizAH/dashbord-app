const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'your-secret-key';

export const encryptToken = (token) => {
    try {
        return btoa(encodeURIComponent(token));
    } catch {
        return token;
    }
};

export const decryptToken = (encryptedToken) => {
    try {
        return decodeURIComponent(atob(encryptedToken));
    } catch {
        return encryptedToken;
    }
};

export const getToken = () => {
    if (typeof window === 'undefined') return null;

    try {
        const encryptedToken = localStorage.getItem('token');
        if (!encryptedToken) return null;

        return decryptToken(encryptedToken);
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

export const setToken = (token) => {
    if (typeof window === 'undefined') return;

    try {
        const encryptedToken = encryptToken(token);
        localStorage.setItem('token', encryptedToken);
    } catch (error) {
        console.error('Error setting token:', error);
    }
};

export const removeToken = () => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem('token');
    } catch (error) {
        console.error('Error removing token:', error);
    }
};
