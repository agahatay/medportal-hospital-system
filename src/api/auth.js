import client from './client';

export const loginApi = async (email, password) => {
    // Axios client.post returns response.data directly due to interceptor
    return await client.post('/auth/login', { email, password });
};

export const registerApi = async (email, password, role, name) => {
    return await client.post('/auth/register', { email, password, role, name });
};
