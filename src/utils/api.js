export const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    if (token) {
        const decryptedToken = decryptToken(token);
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${decryptedToken}`
        };
    }

    try {
        const response = await fetch(url, options);

        // التحقق من حالة التوكن
        if (response.status === 401) {
            localStorage.removeItem('token');
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
            window.location.href = '/login';
            return null;
        }

        return response;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}; 