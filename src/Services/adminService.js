const API_URL = 'http://localhost:3001/api/admin';
import axios from 'axios';

export const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
};

export const getDashboardStats = async () => {
    const response = await fetch(`${API_URL}/stats`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch dashboard stats');
    }

    return data;
};

export const createUser = async (userData) => {
    const response = await axios.post(`${API_URL}/create-user`, userData, getAuthHeader());
    return response.data;
};



export const deactivateUser = async (userId) => {
    const response = await axios.post(`${API_URL}/users/${userId}/deactivate`, {}, getAuthHeader());
    return response.data;
};
