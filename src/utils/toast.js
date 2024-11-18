import toast from 'react-hot-toast';

export const showToast = {
    success: (message) => {
        toast.success(message, {
            style: {
                background: '#10B981',
                color: '#fff',
                direction: 'rtl'
            },
            duration: 3000
        });
    },
    error: (message) => {
        toast.error(message, {
            style: {
                background: '#EF4444',
                color: '#fff',
                direction: 'rtl'
            },
            duration: 3000
        });
    },
    loading: (message) => {
        return toast.loading(message, {
            style: {
                direction: 'rtl'
            }
        });
    },
    dismiss: (toastId) => {
        toast.dismiss(toastId);
    }
}; 