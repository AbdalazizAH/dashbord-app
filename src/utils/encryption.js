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
