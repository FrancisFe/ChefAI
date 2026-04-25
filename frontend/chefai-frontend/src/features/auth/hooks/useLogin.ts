import {useMutation} from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import useAuthStore from '../../../store/authStore';
import { useNavigate } from 'react-router-dom';

interface LoginDto{
    email: string;
    password: string;
}

export function useLogin(){
    const login = useAuthStore(state => state.login);
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (data: LoginDto) => {
            const response = await apiClient.post('/auth/login', data);
            return response.data;
        },
        onSuccess: (data) => {
            login(data);
            navigate('/');
        },
        onError: (error) => {
            console.error('Login failed:', error);
        }
    });
}